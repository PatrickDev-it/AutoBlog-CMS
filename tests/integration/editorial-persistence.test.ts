import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { EditorialService } from '@/src/modules/editorial/service';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';
import { AppError } from '@/src/platform/observability/errors';

let database: DatabaseContext;
let databasePath: string;
let service: EditorialService;

const context = (role: MembershipContext['role'], userId = `demo-${role.toLowerCase()}`): MembershipContext => ({
	workspaceId: DEMO_WORKSPACE_ID,
	workspaceSlug: 'demo',
	workspaceName: 'AutoBlog Editorial Lab',
	userId,
	userName: role,
	userEmail: `${role.toLowerCase()}@demo.autoblog.local`,
	role,
});

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	databasePath = join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/');
	database = createDatabase(`file:${databasePath}`);
	await migrateDatabase(database.client);
	await seedDemo(database);
	service = new EditorialService(new DrizzleEditorialRepository(database));
});

afterEach(async () => {
	database.client.close();
});

describe('durable editorial repository', () => {
	it('migrates from empty, creates a post, and persists it after reconnect', async () => {
		const created = await service.create(context('Author'), { title: 'Durable product evidence', excerpt: 'A restart test.', content: 'Persist this revision.' }, 'request-create');
		expect(created.version).toBe(1);
		database.client.close();

		database = createDatabase(`file:${databasePath}`);
		const reopened = new EditorialService(new DrizzleEditorialRepository(database));
		const found = await reopened.get(context('Author'), created.id);
		expect(found.content).toBe('Persist this revision.');
		expect(await migrateDatabase(database.client)).toEqual([]);
	});

	it('creates immutable revisions and rejects a concurrent stale writer', async () => {
		const author = context('Author');
		const initial = await service.get(author, 'post-editorial-systems');
		const saved = await service.save(author, initial.id, { expectedVersion: initial.version, title: initial.title, excerpt: initial.excerpt, content: `${initial.content}\n\nWriter A.` }, 'request-a');
		expect(saved.version).toBe(initial.version + 1);

		await expect(service.save(author, initial.id, { expectedVersion: initial.version, title: initial.title, excerpt: initial.excerpt, content: 'Writer B stale content.' }, 'request-b'))
			.rejects.toMatchObject({ code: 'VERSION_CONFLICT', status: 409 });
		const current = await service.get(author, initial.id);
		expect(current.content).toContain('Writer A.');
		expect(current.content).not.toContain('Writer B');
	});

	it('denies Reviewer creation and Author edits to another author', async () => {
		await expect(service.create(context('Reviewer'), { title: 'Forbidden draft', excerpt: '', content: '' }, 'request-denied'))
			.rejects.toBeInstanceOf(AppError);
		const editorPost = await service.create(context('Editor'), { title: 'Editor-owned post', excerpt: '', content: '' }, 'request-editor');
		await expect(service.save(context('Author'), editorPost.id, { expectedVersion: 1, title: editorPost.title, excerpt: '', content: 'Unauthorized.' }, 'request-author'))
			.rejects.toMatchObject({ code: 'FORBIDDEN' });
	});

	it('isolates workspace identifiers at the repository boundary', async () => {
		const repository = new DrizzleEditorialRepository(database);
		expect(await repository.find('ws-not-the-demo', 'post-editorial-systems')).toBeNull();
		expect(await repository.list('ws-not-the-demo')).toEqual([]);
	});
});
