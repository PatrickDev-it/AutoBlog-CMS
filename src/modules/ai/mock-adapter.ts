import type { AIAdapter } from '@/src/modules/ai/adapter';
import { aiSuggestionSchema, type AIAdapterResult, type AISuggestionInput } from '@/src/modules/ai/domain';

export class MockAIAdapter implements AIAdapter {
	readonly mode = 'mock' as const;

	async suggest(input: AISuggestionInput, signal: AbortSignal): Promise<AIAdapterResult> {
		signal.throwIfAborted();
		const title = input.title.includes(':') ? input.title : `${input.title}: editorial proof`.slice(0, 180);
		const excerpt = input.excerpt || `A concise editorial angle shaped around: ${input.instruction}`.slice(0, 320);
		const content = input.content.trim()
			? `${input.content.trim()}\n\n## Editorial next step\n\n${input.instruction}`.slice(0, 20_000)
			: `## Editorial brief\n\n${input.instruction}`;
		return {
			suggestion: aiSuggestionSchema.parse({
				title, excerpt, content,
				rationale: 'Deterministic demo adapter: structure is reproducible and no external provider was called.',
			}),
			provider: 'deterministic-mock',
			model: 'editorial-suggestion-v1',
		};
	}
}
