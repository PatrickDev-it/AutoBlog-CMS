export default async (path: string, options?: Omit<RequestInit, 'body'> & { body?: any }) => {
	try {
		const url = `${
			process.env.NODE_ENV === 'production'
				? 'https://dashboard.beatricetullii.com'
				: 'http://localhost:3000'
		}/api${path}`;
		const res = await fetch(url, {
			...options,
			cache: 'no-store',
			body: JSON.stringify(options?.body),
		});

		if (!res.ok || res.status >= 400)
			throw new Error(`URL: ${url}\nError ${res.status}: ${res.statusText}`);

		return (await res.json()) as ApiRes;
	} catch ({ message }) {
		throw new Error('Api fetch error: ' + message);
	}
};

export type ApiRes<T = any> = { success: 0 | 1; data: T; message: string };
