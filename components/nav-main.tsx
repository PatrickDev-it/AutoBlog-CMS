'use client';

import { useCallback, useState } from 'react';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { SectionIcon } from '@radix-ui/react-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/ui/context-menu';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '@/ui/sidebar';

import Link from 'next/link';
import { Input } from './ui/input';
import { CgSortAz } from 'react-icons/cg';
import { Plus } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Separator } from './ui/separator';
import { cn } from '@/utils/shadcn';

import type { Group } from '@/_server/@dashboard/( journals )';

const Context = ({
	actions,
	children,
}: PropsWithChildren & { actions: React.ComponentPropsWithoutRef<typeof ContextMenuItem>[] }) => {
	return (
		<ContextMenu>
			<ContextMenuTrigger>{children}</ContextMenuTrigger>
			<ContextMenuContent className='w-full p-0 [&>[role="menuitem"]]:px-3'>
				<ContextMenuItem {...actions[0]} />
				{actions.slice(1).map(({ className, ...props }, i) => (
					<>
						<Separator key={'separator--' + i} />
						<ContextMenuItem
							key={i}
							className={cn(
								'text-sidebar-foreground/50 hover:bg-accent hover:text-accent-foreground',
								className
							)}
							{...props}
						/>
					</>
				))}
			</ContextMenuContent>
		</ContextMenu>
	);
};

interface Actions {
	group: {
		onCreate: (name: string) => void;
		onRename: ({ _id, name }: { _id: string; name: string }) => void;
		onDelete: (groupId: string) => void;
	};
	subGroup: {
		onCreate: (groupId: string, subGroupName: string) => void;
		onRename: ({ _id, name }: { _id: string; name: string }) => void;
		onDelete: (subGroupId: string) => void;
	};
}

interface Props extends Actions {
	groups: Group[];
	section: string;
}

export default function NavMain({ section, groups: initGroups, ...actions }: Props) {
	const [groups, setGroups] = useState<Group[]>(initGroups);
	const [addGroup, setAddGroup] = useState<string | null>(null);

	return (
		<>
			<div className="!p-[calc(var(--p)/2)]">
				<div className="flex flex-row items-center justify-between w-full  opacity-70 px-2">
					<button>
						<CgSortAz className="size-5 -ml-1" />
					</button>

					<button
						onClick={() => {
							console.log('addGroup', addGroup);
							setAddGroup('');
						}}>
						<Plus className="size-4" />
					</button>
				</div>
			</div>
			{typeof addGroup === 'string' && (
				<Edit.group
					addGroup={addGroup}
					setAddGroup={setAddGroup}
					{...actions}
				/>
			)}
			{groups.map(group => (
				<Group
					key={group._id}
					{...group}
					{...actions}
					onDeleteGroup={_id => {
						actions.group.onDelete(_id);
						setGroups(prev => prev.filter(g => g._id !== _id));
					}}
					onRenameGroup={({ _id, name }) => {
						actions.group.onRename({ _id, name });
						setGroups(prev => {
							return prev.map(g => {
								if (g._id === _id) {
									return {
										...g,
										name,
									};
								}
								return g;
							});
						});
					}}
				/>
			))}
		</>
	);
}

const Edit = {
	group: ({ addGroup, setAddGroup, onCreateGroup, setGroups }) => {
		return (
			<div className="w-full p-[calc(var(--p)/2)]">
				<Input
					className="w-full h-8 !border-none !border-0 !outline-none !ring-0 !ring-transparent placeholder:text-xs"
					placeholder="Group name"
					autoFocus
					value={addGroup}
					onChange={e => setAddGroup(e.target.value)}
					onBlur={e => setAddGroup(null)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							onCreateGroup(addGroup);
							setGroups(prev => [
								{
									id: addGroup,
									name: addGroup,
									sub_groups: [],
								},
								...prev,
							]);
							setAddGroup(null);
						}
					}}
				/>
			</div>
		);
	},
	subGroup: ({ addSubGroup, setAddSubGroup, onCreateSubGroup }) => (
		<SidebarMenuItem className="w-full">
			<SidebarMenuButton onBlur={() => setAddSubGroup(null)}>
				<SectionIcon className="size-4 h-full text-zinc-500 group-data-[state=open]/collapsible:text-white" />
				<Input
					className="w-full !px-0 !border-none !outline-none !ring-0 !bg-transparent rounded-lg placeholder:text-xs"
					placeholder="Subgroup name"
					autoFocus
					value={addSubGroup?.subGroup}
					onChange={e =>
						setAddSubGroup({
							...addSubGroup,
							subGroup: e.target.value,
						})
					}
					onBlur={() => setAddSubGroup(null)}
					onKeyDown={e => {
						if (e.key === 'Enter') {
							const { group, subGroup } = addSubGroup;
							onCreateSubGroup(group._id, subGroup);
						}
					}}
				/>
			</SidebarMenuButton>
		</SidebarMenuItem>
	),
};

