import EnvSwitcher from '@/components/env-switcher';
import { Sidebar, SidebarHeader } from '@/ui/sidebar';

import { Separator } from '@/ui/separator';

export default () => {
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
		</Sidebar>
	);
};

const envs = [
	{
		name: 'Home',
	},
	{
		name: 'Advisory',
	},
	{
		name: 'Journals',
	},
	{
		name: 'Exhibitions',
	},
	{
		name: 'Lifestyle',
	},
];
