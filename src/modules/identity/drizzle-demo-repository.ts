import { and, eq, sql } from 'drizzle-orm';

import type { DemoRepository, DemoResetResult } from '@/src/modules/identity/demo-repository';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { DatabaseContext } from '@/src/platform/db/client';
import { idempotencyRecords, rateLimits, workspaces } from '@/src/platform/db/schema';
import { seedDemo } from '@/src/platform/db/seed';
import { AppError } from '@/src/platform/observability/errors';

const RESET_LIMIT = 3;
const RESET_WINDOW_MS = 60 * 60 * 1000;

export class DrizzleDemoRepository implements DemoRepository {
	constructor(private readonly database: DatabaseContext) {}

	async isDemoWorkspace(workspaceId: string): Promise<boolean> {
		const [workspace] = await this.database.db.select({ isDemo: workspaces.isDemo }).from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
		return workspace?.isDemo === true;
	}

	async findReset(workspaceId: string, idempotencyKey: string): Promise<DemoResetResult | null> {
		const [record] = await this.database.db.select({ result: idempotencyRecords.result }).from(idempotencyRecords).where(and(
			eq(idempotencyRecords.workspaceId, workspaceId), eq(idempotencyRecords.operation, 'demo.reset'), eq(idempotencyRecords.key, idempotencyKey),
		)).limit(1);
		if (!record) return null;
		const result = record.result;
		return typeof result.fixtureVersion === 'number' && typeof result.resetAt === 'string'
			? { fixtureVersion: result.fixtureVersion, resetAt: result.resetAt }
			: null;
	}

	async consumeResetLimit(workspaceId: string, userId: string, now: Date): Promise<void> {
		const windowStartedAt = new Date(Math.floor(now.getTime() / RESET_WINDOW_MS) * RESET_WINDOW_MS);
		const expiresAt = new Date(windowStartedAt.getTime() + RESET_WINDOW_MS);
		const key = `demo-reset:${workspaceId}:${userId}`;
		await this.database.db.transaction(async (transaction) => {
			const inserted = await transaction.insert(rateLimits).values({ key, windowStartedAt, count: 1, expiresAt }).onConflictDoNothing();
			if (inserted.rowsAffected === 1) return;
			const updated = await transaction.update(rateLimits).set({ count: sql`${rateLimits.count} + 1` }).where(and(
				eq(rateLimits.key, key), eq(rateLimits.windowStartedAt, windowStartedAt), sql`${rateLimits.count} < ${RESET_LIMIT}`,
			));
			if (updated.rowsAffected !== 1) throw new AppError('RATE_LIMITED', { retryAfterSeconds: Math.ceil((expiresAt.getTime() - now.getTime()) / 1000) });
		});
	}

	async reset(workspaceId: string, requestId: string): Promise<DemoResetResult> {
		if (workspaceId !== DEMO_WORKSPACE_ID) throw new AppError('FORBIDDEN');
		const resetAt = new Date().toISOString();
		await seedDemo(this.database, { reset: true, requestId });
		return { fixtureVersion: 1, resetAt };
	}

	async recordReset(workspaceId: string, idempotencyKey: string, result: DemoResetResult): Promise<void> {
		await this.database.db.insert(idempotencyRecords).values({
			workspaceId, operation: 'demo.reset', key: idempotencyKey, result, createdAt: new Date(result.resetAt),
		}).onConflictDoNothing();
	}
}
