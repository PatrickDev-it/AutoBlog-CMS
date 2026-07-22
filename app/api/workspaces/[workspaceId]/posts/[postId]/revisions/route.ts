import { getEditorialService } from '@/src/modules/editorial/service';
import { requireMembership } from '@/src/platform/auth/session';
import { dataResponse, withApi } from '@/src/platform/observability/api';

type RouteContext = { params: Promise<{ workspaceId: string; postId: string }> };

export async function GET(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, postId } = await context.params;
	return withApi(async () => {
		const membership = await requireMembership(request.headers, workspaceId);
		return dataResponse(await getEditorialService().revisions(membership, postId));
	})(request);
}
