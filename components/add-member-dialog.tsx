'use client';

import type React from 'react';
import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel,
} from '@/ui/alert-dialog';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Separator } from '@/ui/separator';
import { Copy, Mail } from 'lucide-react';

const permissions = [
	{
		id: 'view-projects',
		label: 'View projects',
		description: 'Can view all projects in the organization',
	},
	{
		id: 'create-projects',
		label: 'Create projects',
		description: 'Can create new projects',
	},
	{
		id: 'edit-projects',
		label: 'Edit projects',
		description: 'Can edit existing projects',
	},
	{
		id: 'delete-projects',
		label: 'Delete projects',
		description: 'Can delete existing projects',
	},
	{
		id: 'manage-members',
		label: 'Manage members',
		description: 'Can add/remove members and modify their roles',
	},
	{
		id: 'billing-access',
		label: 'Billing access',
		description: 'Can view and modify billing information',
	},
];

interface AddMemberDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [role, setRole] = useState('member');
	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
	const [useGoogleAccount, setUseGoogleAccount] = useState(false);

	const inviteLink = 'https://acme.com/invite/xyz123'; // This would be generated dynamically

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		console.log({ email, username, role, selectedPermissions, useGoogleAccount });
		onOpenChange(false);
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="max-w-2xl">
				<AlertDialogHeader>
					<AlertDialogTitle>Add new member</AlertDialogTitle>
					<AlertDialogDescription>
						Invite a new member to your organization. They will
						receive an email invitation.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<form onSubmit={onSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								placeholder="member@example.com"
								value={email}
								onChange={e =>
									setEmail(e.target.value)
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								placeholder="johndoe"
								value={username}
								onChange={e =>
									setUsername(e.target.value)
								}
								required
							/>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="useGoogleAccount"
								checked={useGoogleAccount}
								onCheckedChange={checked =>
									setUseGoogleAccount(
										checked as boolean
									)
								}
							/>
							<div className="grid gap-1.5 leading-none">
								<Label htmlFor="useGoogleAccount">
									Use Google Account
								</Label>
								<p className="text-sm text-muted-foreground">
									Allow sign in with Google
									account using this email
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Invitation link</Label>
							<div className="flex space-x-2">
								<Input
									readOnly
									value={inviteLink}
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									onClick={() =>
										navigator.clipboard.writeText(
											inviteLink
										)
									}>
									<Copy className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">
								Share this link to invite members
								directly
							</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Role</Label>
							<RadioGroup
								value={role}
								onValueChange={setRole}>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="admin"
										id="admin"
									/>
									<Label htmlFor="admin">
										Admin - Full access
										to all resources
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem
										value="member"
										id="member"
									/>
									<Label htmlFor="member">
										Member - Limited
										access to resources
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="space-y-2">
							<Label>Permissions</Label>
							<p className="text-sm text-muted-foreground">
								Select specific permissions for this
								member
							</p>
							{permissions.map(permission => (
								<div
									key={permission.id}
									className="flex items-start space-x-2">
									<Checkbox
										id={permission.id}
										checked={selectedPermissions.includes(
											permission.id
										)}
										onCheckedChange={checked => {
											setSelectedPermissions(
												checked
													? [
															...selectedPermissions,
															permission.id,
													  ]
													: selectedPermissions.filter(
															id =>
																id !==
																permission.id
													  )
											);
										}}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											htmlFor={
												permission.id
											}>
											{
												permission.label
											}
										</Label>
										<p className="text-sm text-muted-foreground">
											{
												permission.description
											}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button type="submit">
							<Mail className="mr-2 h-4 w-4" />
							Send invitation
						</Button>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	);
}
