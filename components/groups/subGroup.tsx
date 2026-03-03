'use client';

import { type ReactNode, useState } from 'react';

import { ChevronRight } from 'lucide-react';
import { SectionIcon } from '@radix-ui/react-icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/collapsible';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/ui/sidebar';

import { Input } from '@/ui/input';
import Context from './context';
import { EditableItem } from './item';

import { MdNoteAdd } from 'react-icons/md';
import { MdDeleteSweep } from 'react-icons/md';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';

export default function SubGroup({
	children,
	onCreateNewPost,
	defaultOpen,
	onRename,
	onDelete,
	...subGroup
}: Props) {
	const [deleted, setDeleted] = useState<boolean>(false);
	const [toRename, setToRename] = useState<boolean>(false);

	const [name, setName] = useState<string | null>(subGroup.name);
	const [newPost, setNewPost] = useState<string | null>(null);

	if (deleted) return null;

	return (
		<SidebarMenu>
			<Collapsible
				key={subGroup.id}
				asChild
				defaultOpen={defaultOpen}
				className="group/collapsible">
				<SidebarMenuItem className="w-full">
					{toRename ? (
						<SidebarMenuButton
							tooltip={name}
							className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground"
							onBlur={() => {
								setToRename(false);
								if (name !== subGroup.name)
									onRename({
										id: subGroup.id,
										name,
									});
							}}>
							<SectionIcon className="group-data-[collapsible=icon]:size-5 text-foreground/50 group-data-[state=open]/collapsible:text-foreground" />
							<Input
								className="h-fit w-full py-1 px-1.5"
								autoFocus
								value={name}
								onChange={e => setName(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										setToRename(false);
										if (name !== subGroup.name)
											onRename({
												id: subGroup.id,
												name,
											});
									}
								}}
							/>
						</SidebarMenuButton>
					) : (
						<Context
							actions={[
								{
									children: (
										<span className="flex flex-row justify-between items-center w-full gap-x-3.5">
											New Post
											<MdNoteAdd className="size-5" />
										</span>
									),

									onClick: () => setNewPost(''),
								},
								{
									children: (
										<span className="flex flex-row justify-between items-center w-full gap-x-3.5">
											Rename
											<MdOutlineDriveFileRenameOutline className="size-5" />
										</span>
									),
									onClick: () => {
										setName(subGroup.name);
										setToRename(true);
									},
								},
								{
									children: (
										<span className="flex flex-row justify-between items-center w-full gap-x-3.5">
											Delete
											<MdDeleteSweep className="size-5" />
										</span>
									),
									className: 'text-red-400',
									onClick: () => onDelete(subGroup.id),
								},
							]}>
							<CollapsibleTrigger className="mx-auto" asChild>
								<SidebarMenuButton
									tooltip={name}
									className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground">
									<SectionIcon className="group-data-[collapsible=icon]:size-5 text-foreground/50 group-data-[state=open]/collapsible:text-foreground" />
									<span>{name}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
						</Context>
					)}
					<CollapsibleContent>
						<SidebarMenuSub onBlur={() => setNewPost(null)}>
							{typeof newPost === 'string' && (
								<EditableItem
									toRename
									onRename={rename => {
										if (
											!rename ||
											!rename.trim().length ||
											rename === name
										)
											return setNewPost(null);
										onCreateNewPost(rename);
										setNewPost(null);
									}}
								/>
							)}
							{children}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		</SidebarMenu>
	);
}

interface Actions {
	onCreateNewPost: (name: string) => void;
	onRename: ({ id, name }: { id: string; name: string }) => void;
	onDelete: (subGroupId: string) => void;
}

interface Props extends Actions {
	children?: ReactNode | ReactNode[];
	id: string;
	name: string;
	defaultOpen?: boolean;
}
