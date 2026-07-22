import { and, desc, eq } from 'drizzle-orm';

import { postStateSchema, type PostDetail, type PostSummary } from '@/src/modules/editorial/domain';
import type { EditorialRepository } from '@/src/modules/editorial/repository';
import type { DatabaseContext } from '@/src/platform/db/client';
import { auditEvents, posts, revisions } from '@/src/platform/db/schema';
import { AppError } from '@/src/platform/observability/errors';

type PostRow = typeof posts.$inferSelect;

function slugify(title: string): string {
	const slug = title.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '').slice(0, 72);
	return slug || `post-${crypto.randomUUID().slice(0, 8)}`;
}

function toSummary(row: PostRow): PostSummary {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		state: postStateSchema.parse(row.state),
		version: row.version,
		authorId: row.authorId,
		updatedAt: row.updatedAt,
	};
}

function isRevisionVersionConflict(error: unknown): boolean {
	let current = error;
	for (let depth = 0; depth < 4 && current instanceof Error; depth += 1) {
		if (/revision_post_version_unique|UNIQUE constraint failed: revisions\.post_id, revisions\.version/iu.test(current.message)) return true;
		current = current.cause;
	}
	return false;
}

export class DrizzleEditorialRepository implements EditorialRepository {
	constructor(private readonly database: DatabaseContext) {}

	async list(workspaceId: string): Promise<PostSummary[]> {
		const rows = await this.database.db.select().from(posts).where(eq(posts.workspaceId, workspaceId)).orderBy(desc(posts.updatedAt));
		return rows.map(toSummary);
	}

	async find(workspaceId: string, postId: string): Promise<PostDetail | null> {
		const [row] = await this.database.db.select({ post: posts, content: revisions.content })
			.from(posts)
			.innerJoin(revisions, and(eq(revisions.id, posts.draftRevisionId), eq(revisions.workspaceId, posts.workspaceId)))
			.where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, postId)))
			.limit(1);
		if (!row || !row.post.draftRevisionId) return null;
		return { ...toSummary(row.post), content: row.content, draftRevisionId: row.post.draftRevisionId, publishedRevisionId: row.post.publishedRevisionId, createdAt: row.post.createdAt };
	}

	async create(command: Parameters<EditorialRepository['create']>[0]): Promise<PostDetail> {
		const postId = crypto.randomUUID();
		const revisionId = crypto.randomUUID();
		const now = new Date();
		const baseSlug = slugify(command.input.title);
		const slug = `${baseSlug}-${postId.slice(0, 6)}`;

		await this.database.db.transaction(async (transaction) => {
			await transaction.insert(posts).values({
				id: postId,
				workspaceId: command.workspaceId,
				slug,
				title: command.input.title,
				excerpt: command.input.excerpt,
				state: 'Draft',
				version: 1,
				authorId: command.actorId,
				createdAt: now,
				updatedAt: now,
			});
			await transaction.insert(revisions).values({
				id: revisionId,
				workspaceId: command.workspaceId,
				postId,
				version: 1,
				title: command.input.title,
				excerpt: command.input.excerpt,
				content: command.input.content,
				authorId: command.actorId,
				createdAt: now,
			});
			await transaction.update(posts).set({ draftRevisionId: revisionId }).where(and(eq(posts.workspaceId, command.workspaceId), eq(posts.id, postId)));
			await transaction.insert(auditEvents).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
				action: 'post.created', targetType: 'post', targetId: postId, requestId: command.requestId,
				metadata: { version: 1 }, createdAt: now,
			});
		});

		const created = await this.find(command.workspaceId, postId);
		if (!created) throw new AppError('INTERNAL_FAILURE');
		return created;
	}

	async save(command: Parameters<EditorialRepository['save']>[0]): Promise<PostDetail> {
		const revisionId = crypto.randomUUID();
		const newVersion = command.input.expectedVersion + 1;
		const now = new Date();

		try {
			await this.database.db.transaction(async (transaction) => {
				await transaction.insert(revisions).values({
					id: revisionId,
					workspaceId: command.workspaceId,
					postId: command.postId,
					version: newVersion,
					title: command.input.title,
					excerpt: command.input.excerpt,
					content: command.input.content,
					authorId: command.actorId,
					createdAt: now,
				});
				const result = await transaction.update(posts).set({
					title: command.input.title,
					excerpt: command.input.excerpt,
					version: newVersion,
					draftRevisionId: revisionId,
					updatedAt: now,
				}).where(and(eq(posts.workspaceId, command.workspaceId), eq(posts.id, command.postId), eq(posts.version, command.input.expectedVersion)));
				if (result.rowsAffected !== 1) throw new AppError('VERSION_CONFLICT', { expectedVersion: command.input.expectedVersion });
				await transaction.insert(auditEvents).values({
					id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
					action: 'post.saved', targetType: 'post', targetId: command.postId, requestId: command.requestId,
					metadata: { version: newVersion }, createdAt: now,
				});
			});
		} catch (error) {
			if (error instanceof AppError) throw error;
			if (isRevisionVersionConflict(error)) {
				throw new AppError('VERSION_CONFLICT', { expectedVersion: command.input.expectedVersion });
			}
			throw error;
		}

		const saved = await this.find(command.workspaceId, command.postId);
		if (!saved) throw new AppError('INTERNAL_FAILURE');
		return saved;
	}
}
