import { describe, expect, it } from 'vitest';

import type { AIAdapter } from '@/src/modules/ai/adapter';
import { GeminiAIAdapter } from '@/src/modules/ai/gemini-adapter';
import { MockAIAdapter } from '@/src/modules/ai/mock-adapter';

const input = { postId: 'post-1', title: 'Editorial systems', excerpt: '', content: 'A source draft.', instruction: 'Improve the structure.' };

async function expectAdapterContract(adapter: AIAdapter) {
	const result = await adapter.suggest(input, new AbortController().signal);
	expect(result.suggestion.title.length).toBeGreaterThan(2);
	expect(result.suggestion.title.length).toBeLessThanOrEqual(180);
	expect(result.suggestion.content).toContain('source draft');
	expect(result.provider).toBeTruthy();
	expect(result.model).toBeTruthy();
}

describe('AI adapter contract', () => {
	it('is shared by deterministic mock and configured Gemini transport', async () => {
		await expectAdapterContract(new MockAIAdapter());
		await expectAdapterContract(new GeminiAIAdapter('test-key', 'test-model', async () => ({
			text: JSON.stringify({ title: 'Editorial systems, refined', excerpt: 'A concise angle.', content: 'A source draft.', rationale: 'Improved hierarchy.' }),
			inputTokens: 12, outputTokens: 8,
		})));
	});

	it('rejects malformed or excessive provider output', async () => {
		const malformed = new GeminiAIAdapter('test-key', 'test-model', async () => ({ text: '{invalid' }));
		await expect(malformed.suggest(input, new AbortController().signal)).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
		const excessive = new GeminiAIAdapter('test-key', 'test-model', async () => ({ text: JSON.stringify({ title: 'x'.repeat(181), excerpt: '', content: '', rationale: 'valid rationale' }) }));
		await expect(excessive.suggest(input, new AbortController().signal)).rejects.toMatchObject({ code: 'PROVIDER_UNAVAILABLE' });
	});

	it('honors cancellation in mock mode', async () => {
		const controller = new AbortController(); controller.abort();
		await expect(new MockAIAdapter().suggest(input, controller.signal)).rejects.toThrow();
	});
});
