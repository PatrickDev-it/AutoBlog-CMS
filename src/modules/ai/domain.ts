import { z } from 'zod';

export const AI_MAX_INPUT_CONTENT = 20_000;
export const AI_MAX_OUTPUT_CHARACTERS = 24_000;

export const aiSuggestionInputSchema = z.object({
	postId: z.string().min(1).max(120),
	title: z.string().trim().min(3).max(180),
	excerpt: z.string().trim().max(320),
	content: z.string().max(AI_MAX_INPUT_CONTENT),
	instruction: z.string().trim().min(3).max(500),
});
export type AISuggestionInput = z.infer<typeof aiSuggestionInputSchema>;

export const aiSuggestionSchema = z.object({
	title: z.string().trim().min(3).max(180),
	excerpt: z.string().trim().max(320),
	content: z.string().max(AI_MAX_INPUT_CONTENT),
	rationale: z.string().trim().min(3).max(500),
});
export type AISuggestion = z.infer<typeof aiSuggestionSchema>;

export type AIAdapterResult = Readonly<{
	suggestion: AISuggestion;
	provider: string;
	model: string;
	inputTokens?: number;
	outputTokens?: number;
}>;

export type AISuggestionResult = Readonly<{
	suggestion: AISuggestion;
	mode: 'mock' | 'gemini';
	provider: string;
	model: string;
	latencyMs: number;
	remainingCharacters: number;
}>;
