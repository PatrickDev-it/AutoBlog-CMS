import { createHash, timingSafeEqual } from 'node:crypto';

import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import { authorize } from '@/src/modules/identity/policy';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { requireMembership } from '@/src/platform/auth/session';
import { getEnvironment } from '@/src/platform/config/env';

function matchesSecret(candidate: string | null, expected: string): boolean {
	if (!candidate) return false;
	const candidateHash = createHash('sha256').update(candidate).digest();
	const expectedHash = createHash('sha256').update(expected).digest();
	return timingSafeEqual(candidateHash, expectedHash);
}

export async function authorizeJobRunner(request: Request): Promise<'scheduler' | 'member'> {
	if (matchesSecret(request.headers.get('x-autoblog-cron-secret'), getEnvironment().CRON_SECRET)) return 'scheduler';
	const membership = await requireMembership(request.headers, DEMO_WORKSPACE_ID);
	assertTrustedMutationOrigin(request);
	authorize(membership.role, 'jobs.run');
	return 'member';
}
