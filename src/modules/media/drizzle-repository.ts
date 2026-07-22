import { and, desc, eq } from 'drizzle-orm';

import type { MediaAsset } from '@/src/modules/media/domain';
import type { MediaRepository } from '@/src/modules/media/repository';
import type { DatabaseContext } from '@/src/platform/db/client';
import { auditEvents, jobs, mediaAssets, posts } from '@/src/platform/db/schema';
import { AppError } from '@/src/platform/observability/errors';

type MediaRow = typeof mediaAssets.$inferSelect;

function toAsset(row: MediaRow): MediaAsset {
	return {
		id: row.id, workspaceId: row.workspaceId, postId: row.postId, status: row.status,
		fileName: row.fileName, mimeType: row.mimeType, byteSize: row.byteSize,
		width: row.width, height: row.height, altText: row.altText, createdBy: row.createdBy,
		replacesAssetId: row.replacesAssetId, createdAt: row.createdAt,
	};
}

export class DrizzleMediaRepository implements MediaRepository {
	constructor(private readonly database: DatabaseContext) {}

	async findPostOwner(workspaceId: string, postId: string): Promise<string | null> {
		const [post] = await this.database.db.select({ authorId: posts.authorId }).from(posts)
			.where(and(eq(posts.workspaceId, workspaceId), eq(posts.id, postId))).limit(1);
		return post?.authorId ?? null;
	}

	async list(workspaceId: string, postId: string): Promise<MediaAsset[]> {
		const rows = await this.database.db.select().from(mediaAssets)
			.where(and(eq(mediaAssets.workspaceId, workspaceId), eq(mediaAssets.postId, postId), eq(mediaAssets.status, 'active')))
			.orderBy(desc(mediaAssets.createdAt));
		return rows.map(toAsset);
	}

	async find(workspaceId: string, assetId: string): Promise<(MediaAsset & { storageKey: string }) | null> {
		const [row] = await this.database.db.select().from(mediaAssets)
			.where(and(eq(mediaAssets.workspaceId, workspaceId), eq(mediaAssets.id, assetId))).limit(1);
		return row ? { ...toAsset(row), storageKey: row.storageKey } : null;
	}

	async finalize(command: Parameters<MediaRepository['finalize']>[0]): Promise<MediaAsset> {
		const assetId = crypto.randomUUID();
		const now = new Date();
		await this.database.db.transaction(async (transaction) => {
			let replaced: MediaRow | undefined;
			if (command.replaceAssetId) {
				[replaced] = await transaction.select().from(mediaAssets).where(and(
					eq(mediaAssets.id, command.replaceAssetId), eq(mediaAssets.workspaceId, command.workspaceId),
					eq(mediaAssets.postId, command.postId), eq(mediaAssets.status, 'active'),
				)).limit(1);
				if (!replaced) throw new AppError('NOT_FOUND');
				await transaction.update(mediaAssets).set({ status: 'replaced', updatedAt: now }).where(eq(mediaAssets.id, replaced.id));
			}
			await transaction.insert(mediaAssets).values({
				id: assetId, workspaceId: command.workspaceId, postId: command.postId, status: 'active',
				storageKey: command.storageKey, fileName: command.image.fileName, mimeType: command.image.mimeType,
				byteSize: command.image.byteSize, width: command.image.width, height: command.image.height,
				checksum: command.image.checksum, altText: command.altText, createdBy: command.actorId,
				replacesAssetId: replaced?.id, createdAt: now, updatedAt: now,
			});
			if (replaced) await transaction.insert(jobs).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, type: 'media_cleanup',
				payload: { assetId: replaced.id, storageKey: replaced.storageKey }, status: 'pending', runAt: now,
				idempotencyKey: `media-cleanup:${replaced.id}`, createdAt: now, updatedAt: now,
			});
			await transaction.insert(auditEvents).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
				action: replaced ? 'media.replaced' : 'media.uploaded', targetType: 'media', targetId: assetId,
				requestId: command.requestId, metadata: { postId: command.postId, replacedAssetId: replaced?.id ?? null }, createdAt: now,
			});
		});
		const [asset] = await this.database.db.select().from(mediaAssets)
			.where(and(eq(mediaAssets.workspaceId, command.workspaceId), eq(mediaAssets.id, assetId))).limit(1);
		if (!asset) throw new AppError('INTERNAL_FAILURE');
		return toAsset(asset);
	}

	async markForDeletion(command: Parameters<MediaRepository['markForDeletion']>[0]): Promise<void> {
		const now = new Date();
		await this.database.db.transaction(async (transaction) => {
			const [asset] = await transaction.select().from(mediaAssets).where(and(eq(mediaAssets.workspaceId, command.workspaceId), eq(mediaAssets.id, command.assetId))).limit(1);
			if (!asset) throw new AppError('NOT_FOUND');
			if (asset.status === 'deleted' || asset.status === 'cleanup_pending') return;
			await transaction.update(mediaAssets).set({ status: 'cleanup_pending', updatedAt: now }).where(eq(mediaAssets.id, asset.id));
			await transaction.insert(jobs).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, type: 'media_cleanup',
				payload: { assetId: asset.id, storageKey: asset.storageKey }, status: 'pending', runAt: now,
				idempotencyKey: `media-delete:${asset.id}`, createdAt: now, updatedAt: now,
			}).onConflictDoNothing();
			await transaction.insert(auditEvents).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.actorId,
				action: 'media.deleted', targetType: 'media', targetId: asset.id,
				requestId: command.requestId, metadata: { postId: asset.postId }, createdAt: now,
			});
		});
	}

	async enqueueOrphanCleanup(workspaceId: string, storageKey: string, requestId: string): Promise<void> {
		const now = new Date();
		await this.database.db.insert(jobs).values({
			id: crypto.randomUUID(), workspaceId, type: 'media_cleanup', payload: { storageKey },
			status: 'pending', runAt: now, idempotencyKey: `media-orphan:${storageKey}`,
			createdAt: now, updatedAt: now,
		}).onConflictDoNothing();
		await this.database.db.insert(auditEvents).values({
			id: crypto.randomUUID(), workspaceId, actorId: null, action: 'media.cleanup_queued',
			targetType: 'media_object', targetId: storageKey, requestId, metadata: {}, createdAt: now,
		});
	}
}
