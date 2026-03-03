'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Button } from '@/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Copy, RefreshCw, Search, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AddMemberDialog } from '@/components/add-member-dialog';
import { ShareableCard } from '@/components/shareable-card';
import { CopyPopup } from '@/components/copy-popup';

interface Member {
	id: string;
	name: string;
	email: string;
	role: 'Admin' | 'Cooperator' | 'Supervisor' | string;
	avatar: string;
	invitationPending?: boolean;
	secretToken: string;
}

const roleDescriptions = {
	Admin: 'Full access to all resources and settings',
	Cooperator: 'Can collaborate on projects and access most resources',
	Supervisor: 'Can oversee projects and team members, with limited admin capabilities',
};

export default function MembersPage({ members }: { members: Member[] }) {
	const [showAddMember, setShowAddMember] = useState(false);
	const [memberList, setMemberList] = useState(members);
	const [showCopyPopup, setShowCopyPopup] = useState(false);
	const [customRoles, setCustomRoles] = useState<string[]>([]);

	const resetToken = (memberId: string) => {
		setMemberList(
			memberList.map(member =>
				member.id === memberId
					? {
							...member,
							secretToken: Math.random()
								.toString(36)
								.substring(2, 15),
					  }
					: member
			)
		);
	};

	const copyToken = (token: string) => {
		navigator.clipboard.writeText(token);
		setShowCopyPopup(true);
		setTimeout(() => setShowCopyPopup(false), 2000);
	};

	const addCustomRole = () => {
		const newRole = prompt('Enter the name of the new role:');
		if (newRole && !customRoles.includes(newRole)) {
			setCustomRoles([...customRoles, newRole]);
		}
	};

	const changeRole = (memberId: string, newRole: string) => {
		setMemberList(
			memberList.map(member =>
				member.id === memberId ? { ...member, role: newRole } : member
			)
		);
	};

	return (
		<div className="grow flex flex-col size-full">
			<div className="mb-6">
				<h1 className="text-xl font-semibold mb-1">Users</h1>
				<p className="text-sm text-gray-500">Manage members access</p>
			</div>

			<div className="flex flex-row items-center justify-between ">
				<div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-2">
					<p className="text-sm text-gray-600">13 members</p>
				</div>
				<Button className="w-fit" onClick={() => setShowAddMember(true)}>
					Add member
				</Button>
			</div>

			<div className="space-y-4">
				{memberList.map(member => (
					<div
						key={member.id}
						className="flex flex-row items-center justify-between bg-white shadow rounded-lg p-[--p] gap-[--p] w-full">
						<div className="grid grid-cols-5 gap-[--p] max-w-96 w-full">
							<div className="flex flex-row items-center space-x-[--p] col-span-3 size-full">
								<Avatar>
									<AvatarImage
										src={member.avatar}
									/>
									<AvatarFallback>
										{member.name.charAt(
											0
										)}
									</AvatarFallback>
								</Avatar>
								<div className="flex flex-col ">
									<p className="font-medium line-clamp-1">
										{member.name}
									</p>
									<p className="text-sm text-gray-500 line-clamp-1">
										{member.email}
									</p>
								</div>
							</div>

							<div className="flex flex-col items-start justify-between col-span-2 size-full">
								<span className="text-sm text-gray-500 line-clamp-1">
									Secret token
								</span>
								<span className="text-sm font-medium line-clamp-1">
									{member.secretToken}
								</span>
							</div>
						</div>

						{member.invitationPending ? (
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-500">
									Invitation pending
								</span>
								<Button
									variant="secondary"
									size="sm">
									Resend invitation
								</Button>
							</div>
						) : (
							<>
								<DropdownMenu>
									<DropdownMenuTrigger className="lg:hidden">
										<Button
											variant="ghost"
											size="icon">
											<MoreVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() =>
												copyToken(
													member.secretToken
												)
											}>
											Copy token
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												resetToken(
													member.id
												)
											}>
											Reset token
										</DropdownMenuItem>
										<DropdownMenuItem>
											Remove
											member
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<div className="flex flex-row items-center gap-[--p] max-lg:hidden">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											resetToken(
												member.id
											)
										}>
										<RefreshCw className="h-4 w-4 mr-1" />
										Reset
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											copyToken(
												member.secretToken
											)
										}>
										<Copy className="h-4 w-4 mr-1" />
										Copy
									</Button>

									<ShareableCard
										member={member}
									/>
									<Popover>
										<PopoverTrigger
											asChild>
											<Button
												variant="outline"
												className="w-[130px] justify-between">
												{
													member.role
												}
												<ChevronDown className="h-4 w-4 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-[300px] p-0"
											align="end">
											<div className="p-4 space-y-2">
												{Object.entries(
													roleDescriptions
												).map(
													([
														role,
														description,
													]) => (
														<div
															key={
																role
															}
															className="flex items-center justify-between hover:bg-gray-100 p-2 rounded cursor-pointer"
															onClick={() =>
																changeRole(
																	member.id,
																	role
																)
															}>
															<div>
																<p className="font-medium">
																	{
																		role
																	}
																</p>
																<p className="text-sm text-gray-500">
																	{
																		description
																	}
																</p>
															</div>
															{member.role ===
																role && (
																<Check className="h-4 w-4 text-green-500" />
															)}
														</div>
													)
												)}
												{customRoles.map(
													role => (
														<div
															key={
																role
															}
															className="flex items-center justify-between hover:bg-gray-100 p-2 rounded cursor-pointer"
															onClick={() =>
																changeRole(
																	member.id,
																	role
																)
															}>
															<div>
																<p className="font-medium">
																	{
																		role
																	}
																</p>
																<p className="text-sm text-gray-500">
																	Custom
																	role
																</p>
															</div>
															{member.role ===
																role && (
																<Check className="h-4 w-4 text-green-500" />
															)}
														</div>
													)
												)}
												<Button
													variant="outline"
													className="w-full mt-2"
													onClick={
														addCustomRole
													}>
													<Plus className="h-4 w-4 mr-2" />
													Add
													custom
													role
												</Button>
											</div>
										</PopoverContent>
									</Popover>
								</div>
							</>
						)}
					</div>
				))}
			</div>
			<AddMemberDialog open={showAddMember} onOpenChange={setShowAddMember} />

			<CopyPopup isVisible={showCopyPopup} />
		</div>
	);
}
