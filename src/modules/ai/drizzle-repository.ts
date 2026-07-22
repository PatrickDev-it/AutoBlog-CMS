import { and, eq, sql } from 'drizzle-orm';

import type { AIRepository } from '@/src/modules/ai/repository';
import type { DatabaseContext } from '@/src/platform/db/client';
import { aiQuotaWindows, aiUsage, auditEvents, rateLimits } from '@/src/platform/db/schema';
import { AppError } from '@/src/platform/observability/errors';

function monthStart(now: Date): Date {
	return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export class DrizzleAIRepository implements AIRepository {
	constructor(private readonly database: DatabaseContext) {}

	async consumeRateLimit(key: string, limit: number, windowMs: number, now: Date): Promise<void> {
		const windowStartedAt = new Date(Math.floor(now.getTime() / windowMs) * windowMs);
		const expiresAt = new Date(windowStartedAt.getTime() + windowMs);
		await this.database.db.transaction(async (transaction) => {
			const inserted = await transaction.insert(rateLimits).values({ key, windowStartedAt, count: 1, expiresAt }).onConflictDoNothing();
			if (inserted.rowsAffected === 1) return;
			const updated = await transaction.update(rateLimits).set({ count: sql`${rateLimits.count} + 1` })
				.where(and(eq(rateLimits.key, key), eq(rateLimits.windowStartedAt, windowStartedAt), sql`${rateLimits.count} < ${limit}`));
			if (updated.rowsAffected !== 1) throw new AppError('RATE_LIMITED', { retryAfterSeconds: Math.ceil((expiresAt.getTime() - now.getTime()) / 1000) });
		});
	}

	async reserveQuota(workspaceId: string, amount: number, limit: number, now: Date): Promise<Readonly<{ windowStartedAt: Date }>> {
		const windowStartedAt = monthStart(now);
		await this.database.db.transaction(async (transaction) => {
			await transaction.insert(aiQuotaWindows).values({ workspaceId, windowStartedAt, reservedCharacters: 0, usedCharacters: 0, updatedAt: now }).onConflictDoNothing();
			const updated = await transaction.update(aiQuotaWindows).set({ reservedCharacters: sql`${aiQuotaWindows.reservedCharacters} + ${amount}`, updatedAt: now })
				.where(and(eq(aiQuotaWindows.workspaceId, workspaceId), eq(aiQuotaWindows.windowStartedAt, windowStartedAt), sql`${aiQuotaWindows.reservedCharacters} + ${aiQuotaWindows.usedCharacters} + ${amount} <= ${limit}`));
			if (updated.rowsAffected !== 1) throw new AppError('QUOTA_EXCEEDED');
		});
		return { windowStartedAt };
	}

	async releaseQuota(workspaceId: string, windowStartedAt: Date, amount: number, now: Date): Promise<void> {
		await this.database.db.update(aiQuotaWindows).set({ reservedCharacters: sql`max(0, ${aiQuotaWindows.reservedCharacters} - ${amount})`, updatedAt: now })
			.where(and(eq(aiQuotaWindows.workspaceId, workspaceId), eq(aiQuotaWindows.windowStartedAt, windowStartedAt)));
	}

	async complete(command: Parameters<AIRepository['complete']>[0]): Promise<number> {
		const inputCharacters = command.input.title.length + command.input.excerpt.length + command.input.content.length + command.input.instruction.length;
		const outputCharacters = command.adapter.suggestion.title.length + command.adapter.suggestion.excerpt.length + command.adapter.suggestion.content.length + command.adapter.suggestion.rationale.length;
		const actual = inputCharacters + outputCharacters;
		return this.database.db.transaction(async (transaction) => {
			await transaction.update(aiQuotaWindows).set({
				reservedCharacters: sql`max(0, ${aiQuotaWindows.reservedCharacters} - ${command.reservedCharacters})`,
				usedCharacters: sql`${aiQuotaWindows.usedCharacters} + ${actual}`, updatedAt: command.now,
			}).where(and(eq(aiQuotaWindows.workspaceId, command.workspaceId), eq(aiQuotaWindows.windowStartedAt, command.windowStartedAt)));
			await transaction.insert(aiUsage).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, userId: command.userId,
				mode: command.mode, provider: command.adapter.provider, model: command.adapter.model,
				latencyMs: command.latencyMs, inputCharacters, outputCharacters,
				inputTokens: command.adapter.inputTokens, outputTokens: command.adapter.outputTokens, createdAt: command.now,
			});
			await transaction.insert(auditEvents).values({
				id: crypto.randomUUID(), workspaceId: command.workspaceId, actorId: command.userId,
				action: 'ai.suggested', targetType: 'post', targetId: command.input.postId,
				requestId: command.requestId,
				metadata: { mode: command.mode, provider: command.adapter.provider, model: command.adapter.model, inputCharacters, outputCharacters },
				createdAt: command.now,
			});
			const [window] = await transaction.select({ used: aiQuotaWindows.usedCharacters, reserved: aiQuotaWindows.reservedCharacters }).from(aiQuotaWindows)
				.where(and(eq(aiQuotaWindows.workspaceId, command.workspaceId), eq(aiQuotaWindows.windowStartedAt, command.windowStartedAt))).limit(1);
			return Math.max(0, command.quotaLimit - (window?.used ?? command.quotaLimit) - (window?.reserved ?? 0));
		});
	}
}
