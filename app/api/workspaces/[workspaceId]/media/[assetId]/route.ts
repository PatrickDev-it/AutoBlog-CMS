import { getMediaService } from '@/src/modules/media/service';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { requireMembership } from '@/src/platform/auth/session';
import { dataResponse, withApi } from '@/src/platform/observability/api';

type RouteContext = { params: Promise<{ workspaceId: string; assetId: string }> };

export async function GET(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, assetId } = await context.params;
	return withApi(async () => {
		const membership = await requireMembership(request.headers, workspaceId);
		const { asset, data } = await getMediaService().read(membership, assetId);
		return new Response(new Uint8Array(data), {
			headers: { 'content-type': asset.mimeType, 'content-length': String(asset.byteSize), 'cache-control': 'private, max-age=300', 'x-content-type-options': 'nosniff' },
		});
	})(request);
}

export async function DELETE(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId, assetId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		assertTrustedMutationOrigin(request);
		await getMediaService().delete(membership, assetId, requestId);
		return dataResponse({ deleted: true });
	})(request);
}
