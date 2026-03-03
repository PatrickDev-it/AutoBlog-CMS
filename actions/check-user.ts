'use server';

export default async (username: string, secretToken: string) => {
	const valid = !!username?.trim?.() && !!secretToken?.trim?.();

	return {
		success: valid ? 1 : 0,
		data: { authorized: valid },
		message: valid ? 'Demo mode: access granted.' : 'Demo mode: missing credentials.',
	};
};
