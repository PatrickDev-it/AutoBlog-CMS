import { getDatabase } from '@/src/platform/db/client';

export async function GET(): Promise<Response> {
	const requestId = crypto.randomUUID();
	try {
		await getDatabase().client.execute('SELECT 1 AS ready');
		return Response.json({ status: 'ready', requestId }, { headers: { 'cache-control': 'no-store', 'x-request-id': requestId } });
	} catch {
		return Response.json({ status: 'unavailable', requestId }, { status: 503, headers: { 'cache-control': 'no-store', 'x-request-id': requestId } });
	}
}
