import Client from '@/_client/@inset/( posts ) [ id ]';
import apiFetch, { ApiRes } from '@/utils/api-fetch';

import revalidate from '@/utils/revalidate';

import type { Post } from '@/types/post';

type Params = { section: string; id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
	const { id, section } = await params;
	const api = generateApi({ id, section });

	const props: ServerProps = {
		section,
		post: await api.getPost(),
		api,
	};

	return <Client {...props} />;
}

export const generateApi = ({ id, section }: Params) => ({
	getPost: async () => {
		'use server';

		const { success, ...rest }: ApiRes<Post> = await apiFetch(`/inset/${section}/${id}`, {
			method: 'GET',
		});

		if (!success) throw new Error(rest.message);

		return rest.data;
	},
	updateImage: async (image: {
		_id: string;
		base64: string;
		display_name: string;
		public_id?: string;
	}) => {
		'use server';
		image._id ??= id;

		const { success, ...rest } = await apiFetch(`/inset/${section}/${id}/image`, {
			method: 'PATCH',
			body: image,
		});

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: [section, id] });
		await revalidate({ kind: 'paths', paths: [`/${section}`, `/${section}/${id}`] });

		return rest.data;
	},
	updatePost: async (post: Partial<Post>) => {
		'use server';

		const { success, ...rest } = await apiFetch(`/inset/${section}/${post._id}/post`, {
			method: 'PATCH',
			body: post,
		});

		if (!success) throw new Error(rest.message);

		await revalidate({ kind: 'tags', tags: [section, id] });
		await revalidate({ kind: 'paths', paths: [`/${section}`, `/${section}/${id}`] });

		return rest.data;
	},
});

export interface ServerProps {
	post: Post;
	section: string;
	api: ReturnType<typeof generateApi>;
}
