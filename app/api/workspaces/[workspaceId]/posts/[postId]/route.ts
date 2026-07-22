import { getEditorialService } from '@/src/modules/editorial/service';
import { requireMembership } from '@/src/platform/auth/session';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { dataResponse, withApi } from '@/src/platform/observability/api';

type RouteContext = { params: Promise<{ workspaceId: string; postId: string }> };

export async function GET(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, postId } = await context.params;
	return withApi(async () => {
		const membership = await requireMembership(request.headers, workspaceId);
		return dataResponse(await getEditorialService().get(membership, postId));
	})(request);
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, postId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		assertTrustedMutationOrigin(request);
		return dataResponse(await getEditorialService().save(membership, postId, await request.json(), requestId));
	})(request);
}
