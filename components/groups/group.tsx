import { SidebarGroup, SidebarGroupLabel, SidebarMenuButton } from '@/ui/sidebar';
import { Input } from '@/ui/input';
import { useState } from 'react';
import Context from './context';

import { Plus } from 'lucide-react';

import type { ReactNode } from 'react';
import { SectionIcon } from '@radix-ui/react-icons';
import { MdDeleteSweep, MdOutlineDriveFileRenameOutline } from 'react-icons/md';

export default function Group({ children, id, name, ...actions }: Props) {
	const [toRename, setToRename] = useState<boolean>(false);

	return (
		<SidebarGroup className="!p-[--sidebar-p]">
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
				<EditableGroup
					group={{ id, name }}
					toRename={toRename}
					onRename={rename => {
						setToRename(false);
						if (!rename || !rename.trim().length || rename === name) return;
						actions.onRename({ id, name: rename });
					}}
					onCreateSubGroup={subGroupName =>
						actions.onCreateSubGroup(subGroupName)
					}
				/>
			</Context>
			{children}
		</SidebarGroup>
	);
}

export const EditableGroup = ({
	group,
	toRename = false,
	onRename,
	onCreateSubGroup,
}: {
	group?: { id: string; name: string };
	toRename?: boolean;
	onRename?: (name: string) => void;

	onCreateSubGroup?: (subGroupName: string) => void;
	onSort?: () => void;
}) => {
	const [rename, setRename] = useState<string>(group?.name ?? '');
	const [addSubGroup, setAddSubGroup] = useState<{ active: boolean; subGroup: string }>({
		active: false,
		subGroup: '',
	});

	return (
		<>
			<SidebarGroupLabel
				className="flex flex-row gap-x-2 w-full capitalize justify-between items-center"
				onBlur={() => onRename('')}>
				<span className="w-full h-fit">
					{toRename ? (
						<div className="w-full h-fit px-1.5">
							<Input
								autoFocus
								value={rename}
								onChange={e => setRename(e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										onRename(rename);
									}
								}}
								className="!text-xs h-fit w-full py-1 "
							/>
						</div>
					) : (
						group?.name
					)}
				</span>
				{onCreateSubGroup && (
					<button
						className="col-span-1 opacity-70"
						onClick={() =>
							setAddSubGroup(p => ({
								...p,
								active: true,
							}))
						}>
						<Plus className="size-4" />
					</button>
				)}
			</SidebarGroupLabel>
			{addSubGroup.active && (
				<SidebarMenuButton
					className="group-data-[collapsible=icon]:!p-1.5 group-data-[collapsible=icon]:hover:[&>svg]:text-foreground"
					onBlur={() => setAddSubGroup(p => ({ ...p, active: false }))}>
					<SectionIcon className="group-data-[collapsible=icon]:size-5 text-zinc-500 group-data-[state=open]/collapsible:text-white" />
					<Input
						className="h-fit w-full py-1 px-1.5"
						autoFocus
						value={addSubGroup.subGroup}
						onChange={e =>
							setAddSubGroup(p => ({
								...p,
								subGroup: e.target.value,
							}))
						}
						onBlur={() =>
							setAddSubGroup(p => ({
								...p,
								active: false,
							}))
						}
						onKeyDown={e => {
							if (e.key === 'Enter') {
								setAddSubGroup(p => ({
									...p,
									active: false,
								}));
								onCreateSubGroup(addSubGroup.subGroup);
							}
						}}
					/>
				</SidebarMenuButton>
			)}
		</>
	);
};

interface Actions {
	onCreateSubGroup: (subGroupName: string) => void;
	onRename: ({ id, name }: { id: string; name: string }) => void;
	onDelete: (groupId: string) => void;
}

interface Props extends Actions {
	children?: ReactNode | ReactNode[];
	id: string;
	name: string;
}
