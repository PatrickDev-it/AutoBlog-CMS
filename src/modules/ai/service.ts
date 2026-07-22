import type { AIAdapter } from '@/src/modules/ai/adapter';
import { AI_MAX_OUTPUT_CHARACTERS, aiSuggestionInputSchema, type AISuggestionResult } from '@/src/modules/ai/domain';
import { DrizzleAIRepository } from '@/src/modules/ai/drizzle-repository';
import { GeminiAIAdapter } from '@/src/modules/ai/gemini-adapter';
import { MockAIAdapter } from '@/src/modules/ai/mock-adapter';
import type { AIRepository } from '@/src/modules/ai/repository';
import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import type { PostDetail } from '@/src/modules/editorial/domain';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { authorize } from '@/src/modules/identity/policy';
import { getEnvironment } from '@/src/platform/config/env';
import { getDatabase } from '@/src/platform/db/client';
import { AppError } from '@/src/platform/observability/errors';

const AI_RATE_LIMIT = 5;
const AI_RATE_WINDOW_MS = 60_000;
const AI_TIMEOUT_MS = 8_000;

type PostReader = (workspaceId: string, postId: string) => Promise<PostDetail | null>;

export class AIService {
	constructor(
		private readonly repository: AIRepository,
		private readonly adapter: AIAdapter,
		private readonly quotaLimit: number,
		private readonly readPost: PostReader,
		private readonly timeoutMs = AI_TIMEOUT_MS,
	) {}

	async suggest(context: MembershipContext, rawInput: unknown, requestId: string): Promise<AISuggestionResult> {
		authorize(context.role, 'ai.suggest');
		const input = aiSuggestionInputSchema.parse(rawInput);
		if (!await this.readPost(context.workspaceId, input.postId)) throw new AppError('NOT_FOUND');
		const now = new Date();
		await this.repository.consumeRateLimit(`ai:${context.workspaceId}:${context.userId}`, AI_RATE_LIMIT, AI_RATE_WINDOW_MS, now);
		const inputCharacters = input.title.length + input.excerpt.length + input.content.length + input.instruction.length;
		const reservedCharacters = inputCharacters + AI_MAX_OUTPUT_CHARACTERS;
		const reservation = await this.repository.reserveQuota(context.workspaceId, reservedCharacters, this.quotaLimit, now);
		const controller = new AbortController();
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const startedAt = performance.now();
		try {
			const adapter = await Promise.race([
				this.adapter.suggest(input, controller.signal),
				new Promise<never>((_resolve, reject) => {
					timeout = setTimeout(() => { controller.abort(); reject(new AppError('PROVIDER_UNAVAILABLE')); }, this.timeoutMs);
				}),
			]);
			const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
			const remainingCharacters = await this.repository.complete({
				workspaceId: context.workspaceId, userId: context.userId, requestId, mode: this.adapter.mode,
				input, adapter, latencyMs, windowStartedAt: reservation.windowStartedAt,
				reservedCharacters, quotaLimit: this.quotaLimit, now: new Date(),
			});
			return { suggestion: adapter.suggestion, mode: this.adapter.mode, provider: adapter.provider, model: adapter.model, latencyMs, remainingCharacters };
		} catch (error) {
			await this.repository.releaseQuota(context.workspaceId, reservation.windowStartedAt, reservedCharacters, new Date());
			if (error instanceof AppError) throw error;
			throw new AppError('PROVIDER_UNAVAILABLE', undefined, error);
		} finally {
			if (timeout) clearTimeout(timeout);
		}
	}
}

let aiService: AIService | undefined;

export function getAIService(): AIService {
	if (!aiService) {
		const database = getDatabase();
		const environment = getEnvironment();
		const adapter: AIAdapter = environment.AI_MODE === 'gemini'
			? environment.GEMINI_API_KEY
				? new GeminiAIAdapter(environment.GEMINI_API_KEY, environment.GEMINI_MODEL)
				: (() => { throw new AppError('PROVIDER_UNAVAILABLE'); })()
			: new MockAIAdapter();
		const editorial = new DrizzleEditorialRepository(database);
		aiService = new AIService(new DrizzleAIRepository(database), adapter, environment.AI_MONTHLY_CHARACTER_QUOTA, (workspaceId, postId) => editorial.find(workspaceId, postId));
	}
	return aiService;
}
