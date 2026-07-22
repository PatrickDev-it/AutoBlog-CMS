import { authorize } from '@/src/modules/identity/policy';
import { DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import { getEditorialService } from '@/src/modules/editorial/service';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { requireMembership } from '@/src/platform/auth/session';
import { dataResponse, withApi } from '@/src/platform/observability/api';

export async function POST(request: Request): Promise<Response> {
	return withApi(async () => {
		const membership = await requireMembership(request.headers, DEMO_WORKSPACE_ID);
		assertTrustedMutationOrigin(request);
		authorize(membership.role, 'jobs.run');
		return dataResponse(await getEditorialService().runDueJobs());
	})(request);
}
