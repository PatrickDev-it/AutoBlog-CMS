import { describe, expect, it } from 'vitest';

import { resolveTransition, TRANSITION_RULES } from '@/src/modules/editorial/workflow';

describe('editorial workflow', () => {
	it('defines the flagship state sequence and permissions', () => {
		expect(resolveTransition('Draft', 'submit')).toMatchObject({ to: 'InReview', permission: 'post.submit' });
		expect(resolveTransition('InReview', 'approve')).toMatchObject({ to: 'Approved', permission: 'review.approve' });
		expect(resolveTransition('Approved', 'schedule')).toMatchObject({ to: 'Scheduled', permission: 'post.schedule' });
		expect(resolveTransition('Scheduled', 'publish')).toMatchObject({ to: 'Published', permission: 'post.publish' });
	});

	it('rejects every action outside its declared source states', () => {
		const states = ['Draft', 'InReview', 'ChangesRequested', 'Approved', 'Scheduled', 'Published', 'Archived'] as const;
		for (const [action, rule] of Object.entries(TRANSITION_RULES)) {
			for (const state of states.filter((candidate) => !rule.from.includes(candidate))) {
				expect(() => resolveTransition(state, action as keyof typeof TRANSITION_RULES)).toThrowError(expect.objectContaining({ code: 'ILLEGAL_TRANSITION' }));
			}
		}
	});
});
