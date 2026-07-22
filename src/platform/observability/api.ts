import { normalizeError } from '@/src/platform/observability/errors';

type ApiHandler = (request: Request, requestId: string) => Promise<Response>;

export function withApi(handler: ApiHandler): (request: Request) => Promise<Response> {
	return async (request) => {
		const requestId = request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID();
		try {
			const response = await handler(request, requestId);
			response.headers.set('x-request-id', requestId);
			return response;
		} catch (unknownError) {
			const error = normalizeError(unknownError);
			const internal = error.cause instanceof Error ? error.cause.message : undefined;
			console.error(JSON.stringify({ level: 'error', requestId, code: error.code, path: new URL(request.url).pathname, internal }));
			return Response.json({ error: { code: error.code, message: error.message, requestId, ...(error.details ? { details: error.details } : {}) } }, { status: error.status, headers: { 'x-request-id': requestId } });
		}
	};
}

export function dataResponse<T>(data: T, init?: ResponseInit): Response {
	return Response.json({ data }, init);
}
