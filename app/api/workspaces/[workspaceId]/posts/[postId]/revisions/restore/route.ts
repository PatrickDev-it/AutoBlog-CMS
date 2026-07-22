import { getEditorialService } from '@/src/modules/editorial/service';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { requireMembership } from '@/src/platform/auth/session';
import { dataResponse, withApi } from '@/src/platform/observability/api';

type RouteContext = { params: Promise<{ workspaceId: string; postId: string }> };

export async function POST(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, postId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		assertTrustedMutationOrigin(request);
		return dataResponse(await getEditorialService().restore(membership, postId, await request.json(), requestId));
	})(request);
}
