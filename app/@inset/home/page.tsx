import Client from '@/_client/@inset/( home )';
import apiFetch, { ApiRes } from '@/utils/api-fetch';
import revalidate from '@/utils/revalidate';

export const dynamic = 'force-dynamic';

export default async function Page() {
	const images = await api.getHome();
	const props: ServerProps = { images, api };

	return <Client {...props} />;
}

export const api = {
	getHome: async () => {
		'use server';
		const { success, ...rest }: ApiRes<ServerProps['images']> = await apiFetch(
			'/inset/home',
			{
				method: 'GET',
			}
		);

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: ['home'] });
		await revalidate({ kind: 'paths', paths: ['/'] });

		return rest.data;
	},
	uploadImage: async ({
		section,
		...image
	}: ServerProps['images'][number] & { base64: string }) => {
		'use server';

		const { success, ...rest } = await apiFetch(`/inset/home/${section}/image`, {
			method: 'PATCH',
			body: { display_name: 'main', ...image },
		});

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: ['home'] });
		await revalidate({ kind: 'paths', paths: ['/'] });

		return rest.data;
	},
};

export type ServerProps = {
	api: typeof api;
	images: { section: string; public_id: string; display_name: string }[];
};
