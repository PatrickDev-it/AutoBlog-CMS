import { hashPassword } from 'better-auth/crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { DEMO_IDENTITIES, DEMO_PASSWORD, DEMO_WORKSPACE_ID, DEMO_WORKSPACE_SLUG } from '@/src/modules/identity/demo';
import type { DatabaseContext } from '@/src/platform/db/client';
import {
	accounts,
	auditEvents,
	memberships,
	posts,
	publications,
	revisions,
	users,
	workspaces,
} from '@/src/platform/db/schema';

const revisionFixtureSchema = z.object({
	id: z.string().min(1),
	version: z.number().int().positive(),
	title: z.string().min(1).max(180),
	excerpt: z.string().max(320),
	content: z.string().min(1).max(100_000),
});

const postFixtureSchema = z.object({
	id: z.string().min(1),
	slug: z.string().regex(/^[a-z0-9-]+$/u),
	state: z.enum(['Draft', 'InReview', 'ChangesRequested', 'Approved', 'Scheduled', 'Published', 'Archived']),
	version: z.number().int().positive(),
	revisions: z.array(revisionFixtureSchema).min(1),
});

const DEMO_POSTS = postFixtureSchema.array().parse([
	{
		id: 'post-editorial-systems',
		slug: 'designing-editorial-systems',
		state: 'Draft',
		version: 3,
		revisions: [
			{ id: 'rev-editorial-1', version: 1, title: 'Designing editorial systems', excerpt: 'A working outline for the spring edition.', content: '# Designing editorial systems\n\nEditorial confidence starts with explicit ownership.' },
			{ id: 'rev-editorial-2', version: 2, title: 'Designing the editorial operating system', excerpt: 'Why reliable publishing needs more than a polished editor.', content: '# Designing the editorial operating system\n\nA durable workflow connects authors, reviewers and publication evidence.' },
			{ id: 'rev-editorial-3', version: 3, title: 'Designing the next editorial operating system', excerpt: 'A practical model for fast teams that refuse silent data loss.', content: '# Designing the next editorial operating system\n\nFast editorial teams need visible state, immutable history and bounded automation.\n\n## The operating model\n\nDraft deliberately. Review with context. Publish an immutable revision.' },
		],
	},
	{
		id: 'post-ai-governance',
		slug: 'ai-governance-for-editors',
		state: 'InReview',
		version: 2,
		revisions: [
			{ id: 'rev-ai-1', version: 1, title: 'AI governance for editors', excerpt: 'A checklist for responsible assistance.', content: '# AI governance for editors\n\nTreat generation as a suggestion, never a silent mutation.' },
			{ id: 'rev-ai-2', version: 2, title: 'AI governance that editors can operate', excerpt: 'Quotas, disclosure and explicit acceptance in one workflow.', content: '# AI governance that editors can operate\n\nLabel the active provider mode, meter usage and keep the editor accountable for acceptance.' },
		],
	},
	{
		id: 'post-immutable-publishing',
		slug: 'immutable-publishing',
		state: 'Published',
		version: 1,
		revisions: [
			{ id: 'rev-published-1', version: 1, title: 'Immutable publishing, practical trust', excerpt: 'How revision pointers protect the public record.', content: '# Immutable publishing, practical trust\n\nThe public page points to one revision. Later draft work cannot rewrite what readers already saw.' },
		],
	},
]);

export async function seedDemo(database: DatabaseContext, options: Readonly<{ reset?: boolean; requestId?: string }> = {}): Promise<void> {
	const now = new Date();
	const password = await hashPassword(DEMO_PASSWORD);

	for (const identity of DEMO_IDENTITIES) {
		await database.db.insert(users).values({
			id: identity.id,
			name: identity.name,
			email: identity.email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		}).onConflictDoNothing();
		await database.db.insert(accounts).values({
			id: `account-${identity.id}`,
			accountId: identity.id,
			providerId: 'credential',
			userId: identity.id,
			password,
			createdAt: now,
			updatedAt: now,
		}).onConflictDoNothing();
	}

	if (options.reset) await database.db.delete(workspaces).where(eq(workspaces.id, DEMO_WORKSPACE_ID));

	const existing = await database.db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.id, DEMO_WORKSPACE_ID)).limit(1);
	if (existing.length > 0) return;

	await database.db.insert(workspaces).values({
		id: DEMO_WORKSPACE_ID,
		slug: DEMO_WORKSPACE_SLUG,
		name: 'AutoBlog Editorial Lab',
		isDemo: true,
		createdAt: now,
		updatedAt: now,
	});

	await database.db.insert(memberships).values(DEMO_IDENTITIES.map((identity) => ({
		workspaceId: DEMO_WORKSPACE_ID,
		userId: identity.id,
		role: identity.role,
		createdAt: now,
	})));

	for (const post of DEMO_POSTS) {
		const authorId = 'demo-author';
		const currentRevision = post.revisions.at(-1);
		if (!currentRevision) throw new Error('SEED_REVISION_REQUIRED');
		await database.db.insert(posts).values({
			id: post.id,
			workspaceId: DEMO_WORKSPACE_ID,
			slug: post.slug,
			title: currentRevision.title,
			excerpt: currentRevision.excerpt,
			state: post.state,
			version: post.version,
			authorId,
			createdAt: now,
			updatedAt: now,
			...(post.state === 'InReview' ? { submittedAt: now } : {}),
			...(post.state === 'Published' ? { approvedAt: now, publishedAt: now } : {}),
		});

		await database.db.insert(revisions).values(post.revisions.map((revision) => ({
			...revision,
			workspaceId: DEMO_WORKSPACE_ID,
			postId: post.id,
			authorId,
			createdAt: new Date(now.getTime() - (post.version - revision.version) * 3_600_000),
		})));

		await database.db.update(posts).set({
			draftRevisionId: currentRevision.id,
			...(post.state === 'Published' ? { publishedRevisionId: currentRevision.id } : {}),
		}).where(eq(posts.id, post.id));

		if (post.state === 'Published') {
			await database.db.insert(publications).values({
				id: 'publication-seeded',
				workspaceId: DEMO_WORKSPACE_ID,
				postId: post.id,
				revisionId: currentRevision.id,
				status: 'published',
				publishedAt: now,
				idempotencyKey: `seed-publish:${post.id}:${currentRevision.id}`,
				createdBy: 'demo-editor',
				createdAt: now,
			});
		}
	}

	await database.db.insert(auditEvents).values({
		id: crypto.randomUUID(),
		workspaceId: DEMO_WORKSPACE_ID,
		actorId: 'demo-owner',
		action: options.reset ? 'demo.reset' : 'demo.seed',
		targetType: 'workspace',
		targetId: DEMO_WORKSPACE_ID,
		requestId: options.requestId ?? 'seed-script',
		metadata: { fixtureVersion: 1 },
		createdAt: now,
	});
}
