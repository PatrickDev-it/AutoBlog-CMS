import { getEditorialService } from '@/src/modules/editorial/service';
import { requireMembership } from '@/src/platform/auth/session';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { dataResponse, withApi } from '@/src/platform/observability/api';

type RouteContext = { params: Promise<{ workspaceId: string }> };

export async function GET(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		const data = await getEditorialService().list(membership);
		return dataResponse(data, { headers: { 'x-operation-id': requestId } });
	})(request);
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		assertTrustedMutationOrigin(request);
		const data = await getEditorialService().create(membership, await request.json(), requestId);
		return dataResponse(data, { status: 201 });
	})(request);
}
