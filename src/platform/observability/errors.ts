import { z } from 'zod';

export const errorCodeSchema = z.enum([
	'UNAUTHENTICATED',
	'FORBIDDEN',
	'NOT_FOUND',
	'VALIDATION_FAILED',
	'VERSION_CONFLICT',
	'ILLEGAL_TRANSITION',
	'QUOTA_EXCEEDED',
	'RATE_LIMITED',
	'PROVIDER_UNAVAILABLE',
	'INTERNAL_FAILURE',
]);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

const PUBLIC_ERRORS: Readonly<Record<ErrorCode, { status: number; message: string }>> = {
	UNAUTHENTICATED: { status: 401, message: 'Authentication is required.' },
	FORBIDDEN: { status: 403, message: 'You do not have permission to perform this action.' },
	NOT_FOUND: { status: 404, message: 'The requested resource was not found.' },
	VALIDATION_FAILED: { status: 422, message: 'The request did not pass validation.' },
	VERSION_CONFLICT: { status: 409, message: 'A newer version exists. Reload or compare before saving.' },
	ILLEGAL_TRANSITION: { status: 409, message: 'The requested editorial transition is not allowed.' },
	QUOTA_EXCEEDED: { status: 429, message: 'The workspace quota has been reached.' },
	RATE_LIMITED: { status: 429, message: 'Too many requests. Try again later.' },
	PROVIDER_UNAVAILABLE: { status: 503, message: 'The configured provider is temporarily unavailable.' },
	INTERNAL_FAILURE: { status: 500, message: 'The request could not be completed.' },
};

export class AppError extends Error {
	readonly code: ErrorCode;
	readonly status: number;
	readonly details: Readonly<Record<string, unknown>> | undefined;

	constructor(code: ErrorCode, details?: Readonly<Record<string, unknown>>, cause?: unknown) {
		super(PUBLIC_ERRORS[code].message, { cause });
		this.name = 'AppError';
		this.code = code;
		this.status = PUBLIC_ERRORS[code].status;
		this.details = details;
	}
}

export function normalizeError(error: unknown): AppError {
	if (error instanceof AppError) return error;
	if (error instanceof z.ZodError) return new AppError('VALIDATION_FAILED', { issues: error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })) });
	return new AppError('INTERNAL_FAILURE', undefined, error);
}
