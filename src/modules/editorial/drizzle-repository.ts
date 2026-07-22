import { and, asc, desc, eq, lt, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { postStateSchema, type PostDetail, type PostSummary, type PublicPost, type RevisionDetail } from '@/src/modules/editorial/domain';
import type { EditorialRepository } from '@/src/modules/editorial/repository';
import { resolveTransition } from '@/src/modules/editorial/workflow';
import type { DatabaseContext } from '@/src/platform/db/client';
import { auditEvents, jobs, posts, publications, revisions, workspaces } from '@/src/platform/db/schema';
import { AppError } from '@/src/platform/observability/errors';

type PostRow = typeof posts.$inferSelect;
type RevisionRow = typeof revisions.$inferSelect;

const publishJobPayloadSchema = z.object({
	postId: z.string().min(1),
	publicationId: z.string().min(1),
	revisionId: z.string().min(1),
});

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

function toRevision(row: RevisionRow): RevisionDetail {
	return {
		id: row.id,
		postId: row.postId,
		version: row.version,
		title: row.title,
		excerpt: row.excerpt,
		content: row.content,
		authorId: row.authorId,
		restoredFromRevisionId: row.restoredFromRevisionId,
		createdAt: row.createdAt,
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
		return {
			...toSummary(row.post),
			content: row.content,
			draftRevisionId: row.post.draftRevisionId,
			publishedRevisionId: row.post.publishedRevisionId,
			createdAt: row.post.createdAt,
			scheduledFor: row.post.scheduledFor,
			publishedAt: row.post.publishedAt,
		};
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
					state: sql`case when ${posts.state} = 'Published' then 'Draft' else ${posts.state} end`,
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

	async listRevisions(workspaceId: string, postId: string): Promise<RevisionDetail[]> {
		const rows = await this.database.db.select().from(revisions)
			.where(and(eq(revisions.workspaceId, workspaceId), eq(revisions.postId, postId)))
			.orderBy(desc(revisions.version));
		return rows.map(toRevision);
	}

	async restore(command: Parameters<EditorialRepository['restore']>[0]): Promise<PostDetail> {
		const [target] = await this.database.db.select().from(revisions)
			.where(and(eq(revisions.workspaceId, command.workspaceId), eq(revisions.postId, command.postId), eq(revisions.id, command.input.revisionId)))
			.limit(1);
		if (!target) throw new AppError('NOT_FOUND');
		const revisionId = crypto.randomUUID();
		const newVersion = command.input.expectedVersion + 1;
		const now = new Date();

		try {
			await this.database.db.transaction(async (transaction) => {
				await transaction.insert(revisions).values({
					id: revisionId, workspaceId: command.workspaceId, postId: command.postId,
					version: newVersion, title: target.title, excerpt: target.excerpt, content: target.content,
					authorId: command.actorId, restoredFromRevisionId: target.id, createdAt: now,
				});
				const result = await transaction.update(posts).set({
					title: target.title, excerpt: target.excerpt, draftRevisionId: revisionId,
					state: sql`case when ${posts.state} = 'Published' then 'Draft' else ${posts.state} end`,
					version: newVersion, updatedAt: now,
				}).where(and(eq(posts.workspaceId, command.workspaceId), eq(posts.id, command.postId), eq(posts.version, command.input.expectedVersion)));
				if (result.rowsAffected !== 1) throw new AppError('VERSION_CONFLICT', { expectedVersion: command.input.expectedVersion });
				await transaction.insert(auditEvents).values({
					id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
					action: 'revision.restored', targetType: 'post', targetId: command.postId,
					requestId: command.requestId, metadata: { version: newVersion, restoredFromRevisionId: target.id }, createdAt: now,
				});
			});
		} catch (error) {
			if (error instanceof AppError) throw error;
			if (isRevisionVersionConflict(error)) throw new AppError('VERSION_CONFLICT', { expectedVersion: command.input.expectedVersion });
			throw error;
		}
		const restored = await this.find(command.workspaceId, command.postId);
		if (!restored) throw new AppError('INTERNAL_FAILURE');
		return restored;
	}

	async transition(command: Parameters<EditorialRepository['transition']>[0]): Promise<PostDetail> {
		if (command.input.idempotencyKey) {
			const existing = await this.findPublicationByKey(command.input.idempotencyKey);
			if (existing) {
				if (existing.workspaceId !== command.workspaceId || existing.postId !== command.postId) throw new AppError('VERSION_CONFLICT');
				const post = await this.find(command.workspaceId, command.postId);
				if (!post) throw new AppError('NOT_FOUND');
				return post;
			}
		}

		const current = await this.find(command.workspaceId, command.postId);
		if (!current) throw new AppError('NOT_FOUND');
		const rule = resolveTransition(current.state, command.input.action);
		const now = new Date();
		const newVersion = command.input.expectedVersion + 1;
		const scheduledFor = command.input.scheduledFor ? new Date(command.input.scheduledFor) : null;
		const idempotencyKey = command.input.idempotencyKey;
		if (command.input.action === 'schedule' && (!scheduledFor || !idempotencyKey)) throw new AppError('VALIDATION_FAILED');
		if (command.input.action === 'publish' && !idempotencyKey) throw new AppError('VALIDATION_FAILED');
		const publicationId = crypto.randomUUID();

		try {
			await this.database.db.transaction(async (transaction) => {
				const scheduledPublications = command.input.action === 'archive' && current.state === 'Scheduled'
					? await transaction.select({ idempotencyKey: publications.idempotencyKey }).from(publications)
						.where(and(eq(publications.workspaceId, command.workspaceId), eq(publications.postId, command.postId), eq(publications.status, 'scheduled')))
					: [];
				const result = await transaction.update(posts).set({
					state: rule.to,
					version: newVersion,
					updatedAt: now,
					...(command.input.action === 'submit' ? { submittedAt: now } : {}),
					...(command.input.action === 'request_changes' ? { approvedAt: null } : {}),
					...(command.input.action === 'approve' ? { approvedAt: now } : {}),
					...(command.input.action === 'schedule' ? { scheduledFor } : {}),
					...(command.input.action === 'publish' ? { publishedRevisionId: current.draftRevisionId, publishedAt: now, scheduledFor: null } : {}),
					...(command.input.action === 'archive' ? { archivedAt: now, scheduledFor: null } : {}),
				}).where(and(eq(posts.workspaceId, command.workspaceId), eq(posts.id, command.postId), eq(posts.version, command.input.expectedVersion), eq(posts.state, current.state)));
				if (result.rowsAffected !== 1) throw new AppError('VERSION_CONFLICT', { expectedVersion: command.input.expectedVersion });

				if (command.input.action === 'schedule') {
					if (!scheduledFor || !idempotencyKey) throw new AppError('VALIDATION_FAILED');
					await transaction.insert(publications).values({
						id: publicationId, workspaceId: command.workspaceId, postId: command.postId,
						revisionId: current.draftRevisionId, status: 'scheduled', scheduledFor,
						idempotencyKey, createdBy: command.actorId, createdAt: now,
					});
					await transaction.insert(jobs).values({
						id: crypto.randomUUID(), workspaceId: command.workspaceId, type: 'publish',
						payload: { postId: command.postId, publicationId, revisionId: current.draftRevisionId },
						status: 'pending', runAt: scheduledFor, idempotencyKey: `job:${idempotencyKey}`,
						createdAt: now, updatedAt: now,
					});
				}

				if (command.input.action === 'publish') {
					if (!idempotencyKey) throw new AppError('VALIDATION_FAILED');
					await transaction.insert(publications).values({
						id: publicationId, workspaceId: command.workspaceId, postId: command.postId,
						revisionId: current.draftRevisionId, status: 'published', publishedAt: now,
						idempotencyKey, createdBy: command.actorId, createdAt: now,
					});
				}

				if (command.input.action === 'archive' && current.state === 'Scheduled') {
					await transaction.update(publications).set({ status: 'cancelled' })
						.where(and(eq(publications.workspaceId, command.workspaceId), eq(publications.postId, command.postId), eq(publications.status, 'scheduled')));
					for (const publication of scheduledPublications) {
						await transaction.update(jobs).set({ status: 'completed', leaseUntil: null, updatedAt: now })
							.where(and(eq(jobs.workspaceId, command.workspaceId), eq(jobs.idempotencyKey, `job:${publication.idempotencyKey}`), or(eq(jobs.status, 'pending'), eq(jobs.status, 'failed'), eq(jobs.status, 'leased'))));
					}
				}

				await transaction.insert(auditEvents).values({
					id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
					action: `post.${command.input.action}`, targetType: 'post', targetId: command.postId,
					requestId: command.requestId,
					metadata: { from: current.state, to: rule.to, version: newVersion, revisionId: current.draftRevisionId },
					createdAt: now,
				});
			});
		} catch (error) {
			if (error instanceof AppError) throw error;
			if (command.input.idempotencyKey && await this.findPublicationByKey(command.input.idempotencyKey)) {
				const post = await this.find(command.workspaceId, command.postId);
				if (post) return post;
			}
			throw error;
		}

		const transitioned = await this.find(command.workspaceId, command.postId);
		if (!transitioned) throw new AppError('INTERNAL_FAILURE');
		return transitioned;
	}

	async findPublic(workspaceSlug: string, postSlug: string): Promise<PublicPost | null> {
		const [row] = await this.database.db.select({
			workspaceName: workspaces.name,
			slug: posts.slug,
			title: revisions.title,
			excerpt: revisions.excerpt,
			content: revisions.content,
			revisionId: revisions.id,
			publishedAt: posts.publishedAt,
		}).from(posts)
			.innerJoin(workspaces, eq(workspaces.id, posts.workspaceId))
			.innerJoin(revisions, and(eq(revisions.id, posts.publishedRevisionId), eq(revisions.workspaceId, posts.workspaceId), eq(revisions.postId, posts.id)))
			.where(and(eq(workspaces.slug, workspaceSlug), eq(posts.slug, postSlug)))
			.limit(1);
		if (!row || !row.publishedAt) return null;
		return { ...row, publishedAt: row.publishedAt };
	}

	async runDuePublicationJobs(now: Date, limit = 10): Promise<Readonly<{ claimed: number; completed: number; failed: number }>> {
		const candidates = await this.database.db.select().from(jobs).where(and(
			eq(jobs.type, 'publish'),
			lte(jobs.runAt, now),
			or(eq(jobs.status, 'pending'), and(eq(jobs.status, 'failed'), lt(jobs.attempts, 3)), and(eq(jobs.status, 'leased'), lte(jobs.leaseUntil, now))),
		)).orderBy(asc(jobs.runAt)).limit(Math.min(Math.max(limit, 1), 100));
		let claimed = 0;
		let completed = 0;
		let failed = 0;

		for (const job of candidates) {
			const leaseUntil = new Date(now.getTime() + 30_000);
			const claim = await this.database.db.update(jobs).set({ status: 'leased', leaseUntil, attempts: sql`${jobs.attempts} + 1`, updatedAt: now })
				.where(and(eq(jobs.id, job.id), eq(jobs.attempts, job.attempts), or(eq(jobs.status, 'pending'), eq(jobs.status, 'failed'), and(eq(jobs.status, 'leased'), lte(jobs.leaseUntil, now)))));
			if (claim.rowsAffected !== 1) continue;
			claimed += 1;
			try {
				await this.completePublicationJob(job.id, job.workspaceId, job.payload, now);
				completed += 1;
			} catch (error) {
				failed += 1;
				const code = error instanceof AppError ? error.code : 'INTERNAL_FAILURE';
				await this.database.db.update(jobs).set({
					status: 'failed', leaseUntil: null, lastErrorCode: code,
					runAt: new Date(now.getTime() + Math.min(60_000, 1000 * 2 ** job.attempts)), updatedAt: now,
				}).where(eq(jobs.id, job.id));
			}
		}
		return { claimed, completed, failed };
	}

	private async findPublicationByKey(idempotencyKey: string): Promise<typeof publications.$inferSelect | null> {
		const [publication] = await this.database.db.select().from(publications).where(eq(publications.idempotencyKey, idempotencyKey)).limit(1);
		return publication ?? null;
	}

	private async completePublicationJob(jobId: string, workspaceId: string, rawPayload: unknown, now: Date): Promise<void> {
		const payload = publishJobPayloadSchema.parse(rawPayload);
		await this.database.db.transaction(async (transaction) => {
			const [publication] = await transaction.select().from(publications)
				.where(and(eq(publications.id, payload.publicationId), eq(publications.workspaceId, workspaceId), eq(publications.postId, payload.postId), eq(publications.revisionId, payload.revisionId))).limit(1);
			if (!publication) throw new AppError('NOT_FOUND');
			if (publication.status === 'published') {
				await transaction.update(jobs).set({ status: 'completed', leaseUntil: null, lastErrorCode: null, updatedAt: now }).where(eq(jobs.id, jobId));
				return;
			}
			if (publication.status !== 'scheduled') throw new AppError('ILLEGAL_TRANSITION');
			const [revision] = await transaction.select({ id: revisions.id }).from(revisions)
				.where(and(eq(revisions.id, payload.revisionId), eq(revisions.workspaceId, workspaceId), eq(revisions.postId, payload.postId))).limit(1);
			if (!revision) throw new AppError('NOT_FOUND');
			const update = await transaction.update(posts).set({
				state: 'Published', publishedRevisionId: payload.revisionId, publishedAt: now,
				scheduledFor: null, version: sql`${posts.version} + 1`, updatedAt: now,
			}).where(and(eq(posts.id, payload.postId), eq(posts.workspaceId, workspaceId), eq(posts.state, 'Scheduled')));
			if (update.rowsAffected !== 1) throw new AppError('ILLEGAL_TRANSITION');
			await transaction.update(publications).set({ status: 'published', publishedAt: now }).where(eq(publications.id, publication.id));
			await transaction.insert(auditEvents).values({
				id: crypto.randomUUID(), workspaceId, actorId: publication.createdBy,
				action: 'post.publish_scheduled', targetType: 'post', targetId: payload.postId,
				requestId: `job:${jobId}`, metadata: { revisionId: payload.revisionId }, createdAt: now,
			});
			await transaction.update(jobs).set({ status: 'completed', leaseUntil: null, lastErrorCode: null, updatedAt: now }).where(eq(jobs.id, jobId));
		});
	}
}
