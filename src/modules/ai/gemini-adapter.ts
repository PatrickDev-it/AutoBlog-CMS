import { GoogleGenAI } from '@google/genai';

import type { AIAdapter } from '@/src/modules/ai/adapter';
import { aiSuggestionSchema, type AIAdapterResult, type AISuggestionInput } from '@/src/modules/ai/domain';
import { AppError } from '@/src/platform/observability/errors';

type GeminiRawResult = Readonly<{ text?: string; inputTokens?: number; outputTokens?: number }>;
type GeminiGenerate = (input: AISuggestionInput, signal: AbortSignal) => Promise<GeminiRawResult>;

const responseJsonSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['title', 'excerpt', 'content', 'rationale'],
	properties: {
		title: { type: 'string', maxLength: 180 },
		excerpt: { type: 'string', maxLength: 320 },
		content: { type: 'string', maxLength: 20_000 },
		rationale: { type: 'string', maxLength: 500 },
	},
} as const;

export class GeminiAIAdapter implements AIAdapter {
	readonly mode = 'gemini' as const;
	private readonly generate: GeminiGenerate;

	constructor(apiKey: string, private readonly model: string, generate?: GeminiGenerate) {
		this.generate = generate ?? this.createGenerator(apiKey);
	}

	async suggest(input: AISuggestionInput, signal: AbortSignal): Promise<AIAdapterResult> {
		try {
			const result = await this.generate(input, signal);
			if (!result.text) throw new AppError('PROVIDER_UNAVAILABLE');
			const suggestion = aiSuggestionSchema.parse(JSON.parse(result.text));
			return {
				suggestion, provider: 'google-gemini', model: this.model,
				...(result.inputTokens === undefined ? {} : { inputTokens: result.inputTokens }),
				...(result.outputTokens === undefined ? {} : { outputTokens: result.outputTokens }),
			};
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new AppError('PROVIDER_UNAVAILABLE', undefined, error);
		}
	}

	private createGenerator(apiKey: string): GeminiGenerate {
		const client = new GoogleGenAI({ apiKey });
		return async (input, signal) => {
			const response = await client.models.generateContent({
				model: this.model,
				contents: JSON.stringify({
					task: 'Return an editorial suggestion. Preserve factual meaning; do not claim external verification.',
					instruction: input.instruction,
					draft: { title: input.title, excerpt: input.excerpt, content: input.content },
				}),
				config: {
					abortSignal: signal,
					maxOutputTokens: 2_048,
					temperature: 0.2,
					responseMimeType: 'application/json',
					responseJsonSchema,
				},
			});
			return {
				...(response.text === undefined ? {} : { text: response.text }),
				...(response.usageMetadata?.promptTokenCount === undefined ? {} : { inputTokens: response.usageMetadata.promptTokenCount }),
				...(response.usageMetadata?.candidatesTokenCount === undefined ? {} : { outputTokens: response.usageMetadata.candidatesTokenCount }),
			};
		};
	}
}
