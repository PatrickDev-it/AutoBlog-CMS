import EnvSwitcher from '@/components/env-switcher';
import { Sidebar, SidebarHeader } from '@/ui/sidebar';

import type { PropsWithChildren } from 'react';
import { Separator } from '@/ui/separator';
import { sections } from '@/constants/sections';

export default ({ children }: PropsWithChildren) => {
	return (
		<Sidebar className="p-[--external-p] bg-transparent !border-none gap-[--p]">
			<SidebarHeader className="!pt-[--sidebar-p] !pb-0 !px-0">
				<div className="relative h-clamp-10 max-md:min-h-12 w-full">
					<EnvSwitcher envs={envs} />
				</div>
			</SidebarHeader>
			<div className="px-[--sidebar-p]">
				<Separator />
			</div>
			{children}
		</Sidebar>
	);
};

const envs = [
	{
		name: 'Home',
	},

	...sections.map(section => ({
		name: section.charAt(0).toUpperCase() + section.slice(1),
	})),
];
