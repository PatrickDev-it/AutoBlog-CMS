import { describe, expect, it } from 'vitest';

import { PRODUCT_LIMITS } from '@/src/platform/config/limits';

describe('containment limits', () => {
	it('keeps costly public boundaries finite', () => {
		expect(PRODUCT_LIMITS.mediaMaxBytes).toBe(5_242_880);
		expect(PRODUCT_LIMITS.aiPromptMaxCharacters).toBeLessThanOrEqual(8_000);
		expect(PRODUCT_LIMITS.jobMaxAttempts).toBeGreaterThan(0);
	});
});
