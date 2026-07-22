import type { AIAdapterResult, AISuggestionInput } from '@/src/modules/ai/domain';

export interface AIAdapter {
	readonly mode: 'mock' | 'gemini';
	suggest(input: AISuggestionInput, signal: AbortSignal): Promise<AIAdapterResult>;
}
