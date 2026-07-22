import { eq } from 'drizzle-orm';
import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/src/platform/auth/auth';
import { assertRuntimeConfiguration } from '@/src/platform/config/env';
import { getDatabase } from '@/src/platform/db/client';
import { auditEvents, memberships } from '@/src/platform/db/schema';

const handlers = toNextJsHandler(auth);

async function recordIdentityEvent(userId: string, action: 'identity.login' | 'identity.logout', requestId: string): Promise<void> {
	const workspaceRows = await getDatabase().db.select({ workspaceId: memberships.workspaceId }).from(memberships).where(eq(memberships.userId, userId));
	if (workspaceRows.length === 0) return;
	await getDatabase().db.insert(auditEvents).values(workspaceRows.map(({ workspaceId }) => ({
		id: crypto.randomUUID(), workspaceId, actorId: userId, action,
		targetType: 'session', targetId: null, requestId, metadata: {}, createdAt: new Date(),
	})));
}

async function handle(request: Request, method: 'GET' | 'POST'): Promise<Response> {
	const requestId = request.headers.get('x-request-id')?.slice(0, 100) || crypto.randomUUID();
	try {
		assertRuntimeConfiguration();
	} catch {
		return Response.json({ error: { code: 'PROVIDER_UNAVAILABLE', message: 'Authentication is not configured.', requestId } }, { status: 503, headers: { 'x-request-id': requestId } });
	}

	const path = new URL(request.url).pathname;
	const beforeSession = path.endsWith('/sign-out') ? await auth.api.getSession({ headers: request.headers }) : null;
	const response = await handlers[method](request);
	response.headers.set('x-request-id', requestId);
	if (!response.ok) {
		const code = response.status === 429 ? 'RATE_LIMITED' : response.status === 401 ? 'UNAUTHENTICATED' : response.status < 500 ? 'VALIDATION_FAILED' : 'INTERNAL_FAILURE';
		const message = code === 'RATE_LIMITED' ? 'Too many authentication attempts. Try again later.' : code === 'UNAUTHENTICATED' ? 'The supplied credentials are invalid.' : code === 'VALIDATION_FAILED' ? 'The authentication request is invalid.' : 'Authentication could not be completed.';
		return Response.json({ code, message, requestId }, { status: response.status, headers: { 'x-request-id': requestId } });
	}

	if (response.ok && path.endsWith('/sign-in/email')) {
		const sessionCookie = response.headers.get('set-cookie')?.split(';', 1)[0];
		if (sessionCookie) {
			const session = await auth.api.getSession({ headers: new Headers({ cookie: sessionCookie }) });
			if (session) await recordIdentityEvent(session.user.id, 'identity.login', requestId);
		}
	}
	if (response.ok && beforeSession && path.endsWith('/sign-out')) await recordIdentityEvent(beforeSession.user.id, 'identity.logout', requestId);
	return response;
}

export const GET = (request: Request) => handle(request, 'GET');
export const POST = (request: Request) => handle(request, 'POST');