const Group = ({
	_id,
	name,
	section,
	sub_groups,
	onDeleteGroup,
	onRenameGroup,
	onCreateSubGroup,
}: Group & Actions) => {
	const [rename, setRename] = useState<string | null>(null);
	const [subGroups, setSubGroups] = useState(sub_groups);
	const [addGroup, setAddGroup] = useState<string | null>(null);
	const [addSubGroup, setAddSubGroup] = useState<{ group: Group; subGroup: string } | null>(
		null
	);
	return (
		<SidebarGroup className="!p-[calc(var(--p)/2)]">
			<Context
				actions={[
					{ children: 'Rename', onClick: () => setRename(name) },
					{
						children: 'Delete',
						className: 'text-red-400',
						onClick: () => onDeleteGroup(_id),
					},
				]}>
				<SidebarGroupLabel className="flex flex-row items-center justify-between w-full capitalize">
					{typeof rename === 'string' ? (
						<Input
							autoFocus
							value={rename}
							onChange={e => setRename(e.target.value)}
							onBlur={() => setRename(null)}
							onKeyDown={e => {
								if (e.key === 'Enter') {
									onRenameGroup({
										_id,
										name: rename,
									});
									setRename(null);
								}
							}}
						/>
					) : (
						<>
							{name}
							<div className="flex flex-row items-center justify-between w-fit gap-2 opacity-70">
								<button>
									<CgSortAz className="size-4" />
								</button>

								<button
									onClick={() =>
										setAddSubGroup({
											group: {
												_id,
												name,
											},
											subGroup: '',
										})
									}>
									<Plus className="size-4" />
								</button>
							</div>
						</>
					)}
				</SidebarGroupLabel>
			</Context>
			<SidebarMenu className="">
				{addSubGroup && (
					<SidebarMenuItem className="w-full">
						<SidebarMenuButton
							onBlur={() => setAddSubGroup(null)}>
							<SectionIcon className="size-4 h-full text-zinc-500 group-data-[state=open]/collapsible:text-white" />
							<Input
								className="w-full !px-0 !border-none !outline-none !ring-0 !bg-transparent rounded-lg placeholder:text-xs"
								placeholder="Subgroup name"
								autoFocus
								value={addSubGroup?.subGroup}
								onChange={e =>
									setAddSubGroup({
										...addSubGroup,
										subGroup: e.target
											.value,
									})
								}
								onBlur={() => setAddSubGroup(null)}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										const {
											group,
											subGroup,
										} = addSubGroup;
										onCreateSubGroup(
											group._id,
											subGroup
										);
									}
								}}
							/>
						</SidebarMenuButton>
					</SidebarMenuItem>
				)}
				{subGroups &&
					subGroups.map(sub_group => (
						<SubGroup key={_id} {...sub_group} />
					))}
			</SidebarMenu>
		</SidebarGroup>
	);
};

const Item = ({ _id, name, url, icon: Icon }: Group['sub_groups'][number]['items'][number]) => {
	return (
		<SidebarMenuSubItem key={subItem.title}>
			<SidebarMenuSubButton asChild>
				<Link
					href={`/${section}/${subItem._id}`}
					className="!line-clamp-1 leading-7">
					{subItem.title}
				</Link>
			</SidebarMenuSubButton>
		</SidebarMenuSubItem>
	);
};

const SubGroup = ({ _id, name, items }: Group['sub_groups'][number] & Actions['']) => {
	const [rename, setRename] = useState<string | null>(null);

	return (
		<Context actions={[{ children: 'Rename', onClick: () => setRename(name) }]}>
			<Collapsible key={_id} asChild className="group/collapsible">
				<SidebarMenuItem className="w-full">
					{typeof rename === 'string' ? (
						<SidebarMenuButton
							tooltip={name}
							className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground"
							onBlur={() => setRename(null)}>
							<SectionIcon className="group-data-[collapsible=icon]:size-5 text-zinc-500 group-data-[state=open]/collapsible:text-white" />
							<Input
								className="!px-0 !border-none !outline-none !ring-0 !bg-transparent placeholder:text-xs !cursor-pointer"
								autoFocus
								value={name}
								onChange={e =>
									setRename(e.target.value)
								}
								onBlur={() => setRename(null)}
							/>
							<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
						</SidebarMenuButton>
					) : (
						<CollapsibleTrigger className="mx-auto" asChild>
							<SidebarMenuButton
								tooltip={name}
								className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground">
								<SectionIcon className="group-data-[collapsible=icon]:size-5 text-zinc-500 group-data-[state=open]/collapsible:text-white" />
								<span>{name}</span>
								<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
							</SidebarMenuButton>
						</CollapsibleTrigger>
					)}

					<CollapsibleContent>
						<SidebarMenuSub>
							{items?.map(subItem => (
								<Item
									key={subItem._id}
									{...subItem}
								/>
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		</Context>
	);
};
