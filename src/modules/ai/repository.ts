import type { AIAdapterResult, AISuggestionInput } from '@/src/modules/ai/domain';

export interface AIRepository {
	consumeRateLimit(key: string, limit: number, windowMs: number, now: Date): Promise<void>;
	reserveQuota(workspaceId: string, amount: number, limit: number, now: Date): Promise<Readonly<{ windowStartedAt: Date }>>;
	releaseQuota(workspaceId: string, windowStartedAt: Date, amount: number, now: Date): Promise<void>;
	complete(command: Readonly<{
		workspaceId: string; userId: string; requestId: string; mode: 'mock' | 'gemini';
		input: AISuggestionInput; adapter: AIAdapterResult; latencyMs: number;
		windowStartedAt: Date; reservedCharacters: number; quotaLimit: number; now: Date;
	}>): Promise<number>;
}
