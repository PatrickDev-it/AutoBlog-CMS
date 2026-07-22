import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DrizzleDemoRepository } from '@/src/modules/identity/drizzle-demo-repository';
import { DemoService } from '@/src/modules/identity/demo-service';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { auditEvents, idempotencyRecords, mediaObjects, posts, workspaces } from '@/src/platform/db/schema';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

let database: DatabaseContext;
let service: DemoService;

const context = (role: MembershipContext['role'], workspaceId = DEMO_WORKSPACE_ID): MembershipContext => ({
	workspaceId, workspaceSlug: workspaceId, workspaceName: 'Workspace', userId: `demo-${role.toLowerCase()}`,
	userName: role, userEmail: `${role.toLowerCase()}@demo.autoblog.local`, role,
});

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	database = createDatabase(`file:${join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/')}`);
	await migrateDatabase(database.client); await seedDemo(database);
	service = new DemoService(new DrizzleDemoRepository(database));
});

afterEach(() => database.client.close());

describe('bounded demo reset', () => {
	it('restores the fixture, removes only demo objects and preserves unrelated workspace data', async () => {
		const now = new Date();
		await database.db.insert(workspaces).values({ id: 'ws-configured', slug: 'configured', name: 'Configured workspace', isDemo: false, createdAt: now, updatedAt: now });
		await database.db.insert(mediaObjects).values([
			{ storageKey: 'ws-demo/orphan-object', data: Buffer.from('demo'), createdAt: now },
			{ storageKey: 'ws-configured/object', data: Buffer.from('configured'), createdAt: now },
		]);
		await database.db.update(posts).set({ title: 'Mutated demo title' }).where(eq(posts.id, 'post-editorial-systems'));
		const result = await service.reset(context('Owner'), { idempotencyKey: 'reset-fixture-once' }, 'reset-request');
		expect(result).toMatchObject({ fixtureVersion: 1, alreadyApplied: false });
		const [restored] = await database.db.select().from(posts).where(eq(posts.id, 'post-editorial-systems'));
		expect(restored?.title).toBe('Designing the next editorial operating system');
		expect(await database.db.select().from(workspaces).where(eq(workspaces.id, 'ws-configured'))).toHaveLength(1);
		expect(await database.db.select().from(mediaObjects).where(eq(mediaObjects.storageKey, 'ws-demo/orphan-object'))).toHaveLength(0);
		expect(await database.db.select().from(mediaObjects).where(eq(mediaObjects.storageKey, 'ws-configured/object'))).toHaveLength(1);
	});

	it('returns the persisted result for a repeated idempotency key without another reset audit', async () => {
		const first = await service.reset(context('Owner'), { idempotencyKey: 'repeatable-reset-key' }, 'reset-first');
		const second = await service.reset(context('Owner'), { idempotencyKey: 'repeatable-reset-key' }, 'reset-second');
		expect(second).toEqual({ ...first, alreadyApplied: true });
		expect(await database.db.select().from(idempotencyRecords)).toHaveLength(1);
		expect(await database.db.select().from(auditEvents).where(eq(auditEvents.action, 'demo.reset'))).toHaveLength(1);
	});

	it('denies Reviewer and any non-demo workspace', async () => {
		await expect(service.reset(context('Reviewer'), { idempotencyKey: 'reviewer-reset-key' }, 'reviewer')).rejects.toMatchObject({ code: 'FORBIDDEN' });
		const now = new Date();
		await database.db.insert(workspaces).values({ id: 'ws-real', slug: 'real', name: 'Real', isDemo: false, createdAt: now, updatedAt: now });
		await expect(service.reset(context('Owner', 'ws-real'), { idempotencyKey: 'real-workspace-key' }, 'real')).rejects.toMatchObject({ code: 'FORBIDDEN' });
	});

	it('rate limits distinct reset operations while idempotent retries remain free', async () => {
		for (let index = 0; index < 3; index += 1) await service.reset(context('Owner'), { idempotencyKey: `bounded-reset-${index}` }, `bounded-${index}`);
		await expect(service.reset(context('Owner'), { idempotencyKey: 'bounded-reset-fourth' }, 'bounded-fourth')).rejects.toMatchObject({ code: 'RATE_LIMITED' });
		await expect(service.reset(context('Owner'), { idempotencyKey: 'bounded-reset-0' }, 'bounded-repeat')).resolves.toMatchObject({ alreadyApplied: true });
	});
});
