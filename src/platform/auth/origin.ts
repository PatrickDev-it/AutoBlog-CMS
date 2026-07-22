import { getEnvironment } from '@/src/platform/config/env';
import { AppError } from '@/src/platform/observability/errors';

export function assertTrustedMutationOrigin(request: Request): void {
	const origin = request.headers.get('origin');
	const fetchSite = request.headers.get('sec-fetch-site');
	if (fetchSite === 'cross-site') throw new AppError('FORBIDDEN');
	if (!origin || origin !== new URL(getEnvironment().NEXT_PUBLIC_APP_URL).origin) throw new AppError('FORBIDDEN');
}
