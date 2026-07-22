export type DemoResetResult = Readonly<{ fixtureVersion: number; resetAt: string }>;

export interface DemoRepository {
	isDemoWorkspace(workspaceId: string): Promise<boolean>;
	findReset(workspaceId: string, idempotencyKey: string): Promise<DemoResetResult | null>;
	consumeResetLimit(workspaceId: string, userId: string, now: Date): Promise<void>;
	reset(workspaceId: string, requestId: string): Promise<DemoResetResult>;
	recordReset(workspaceId: string, idempotencyKey: string, result: DemoResetResult): Promise<void>;
}
