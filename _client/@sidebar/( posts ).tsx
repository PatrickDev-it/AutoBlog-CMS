'use client';

import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { CgSortAz } from 'react-icons/cg';

import Group, { EditableGroup } from '@/components/groups/group';
import SubGroup from '@/components/groups/subGroup';
import Item from '@/components/groups/item';

import type { ServerProps } from '@/app/@sidebar/[section]/page';

import { useParams } from 'next/navigation';
import type { Group as GroupType } from '@/types/group';
import { Post } from '@/types/post';

export const Main = ({ text }: { text: string }) => (
	<div className="flex size-full ">
		<h2 className="text-xl font-semibold m-auto">{text}</h2>
	</div>
);

export const Sidebar = ({ api, groups: initGroups, section }: ServerProps) => {
	const params = useParams();
	const [postId] = [params.id].flat();

	const [groups, setGroups] = useState<GroupType<Post>[]>(initGroups as any);
	const [addGroup, setAddGroup] = useState<string | null>(null);

	return (
		<>
			<div className="!p-[calc(var(--p)/2)] group-data-[collapsible=icon]:invisible">
				<div className="flex flex-row items-center justify-between w-full  opacity-70 px-2">
					<p className="text-sm tracking-wider">Groups</p>

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
					toRename
					onRename={async name => {
						setAddGroup(null);
						if (!name || !name.trim().length) return;

						await api.createGroup(name);

						setGroups(await api.getGroups());
					}}
				/>
			)}
			{groups?.length > 0 &&
				groups.map(group => (
					<Group
						key={group.id}
						{...group}
						onCreateSubGroup={async subGroupName => {
							await api.createSubGroup({
								group,
								name: subGroupName,
							});

							setGroups(await api.getGroups());
						}}
						onRename={async ({ id, name }) => {
							await api.renameGroup({ id, name });
							setGroups(await api.getGroups());
						}}
						onDelete={async id => {
							await api.deleteGroup(id);
							setGroups(await api.getGroups());
						}}>
						{group?.sub_groups?.length > 0 &&
							group.sub_groups.map(subGroup => (
								<SubGroup
									key={subGroup.id}
									defaultOpen={
										!!params.id &&
										subGroup.items.some(
											item => item.id === postId
										)
									}
									{...subGroup}
									onDelete={async subGroupId => {
										await api.deleteSubGroup(subGroupId);
										setGroups(await api.getGroups());
									}}
									onRename={async sub_group => {
										await api.renameSubGroup(sub_group);
										setGroups(await api.getGroups());
									}}
									onCreateNewPost={async name => {
										await api.createPost({
											group,
											sub_group: subGroup,
											name,
										});
										setGroups(await api.getGroups());
									}}>
									{subGroup?.items?.length > 0 &&
										subGroup.items.map(item => (
											<Item
												key={item.id}
												{...item}
												section={section}
												selected={
													item.id === postId
												}
												onRename={async name => {
													await api.renamePost({
														id: item.id,
														name,
													});
													setGroups(
														await api.getGroups()
													);
												}}
												onDelete={async id => {
													await api.deletePost(
														id
													);
													setGroups(
														await api.getGroups()
													);
												}}
											/>
										))}
								</SubGroup>
							))}
					</Group>
				))}
		</>
	);
};
