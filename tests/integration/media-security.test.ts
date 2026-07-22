import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import sharp from 'sharp';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { DatabaseMediaProvider } from '@/src/modules/media/database-provider';
import { DrizzleMediaRepository } from '@/src/modules/media/drizzle-repository';
import { MediaCleanupWorker } from '@/src/modules/media/cleanup-worker';
import type { MediaProvider } from '@/src/modules/media/provider';
import { MediaService } from '@/src/modules/media/service';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

class MemoryMediaProvider implements MediaProvider {
	readonly objects = new Map<string, Buffer>();
	failPut = false;
	failDelete = false;

	async put(key: string, data: Buffer, signal: AbortSignal) {
		signal.throwIfAborted();
		if (this.failPut) throw new Error('injected provider failure');
		this.objects.set(key, data);
	}
	async get(key: string, signal: AbortSignal) { signal.throwIfAborted(); return this.objects.get(key) ?? null; }
	async delete(key: string, signal: AbortSignal) { signal.throwIfAborted(); if (this.failDelete) throw new Error('injected cleanup failure'); this.objects.delete(key); }
}

let database: DatabaseContext;
let repository: DrizzleMediaRepository;
let provider: MemoryMediaProvider;
let service: MediaService;
let png: Buffer;

const context = (role: MembershipContext['role'], workspaceId = DEMO_WORKSPACE_ID): MembershipContext => ({
	workspaceId, workspaceSlug: 'demo', workspaceName: 'AutoBlog Editorial Lab', userId: `demo-${role.toLowerCase()}`,
	userName: role, userEmail: `${role.toLowerCase()}@demo.autoblog.local`, role,
});

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	database = createDatabase(`file:${join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/')}`);
	await migrateDatabase(database.client); await seedDemo(database);
	repository = new DrizzleMediaRepository(database); provider = new MemoryMediaProvider();
	service = new MediaService(repository, provider, 1_000_000);
	png = await sharp({ create: { width: 80, height: 60, channels: 3, background: '#c8ff5a' } }).png().toBuffer();
});

afterEach(() => database.client.close());

const upload = (replaceAssetId?: string) => service.upload(context('Author'), {
	postId: 'post-editorial-systems', altText: 'Editorial cover', fileName: '../cover.png',
	declaredMimeType: 'image/png', data: png, ...(replaceAssetId ? { replaceAssetId } : {}),
}, crypto.randomUUID());

describe('media security and compensation', () => {
	it('preserves the active asset when replacement provider storage fails', async () => {
		const active = await upload();
		provider.failPut = true;
		await expect(upload(active.id)).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
		expect(await service.list(context('Author'), 'post-editorial-systems')).toEqual([expect.objectContaining({ id: active.id, status: 'active' })]);
		expect((await repository.find(DEMO_WORKSPACE_ID, active.id))?.status).toBe('active');
	});

	it('activates a verified replacement before idempotent cleanup removes the old object', async () => {
		const oldAsset = await upload();
		const oldStored = await repository.find(DEMO_WORKSPACE_ID, oldAsset.id);
		const replacement = await upload(oldAsset.id);
		expect(replacement.replacesAssetId).toBe(oldAsset.id);
		expect((await repository.find(DEMO_WORKSPACE_ID, oldAsset.id))?.status).toBe('replaced');
		expect((await service.list(context('Author'), 'post-editorial-systems')).map((asset) => asset.id)).toEqual([replacement.id]);
		const worker = new MediaCleanupWorker(database, provider);
		provider.failDelete = true;
		expect(await worker.run(new Date(Date.now() + 1000))).toEqual({ claimed: 1, completed: 0, failed: 1 });
		expect((await service.read(context('Author'), replacement.id)).data).toEqual(png);
		provider.failDelete = false;
		expect(await worker.run(new Date(Date.now() + 120_000))).toEqual({ claimed: 1, completed: 1, failed: 0 });
		expect(await worker.run(new Date(Date.now() + 121_000))).toEqual({ claimed: 0, completed: 0, failed: 0 });
		expect(provider.objects.has(oldStored?.storageKey ?? '')).toBe(false);
		expect((await service.read(context('Author'), replacement.id)).data).toEqual(png);
	});

	it('compensates a metadata finalization failure without exposing an orphan', async () => {
		class FailingRepository extends DrizzleMediaRepository {
			override async finalize(): Promise<never> { throw new Error('injected metadata failure'); }
		}
		const failing = new MediaService(new FailingRepository(database), provider, 1_000_000);
		await expect(failing.upload(context('Author'), {
			postId: 'post-editorial-systems', altText: '', fileName: 'cover.png', declaredMimeType: 'image/png', data: png,
		}, 'metadata-failure')).rejects.toThrow('injected metadata failure');
		expect(provider.objects.size).toBe(0);
	});

	it('rejects forged and oversized content before provider storage and isolates workspace reads', async () => {
		await expect(service.upload(context('Author'), {
			postId: 'post-editorial-systems', fileName: 'forged.jpg', declaredMimeType: 'image/jpeg', data: png,
		}, 'forged')).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
		const tinyLimit = new MediaService(repository, provider, png.byteLength - 1);
		await expect(tinyLimit.upload(context('Author'), {
			postId: 'post-editorial-systems', fileName: 'large.png', declaredMimeType: 'image/png', data: png,
		}, 'oversize')).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
		expect(provider.objects.size).toBe(0);
		const asset = await upload();
		await expect(service.read(context('Author', 'different-workspace'), asset.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
	});

	it('requires deletion policy and completes durable cleanup', async () => {
		const asset = await upload();
		await expect(service.delete(context('Author'), asset.id, 'delete-denied')).rejects.toMatchObject({ code: 'FORBIDDEN' });
		await service.delete(context('Editor'), asset.id, 'delete-allowed');
		await expect(service.read(context('Editor'), asset.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
		const worker = new MediaCleanupWorker(database, provider);
		expect((await worker.run(new Date(Date.now() + 1000))).completed).toBe(1);
		expect((await repository.find(DEMO_WORKSPACE_ID, asset.id))?.status).toBe('deleted');
	});

	it('database provider stores opaque data durably', async () => {
		const durable = new DatabaseMediaProvider(database);
		const key = `${DEMO_WORKSPACE_ID}/provider-contract`;
		const signal = new AbortController().signal;
		await durable.put(key, png, signal);
		expect(await durable.get(key, signal)).toEqual(png);
		await durable.delete(key, signal);
		expect(await durable.get(key, signal)).toBeNull();
	});
});
