import { getMediaService } from '@/src/modules/media/service';
import { assertTrustedMutationOrigin } from '@/src/platform/auth/origin';
import { requireMembership } from '@/src/platform/auth/session';
import { getEnvironment } from '@/src/platform/config/env';
import { dataResponse, withApi } from '@/src/platform/observability/api';
import { AppError } from '@/src/platform/observability/errors';

type RouteContext = { params: Promise<{ workspaceId: string }> };

async function boundedFormData(request: Request, maxBytes: number): Promise<FormData> {
	const limit = maxBytes + 256 * 1024;
	const declared = Number(request.headers.get('content-length') ?? '0');
	if (declared > limit) throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'size' });
	const reader = request.body?.getReader();
	if (!reader) throw new AppError('VALIDATION_FAILED');
	const chunks: Uint8Array[] = [];
	let received = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		received += value.byteLength;
		if (received > limit) { await reader.cancel(); throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'size' }); }
		chunks.push(value);
	}
	const body = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
	return new Request(request.url, { method: 'POST', headers: request.headers, body }).formData();
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId } = await context.params;
	return withApi(async () => {
		const membership = await requireMembership(request.headers, workspaceId);
		const postId = new URL(request.url).searchParams.get('postId');
		if (!postId) throw new AppError('VALIDATION_FAILED', { field: 'postId' });
		return dataResponse(await getMediaService().list(membership, postId));
	})(request);
}

export async function POST(request: Request, context: RouteContext): Promise<Response> {
	const { workspaceId } = await context.params;
	return withApi(async (_request, requestId) => {
		const membership = await requireMembership(request.headers, workspaceId);
		assertTrustedMutationOrigin(request);
		const form = await boundedFormData(request, getEnvironment().MEDIA_MAX_BYTES);
		const file = form.get('file');
		if (!(file instanceof File)) throw new AppError('VALIDATION_FAILED', { field: 'file' });
		const asset = await getMediaService().upload(membership, {
			postId: form.get('postId'), replaceAssetId: form.get('replaceAssetId') ?? undefined,
			altText: form.get('altText') ?? undefined, fileName: file.name,
			declaredMimeType: file.type, data: Buffer.from(await file.arrayBuffer()),
		}, requestId);
		return dataResponse(asset, { status: 201 });
	})(request);
}
