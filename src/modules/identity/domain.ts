import { z } from 'zod';

export const roleSchema = z.enum(['Owner', 'Admin', 'Editor', 'Author', 'Reviewer']);
export type Role = z.infer<typeof roleSchema>;

export const permissionSchema = z.enum([
	'workspace.read',
	'post.create',
	'post.update',
	'post.delete',
	'post.submit',
	'review.request_changes',
	'review.approve',
	'post.schedule',
	'post.publish',
	'post.archive',
	'revision.restore',
	'media.upload',
	'media.delete',
	'ai.suggest',
	'membership.manage',
	'demo.reset',
	'jobs.run',
]);
export type Permission = z.infer<typeof permissionSchema>;

export type MembershipContext = Readonly<{
	workspaceId: string;
	workspaceSlug: string;
	workspaceName: string;
	userId: string;
	userName: string;
	userEmail: string;
	role: Role;
}>;
