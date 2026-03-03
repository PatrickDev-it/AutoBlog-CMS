import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CgSortAz } from 'react-icons/cg';

import Group, { EditableGroup } from './group';
import { SidebarGroup, SidebarMenu } from '@/ui/sidebar';

import type { Group as GroupType } from '@/_server/@dashboard/( journals )';
import SubGroup from './subGroup';

export default function Groups({ groups: initGroups, section, ...actions }: Props) {
	const [groups, setGroups] = useState<GroupType[]>(initGroups);
	const [addGroup, setAddGroup] = useState<string | null>(null);
	const [addSubGroup, setAddSubGroup] = useState<string | null>(null);

	return (
		<>
			<div className="!p-[--sidebar-p]">
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
				<EditableGroup
					active
					setActive={active => setAddGroup(y => (active ? y : null))}
					onSendChanges={name => {
						console.log('onSendChanges', name);
						actions.group.onCreate(name);
						setAddGroup(null);
					}}
				/>
			)}
			{groups.map(group => (
				<SidebarGroup className="!p-[calc(var(--p)/2)]">
					<Group
						key={group._id}
						{...group}
						section={section}
						onDelete={_id => {
							actions.group.onDelete(_id);
							setGroups(y =>
								y.filter(x => x._id !== _id)
							);
						}}
						onRename={name => {
							actions.group.onRename({
								_id: group._id,
								name,
							});
							setGroups(y =>
								y.map(x =>
									x._id === group._id
										? { ...x, name }
										: x
								)
							);
						}}
						onAddSubGroup={() => setAddSubGroup(group._id)}
					/>
				</SidebarGroup>
			))}
		</>
	);
}

interface Props extends Actions {
	groups: Group[];
	section: string;
}

interface Actions {
	group: {
		onCreate: (name: string) => { _id: string; name: string };
		onRename: ({ _id, name }: { _id: string; name: string }) => void;
		onDelete: (groupId: string) => void;
	};
	subGroup: {
		onCreate: (groupId: string, subGroupName: string) => void;
		onRename: ({ _id, name }: { _id: string; name: string }) => void;
		onDelete: (subGroupId: string) => void;
	};
}
