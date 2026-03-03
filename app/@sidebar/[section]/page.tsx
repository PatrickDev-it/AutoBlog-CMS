import { Sidebar } from '@/_client/@sidebar/( posts )';
import revalidate from '@/utils/revalidate';
import apiFetch from '@/utils/api-fetch';

import type { ApiRes } from '@/utils/api-fetch';
import type { Group } from '@/types/group';
import type { Post } from '@/types/post';

type Params = { section: string };

export default async function Page({ params }: { params: Promise<Params> }) {
	const { section } = await params;

	const api = generateApi({ section });

	const groups = await api.getGroups();
	const props: ServerProps = {
		section,
		groups,
		api,
	};

	return <Sidebar {...props} />;
}

export const generateApi = ({ section }: Params) => ({
	getGroups: async () => {
		'use server';
		const { success, ...rest }: ApiRes<Group<Post>[]> = await apiFetch(
			`/sidebar/${section}`,
			{
				method: 'GET',
			}
		);

		if (!success) throw new Error(rest.message);

		return rest.data;
	},
	createGroup: async (name: string) => {
		'use server';

		const { data } = await apiFetch(`/sidebar/${section}/group/id`, {
			method: 'POST',
			body: { name },
		});

		return data;
	},
	createSubGroup: async (body: { name: string; group: { id: string; name: string } }) => {
		'use server';
		console.log('body', body);
		const { data } = await apiFetch(`/sidebar/${section}/subgroup/id`, {
			method: 'POST',
			body,
		});

		return data;
	},
	createPost: async (body: {
		name: string;
		group: { id: string; name: string };
		sub_group: { id: string; name: string };
	}) => {
		'use server';

		const { data } = await apiFetch(`/sidebar/${section}/id`, {
			method: 'POST',
			body,
		});

		return data;
	},

	renameGroup: async (body: { id: string; name: string }) => {
		'use server';

		await apiFetch(`/sidebar/${section}/group/${body.id}`, { method: 'PATCH', body });
	},
	renameSubGroup: async (body: { id: string; name: string }) => {
		'use server';

		await apiFetch(`/sidebar/${section}/subgroup/${body.id}`, {
			method: 'PATCH',
			body,
		});
	},
	renamePost: async (body: { id: string; name: string }) => {
		'use server';

		await apiFetch(`/sidebar/${section}/${body.id}`, { method: 'PATCH', body });
	},

	deleteGroup: async (_id: string) => {
		'use server';

		await apiFetch(`/sidebar/${section}/group/${_id}`, {
			method: 'DELETE',
			body: { id: _id },
		});
	},
	deleteSubGroup: async (_id: string) => {
		'use server';

		await apiFetch(`/sidebar/${section}/subgroup/${_id}`, {
			method: 'DELETE',
			body: { id: _id },
		});
	},
	deletePost: async (_id: string) => {
		'use server';

		const { success, ...rest } = await apiFetch(`/sidebar/${section}/${_id}`, {
			method: 'DELETE',
			body: { id: _id },
		});

		if (!success) throw new Error(rest.message);

		revalidate({ kind: 'path', path: `/${section}` });
		revalidate({ kind: 'path', path: `/${section}/${_id}` });

		return rest.data;
	},
});

export interface ServerProps {
	section: string;
	groups: Group<Post>[];
	api: ReturnType<typeof generateApi>;
}
