import type { Permission } from '@/src/modules/identity/domain';
import { AppError } from '@/src/platform/observability/errors';
import type { PostState } from '@/src/modules/editorial/domain';

export const transitionActionValues = ['submit', 'request_changes', 'approve', 'schedule', 'publish', 'archive'] as const;
export type TransitionAction = (typeof transitionActionValues)[number];

type TransitionRule = Readonly<{
	from: readonly PostState[];
	to: PostState;
	permission: Permission;
}>;

export const TRANSITION_RULES: Readonly<Record<TransitionAction, TransitionRule>> = {
	submit: { from: ['Draft', 'ChangesRequested'], to: 'InReview', permission: 'post.submit' },
	request_changes: { from: ['InReview'], to: 'ChangesRequested', permission: 'review.request_changes' },
	approve: { from: ['InReview'], to: 'Approved', permission: 'review.approve' },
	schedule: { from: ['Approved'], to: 'Scheduled', permission: 'post.schedule' },
	publish: { from: ['Approved', 'Scheduled'], to: 'Published', permission: 'post.publish' },
	archive: { from: ['Draft', 'InReview', 'ChangesRequested', 'Approved', 'Scheduled', 'Published'], to: 'Archived', permission: 'post.archive' },
};

export function resolveTransition(state: PostState, action: TransitionAction): TransitionRule {
	const rule = TRANSITION_RULES[action];
	if (!rule.from.includes(state)) throw new AppError('ILLEGAL_TRANSITION', { from: state, action });
	return rule;
}
