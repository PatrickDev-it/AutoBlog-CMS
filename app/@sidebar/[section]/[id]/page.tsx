import { Sidebar } from '@/_client/@sidebar/( posts ) [ id ]';
import { generateApi } from '../page';

import type { Group } from '@/types/group';
import type { Post } from '@/types/post';

type Params = { section: string; id: string };

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

export interface ServerProps {
	section: string;
	groups: Group<Post>[];
	api: ReturnType<typeof generateApi>;
}
