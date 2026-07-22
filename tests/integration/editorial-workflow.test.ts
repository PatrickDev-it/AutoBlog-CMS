import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { EditorialService } from '@/src/modules/editorial/service';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { auditEvents, jobs, publications, revisions } from '@/src/platform/db/schema';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

let database: DatabaseContext;
let repository: DrizzleEditorialRepository;
let service: EditorialService;

const context = (role: MembershipContext['role']): MembershipContext => ({
	workspaceId: DEMO_WORKSPACE_ID,
	workspaceSlug: 'demo',
	workspaceName: 'AutoBlog Editorial Lab',
	userId: `demo-${role.toLowerCase()}`,
	userName: role,
	userEmail: `${role.toLowerCase()}@demo.autoblog.local`,
	role,
});

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	const path = join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/');
	database = createDatabase(`file:${path}`);
	await migrateDatabase(database.client);
	await seedDemo(database);
	repository = new DrizzleEditorialRepository(database);
	service = new EditorialService(repository);
});

afterEach(() => database.client.close());

describe('editorial reliability', () => {
	it('runs author-reviewer-editor publication while later edits preserve the published revision', async () => {
		const author = context('Author');
		const reviewer = context('Reviewer');
		const editor = context('Editor');
		const draft = await service.get(author, 'post-editorial-systems');
		const submitted = await service.transition(author, draft.id, { expectedVersion: draft.version, action: 'submit' }, 'submit');
		expect(submitted.state).toBe('InReview');
		const approved = await service.transition(reviewer, draft.id, { expectedVersion: submitted.version, action: 'approve' }, 'approve');
		expect(approved.state).toBe('Approved');
		const published = await service.transition(editor, draft.id, {
			expectedVersion: approved.version, action: 'publish', idempotencyKey: 'publish:flagship:1',
		}, 'publish');
		expect(published.state).toBe('Published');

		const publicBeforeEdit = await service.publicPost('demo', draft.slug);
		const laterDraft = await service.save(editor, draft.id, {
			expectedVersion: published.version, title: 'A later private draft', excerpt: published.excerpt, content: 'Not public yet.',
		}, 'later-edit');
		expect(laterDraft.state).toBe('Draft');
		expect(laterDraft.publishedRevisionId).toBe(publicBeforeEdit.revisionId);
		expect((await service.publicPost('demo', draft.slug)).content).toBe(publicBeforeEdit.content);
	});

	it('restores by appending a new immutable revision and rejects stale restore', async () => {
		const author = context('Author');
		const current = await service.get(author, 'post-editorial-systems');
		const history = await service.revisions(author, current.id);
		const oldest = history.at(-1);
		if (!oldest) throw new Error('Seed history is empty.');
		const restored = await service.restore(author, current.id, { expectedVersion: current.version, revisionId: oldest.id }, 'restore');
		expect(restored.version).toBe(current.version + 1);
		expect(restored.content).toBe(oldest.content);
		const after = await service.revisions(author, current.id);
		expect(after).toHaveLength(history.length + 1);
		expect(after[0]?.restoredFromRevisionId).toBe(oldest.id);
		expect(after.at(-1)).toEqual(oldest);
		await expect(service.restore(author, current.id, { expectedVersion: current.version, revisionId: oldest.id }, 'stale-restore'))
			.rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
	});

	it('leases and publishes a pinned scheduled revision exactly once', async () => {
		const reviewer = context('Reviewer');
		const editor = context('Editor');
		const reviewed = await service.get(reviewer, 'post-ai-governance');
		const approved = await service.transition(reviewer, reviewed.id, { expectedVersion: reviewed.version, action: 'approve' }, 'approve-scheduled');
		const scheduledAt = new Date(Date.now() + 60_000);
		const scheduled = await service.transition(editor, approved.id, {
			expectedVersion: approved.version, action: 'schedule', scheduledFor: scheduledAt.toISOString(), idempotencyKey: 'schedule:ai-governance:1',
		}, 'schedule');
		expect(scheduled.state).toBe('Scheduled');
		const repeated = await service.transition(editor, approved.id, {
			expectedVersion: approved.version, action: 'schedule', scheduledFor: scheduledAt.toISOString(), idempotencyKey: 'schedule:ai-governance:1',
		}, 'schedule-repeat');
		expect(repeated).toMatchObject({ id: scheduled.id, version: scheduled.version, state: 'Scheduled' });
		const first = await repository.runDuePublicationJobs(new Date(scheduledAt.getTime() + 1000));
		const second = await repository.runDuePublicationJobs(new Date(scheduledAt.getTime() + 2000));
		expect(first).toEqual({ claimed: 1, completed: 1, failed: 0 });
		expect(second).toEqual({ claimed: 0, completed: 0, failed: 0 });
		const final = await service.get(editor, approved.id);
		expect(final).toMatchObject({ state: 'Published', publishedRevisionId: approved.draftRevisionId });
		const publicationRows = await database.db.select().from(publications).where(eq(publications.idempotencyKey, 'schedule:ai-governance:1'));
		const auditRows = await database.db.select().from(auditEvents).where(and(eq(auditEvents.targetId, approved.id), eq(auditEvents.action, 'post.publish_scheduled')));
		expect(publicationRows).toHaveLength(1);
		expect(auditRows).toHaveLength(1);
	});

	it('retries malformed durable jobs three times without changing a publication', async () => {
		const now = new Date();
		await database.db.insert(jobs).values({
			id: 'job-malformed', workspaceId: DEMO_WORKSPACE_ID, type: 'publish', payload: { invalid: true },
			status: 'pending', runAt: now, idempotencyKey: 'job:malformed', createdAt: now, updatedAt: now,
		});
		for (let attempt = 0; attempt < 3; attempt += 1) {
			const result = await repository.runDuePublicationJobs(new Date(now.getTime() + 120_000 + attempt * 120_000));
			expect(result.failed).toBe(1);
		}
		expect(await repository.runDuePublicationJobs(new Date(now.getTime() + 600_000))).toEqual({ claimed: 0, completed: 0, failed: 0 });
		const [failed] = await database.db.select().from(jobs).where(eq(jobs.id, 'job-malformed'));
		expect(failed).toMatchObject({ status: 'failed', attempts: 3, lastErrorCode: 'INTERNAL_FAILURE' });
	});

	it('denies Author publication and rejects an illegal approval', async () => {
		const author = context('Author');
		const draft = await service.get(author, 'post-editorial-systems');
		const submitted = await service.transition(author, draft.id, { expectedVersion: draft.version, action: 'submit' }, 'submit-denied');
		const approved = await service.transition(context('Reviewer'), draft.id, { expectedVersion: submitted.version, action: 'approve' }, 'approve-denied');
		await expect(service.transition(author, draft.id, { expectedVersion: approved.version, action: 'publish', idempotencyKey: 'forbidden:publish' }, 'forbidden'))
			.rejects.toMatchObject({ code: 'FORBIDDEN' });
		await expect(service.transition(context('Reviewer'), draft.id, { expectedVersion: approved.version, action: 'approve' }, 'illegal'))
			.rejects.toMatchObject({ code: 'ILLEGAL_TRANSITION' });
		const oldRevision = await database.db.select().from(revisions).where(eq(revisions.postId, draft.id));
		expect(oldRevision).toHaveLength(3);
	});
});
