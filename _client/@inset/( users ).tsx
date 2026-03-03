'use client';

import { ServerProps } from '@/app/@sidebar/users/page';
import Context from '@/components/groups/context';
import MembersPage from '@/components/members-page';
import { Input } from '@/ui/input';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
} from '@/ui/sidebar';
import { SectionIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useState } from 'react';

export const Sidebar = ({ api, roles }: ServerProps) => {
	return (
		<SidebarGroup className="!p-[calc(var(--p)/2)]">
			<SidebarGroupLabel className="flex flex-row gap-x-2 w-full capitalize justify-between items-center">
				<span className="w-10/12 h-fit">Roles</span>
			</SidebarGroupLabel>
			<SidebarMenu>
				{roles.map(role => (
					<Role key={role.id} {...role} />
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
};

export { Main } from './( users ) [ id ]';

const Role = ({
	id,
	name,
}: {
	children?: React.ReactNode;
	id: string;
	name: string;
	onRename: (name: string) => void;
}) => {
	const [rename, setRename] = useState<string | null>(null);

	return (
		<SidebarMenuItem className="w-full">
			<Context
				actions={[
					{ children: 'Rename', onClick: () => setRename(name) },
					{ children: 'Delete', className: 'text-red-400' },
				]}>
				<SidebarMenuButton
					asChild
					tooltip={name}
					className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground"
					onBlur={() => setRename(null)}>
					{typeof rename === 'string' ? (
						<>
							<SectionIcon className="group-data-[collapsible=icon]:size-5 text-zinc-500 group-data-[state=open]/collapsible:text-white" />
							<Input
								className="h-fit w-full py-1 px-1.5"
								autoFocus
								value={rename}
								onChange={e =>
									setRename(e.target.value)
								}
								onBlur={() => setRename(null)}
							/>
						</>
					) : (
						<Link href={`/users/${id}`}>
							<SectionIcon className="group-data-[collapsible=icon]:size-5 text-zinc-500 group-data-[state=open]/collapsible:text-white" />
							<span className=" !line-clamp-1 leading-7">
								{name}
							</span>
						</Link>
					)}
				</SidebarMenuButton>
			</Context>
		</SidebarMenuItem>
	);
};
