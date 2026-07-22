import { z } from 'zod';

import { DrizzleDemoRepository } from '@/src/modules/identity/drizzle-demo-repository';
import type { DemoRepository, DemoResetResult } from '@/src/modules/identity/demo-repository';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { authorize } from '@/src/modules/identity/policy';
import { getDatabase } from '@/src/platform/db/client';
import { AppError } from '@/src/platform/observability/errors';

const demoResetSchema = z.object({ idempotencyKey: z.string().trim().min(12).max(120) });
export type DemoResetResponse = DemoResetResult & Readonly<{ alreadyApplied: boolean }>;

export class DemoService {
	constructor(private readonly repository: DemoRepository) {}

	async reset(context: MembershipContext, rawInput: unknown, requestId: string): Promise<DemoResetResponse> {
		authorize(context.role, 'demo.reset');
		const input = demoResetSchema.parse(rawInput);
		if (!await this.repository.isDemoWorkspace(context.workspaceId)) throw new AppError('FORBIDDEN');
		const existing = await this.repository.findReset(context.workspaceId, input.idempotencyKey);
		if (existing) return { ...existing, alreadyApplied: true };
		await this.repository.consumeResetLimit(context.workspaceId, context.userId, new Date());
		const result = await this.repository.reset(context.workspaceId, requestId);
		await this.repository.recordReset(context.workspaceId, input.idempotencyKey, result);
		return { ...result, alreadyApplied: false };
	}
}

let demoService: DemoService | undefined;
export function getDemoService(): DemoService {
	if (!demoService) demoService = new DemoService(new DrizzleDemoRepository(getDatabase()));
	return demoService;
}
