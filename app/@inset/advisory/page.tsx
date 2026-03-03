import Client from '@/_client/@inset/( advisory )';
import revalidate from '@/utils/revalidate';
import apiFetch from '@/utils/api-fetch';

import type { ApiRes } from '@/utils/api-fetch';

export const dynamic = 'force-dynamic';

export default async function Page() {
	const data = await api.getAdvisory();

	const props: ServerProps = { data, api };

	return <Client {...props} />;
}

export const api = {
	getAdvisory: async () => {
		'use server';

		const { success, ...rest }: ApiRes<ServerProps['data']> = await apiFetch(
			'/inset/advisory',
			{
				method: 'GET',
			}
		);
		if (!success) throw new Error(rest.message);

		return rest.data;
	},
	updateAdvisory: async (body: Omit<Pick<ServerProps, 'data'>, 'image'>) => {
		'use server';

		const { success, ...rest } = await apiFetch('/inset/advisory', {
			method: 'PATCH',
			body,
		});

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: ['advisory'] });
		await revalidate({ kind: 'paths', paths: ['/advisory'] });

		return rest.data;
	},
	uploadImage: async (image: { base64: string; public_id?: string; display_name?: string }) => {
		'use server';

		const { success, ...rest } = await apiFetch('/inset/advisory/image', {
			method: 'PATCH',
			body: image,
		});

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: ['advisory'] });
		await revalidate({ kind: 'paths', paths: ['/advisory'] });

		return rest.data;
	},
};

export type ServerProps = {
	api: typeof api;
	data: {
		id: string;
		about: string;
		services: string;
		image: { public_id: string; display_name: string };
	};
};
