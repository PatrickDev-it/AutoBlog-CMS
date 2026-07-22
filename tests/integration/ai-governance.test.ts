import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AIAdapter } from '@/src/modules/ai/adapter';
import { DrizzleAIRepository } from '@/src/modules/ai/drizzle-repository';
import { MockAIAdapter } from '@/src/modules/ai/mock-adapter';
import { AIService } from '@/src/modules/ai/service';
import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { aiQuotaWindows, aiUsage, auditEvents } from '@/src/platform/db/schema';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

let database: DatabaseContext;
let repository: DrizzleAIRepository;
let editorial: DrizzleEditorialRepository;

const context = (workspaceId = DEMO_WORKSPACE_ID): MembershipContext => ({
	workspaceId, workspaceSlug: 'demo', workspaceName: 'AutoBlog Editorial Lab', userId: 'demo-author',
	userName: 'Author', userEmail: 'author@demo.autoblog.local', role: 'Author',
});
const input = { postId: 'post-editorial-systems', title: 'Editorial systems', excerpt: '', content: 'Source content.', instruction: 'Improve structure and clarity.' };

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	database = createDatabase(`file:${join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/')}`);
	await migrateDatabase(database.client); await seedDemo(database);
	repository = new DrizzleAIRepository(database); editorial = new DrizzleEditorialRepository(database);
});

afterEach(() => database.client.close());

const createService = (adapter: AIAdapter = new MockAIAdapter(), quota = 1_000_000, timeout = 1000) =>
	new AIService(repository, adapter, quota, (workspaceId, postId) => editorial.find(workspaceId, postId), timeout);

describe('AI governance', () => {
	it('returns a labeled suggestion, records bounded metadata and never mutates the post', async () => {
		const before = await editorial.find(DEMO_WORKSPACE_ID, input.postId);
		const result = await createService().suggest(context(), input, 'ai-success');
		expect(result.mode).toBe('mock');
		expect(result.provider).toBe('deterministic-mock');
		expect(result.suggestion.content).not.toBe(before?.content);
		expect(await editorial.find(DEMO_WORKSPACE_ID, input.postId)).toEqual(before);
		const usage = await database.db.select().from(aiUsage);
		expect(usage).toHaveLength(1);
		expect(usage[0]).toMatchObject({ inputTokens: null, outputTokens: null, mode: 'mock' });
		const [audit] = await database.db.select().from(auditEvents).where(eq(auditEvents.action, 'ai.suggested'));
		expect(JSON.stringify(audit?.metadata)).not.toContain(input.content);
	});

	it('enforces workspace quota before invoking the adapter', async () => {
		let calls = 0;
		const adapter: AIAdapter = { mode: 'mock', suggest: async () => { calls += 1; return new MockAIAdapter().suggest(input, new AbortController().signal); } };
		await expect(createService(adapter, 100).suggest(context(), input, 'quota')).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' });
		expect(calls).toBe(0);
	});

	it('enforces a durable per-user rate limit', async () => {
		const service = createService();
		for (let index = 0; index < 5; index += 1) await service.suggest(context(), { ...input, instruction: `Improve structure ${index}` }, `rate-${index}`);
		await expect(service.suggest(context(), input, 'rate-exceeded')).rejects.toMatchObject({ code: 'RATE_LIMITED' });
		expect(await database.db.select().from(aiUsage)).toHaveLength(5);
	});

	it('times out an adapter and releases its quota reservation', async () => {
		const hanging: AIAdapter = { mode: 'mock', suggest: async () => new Promise(() => undefined) };
		await expect(createService(hanging, 1_000_000, 10).suggest(context(), input, 'timeout')).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
		const [window] = await database.db.select().from(aiQuotaWindows).where(eq(aiQuotaWindows.workspaceId, DEMO_WORKSPACE_ID));
		expect(window?.reservedCharacters).toBe(0);
		expect(await database.db.select().from(aiUsage)).toHaveLength(0);
	});

	it('rejects a cross-workspace post before quota or provider access', async () => {
		let calls = 0;
		const adapter: AIAdapter = { mode: 'mock', suggest: async () => { calls += 1; return new MockAIAdapter().suggest(input, new AbortController().signal); } };
		await expect(createService(adapter).suggest(context('different-workspace'), input, 'cross-workspace')).rejects.toMatchObject({ code: 'NOT_FOUND' });
		expect(calls).toBe(0);
		expect(await database.db.select().from(aiQuotaWindows).where(and(eq(aiQuotaWindows.workspaceId, 'different-workspace'), eq(aiQuotaWindows.usedCharacters, 0)))).toHaveLength(0);
	});
});
