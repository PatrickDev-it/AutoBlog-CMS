import Link from 'next/link';
import { SidebarMenuSubButton, SidebarMenuSubItem } from '@/ui/sidebar';
import { useState } from 'react';
import Context from './context';
import { Input } from '@/ui/input';

import { MdDeleteSweep } from 'react-icons/md';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';

export default function Item({ id, name, title, section, selected, ...actions }: Props) {
	const [toRename, setToRename] = useState<boolean>(false);

	return (
		<SidebarMenuSubItem key={id} data-selected={selected}>
			<Context
				actions={[
					{
						children: (
							<span className="flex flex-row justify-between items-center w-full gap-x-3.5">
								Rename
								<MdOutlineDriveFileRenameOutline className="size-5" />
							</span>
						),
						onClick: () => setToRename(true),
					},
					{
						children: (
							<span className="flex flex-row justify-between items-center w-full gap-x-3.5">
								Delete
								<MdDeleteSweep className="size-5" />
							</span>
						),
						className: 'text-red-400',
						onClick: () => actions.onDelete(id),
					},
				]}>
				<EditableItem
					{...{ id, name, title, section }}
					toRename={toRename}
					onRename={rename => {
						setToRename(false);
						if (!rename || !rename.trim().length || rename === name) return;
						actions.onRename(rename);
					}}
					onDelete={() => actions.onDelete(id)}
				/>
			</Context>
		</SidebarMenuSubItem>
	);
}

export const EditableItem = ({
	id,
	name,
	section,
	toRename = false,
	onRename,
}:
	| (Partial<Props> & { toRename: true; onRename: (name: string) => void })
	| (Props & { toRename: false })) => {
	const [rename, setRename] = useState<string>(name ?? '');

	return toRename ? (
		<SidebarMenuSubButton
			className="hover:bg-background bg-background"
			asChild
			onBlur={() => onRename('')}>
			<Input
				autoFocus
				value={rename}
				onChange={e => setRename(e.target.value)}
				onKeyDown={e => {
					if (e.key === 'Enter') onRename(rename);
				}}
				className="leading-7 w-full p-0  !ring-0 placeholder:text-xs"
			/>
		</SidebarMenuSubButton>
	) : (
		<SidebarMenuSubButton
			asChild
			className=" [*&:is([data-selected=true]_*)]:!bg-sidebar-accent">
			<Link href={`/${section}/${id}`} className="!line-clamp-1 leading-7">
				{name}
			</Link>
		</SidebarMenuSubButton>
	);
};

export type Actions = {
	onRename: (name: string) => void;
	onDelete: (groupId: string) => void;
};

export interface Props extends Actions {
	id: string;
	name: string;
	title: string;
	section: string;
	selected: boolean;
}
