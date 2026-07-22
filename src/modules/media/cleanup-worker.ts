import { and, asc, eq, lt, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import type { JobRunResult } from '@/src/modules/editorial/domain';
import type { MediaProvider } from '@/src/modules/media/provider';
import type { DatabaseContext } from '@/src/platform/db/client';
import { jobs, mediaAssets } from '@/src/platform/db/schema';
import { AppError } from '@/src/platform/observability/errors';

const cleanupPayloadSchema = z.object({ storageKey: z.string().min(1), assetId: z.string().min(1).optional() });

export class MediaCleanupWorker {
	constructor(private readonly database: DatabaseContext, private readonly provider: MediaProvider) {}

	async run(now = new Date(), limit = 20): Promise<JobRunResult> {
		const candidates = await this.database.db.select().from(jobs).where(and(
			eq(jobs.type, 'media_cleanup'), lte(jobs.runAt, now),
			or(eq(jobs.status, 'pending'), and(eq(jobs.status, 'failed'), lt(jobs.attempts, 3)), and(eq(jobs.status, 'leased'), lte(jobs.leaseUntil, now))),
		)).orderBy(asc(jobs.runAt)).limit(Math.min(Math.max(limit, 1), 100));
		let claimed = 0; let completed = 0; let failed = 0;
		for (const job of candidates) {
			const claim = await this.database.db.update(jobs).set({
				status: 'leased', leaseUntil: new Date(now.getTime() + 30_000), attempts: sql`${jobs.attempts} + 1`, updatedAt: now,
			}).where(and(eq(jobs.id, job.id), eq(jobs.attempts, job.attempts), or(eq(jobs.status, 'pending'), eq(jobs.status, 'failed'), and(eq(jobs.status, 'leased'), lte(jobs.leaseUntil, now)))));
			if (claim.rowsAffected !== 1) continue;
			claimed += 1;
			try {
				const payload = cleanupPayloadSchema.parse(job.payload);
				if (payload.assetId) {
					const [asset] = await this.database.db.select({ status: mediaAssets.status, storageKey: mediaAssets.storageKey }).from(mediaAssets)
						.where(and(eq(mediaAssets.workspaceId, job.workspaceId), eq(mediaAssets.id, payload.assetId), eq(mediaAssets.storageKey, payload.storageKey))).limit(1);
					if (asset?.status === 'active') throw new AppError('ILLEGAL_TRANSITION');
				}
				const controller = new AbortController();
				let timeout: ReturnType<typeof setTimeout> | undefined;
				try {
					await Promise.race([
						this.provider.delete(payload.storageKey, controller.signal),
						new Promise<never>((_resolve, reject) => {
							timeout = setTimeout(() => { controller.abort(); reject(new AppError('PROVIDER_UNAVAILABLE')); }, 8_000);
						}),
					]);
				} finally { if (timeout) clearTimeout(timeout); }
				await this.database.db.transaction(async (transaction) => {
					if (payload.assetId) await transaction.update(mediaAssets).set({ status: 'deleted', updatedAt: now })
						.where(and(eq(mediaAssets.workspaceId, job.workspaceId), eq(mediaAssets.id, payload.assetId)));
					await transaction.update(jobs).set({ status: 'completed', leaseUntil: null, lastErrorCode: null, updatedAt: now }).where(eq(jobs.id, job.id));
				});
				completed += 1;
			} catch (error) {
				failed += 1;
				await this.database.db.update(jobs).set({
					status: 'failed', leaseUntil: null, lastErrorCode: error instanceof AppError ? error.code : 'PROVIDER_UNAVAILABLE',
					runAt: new Date(now.getTime() + Math.min(60_000, 1000 * 2 ** job.attempts)), updatedAt: now,
				}).where(eq(jobs.id, job.id));
			}
		}
		return { claimed, completed, failed };
	}
}
