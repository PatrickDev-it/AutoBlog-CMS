import { describe, expect, it } from 'vitest';

import { createPostSchema, savePostSchema } from '@/src/modules/editorial/domain';
import { AppError, normalizeError } from '@/src/platform/observability/errors';

describe('external validation and public errors', () => {
	it('rejects oversized or structurally invalid editorial input', () => {
		expect(createPostSchema.safeParse({ title: 'x', content: '' }).success).toBe(false);
		expect(savePostSchema.safeParse({ expectedVersion: 0, title: 'Valid title', excerpt: '', content: '' }).success).toBe(false);
	});

	it('maps unknown internal details to a stable non-sensitive error', () => {
		const error = normalizeError(new Error('database-password=must-not-leak'));
		expect(error).toBeInstanceOf(AppError);
		expect(error.code).toBe('INTERNAL_FAILURE');
		expect(error.message).not.toContain('database-password');
	});
});
