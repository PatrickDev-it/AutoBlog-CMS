import type { Permission, Role } from '@/src/modules/identity/domain';
import { AppError } from '@/src/platform/observability/errors';

type PermissionRule = Readonly<{ roles: readonly Role[]; ownOnlyFor?: readonly Role[] }>;

export const PERMISSION_MATRIX: Readonly<Record<Permission, PermissionRule>> = {
	'workspace.read': { roles: ['Owner', 'Admin', 'Editor', 'Author', 'Reviewer'] },
	'post.create': { roles: ['Owner', 'Admin', 'Editor', 'Author'] },
	'post.update': { roles: ['Owner', 'Admin', 'Editor', 'Author'], ownOnlyFor: ['Author'] },
	'post.delete': { roles: ['Owner', 'Admin', 'Editor'] },
	'post.submit': { roles: ['Owner', 'Admin', 'Editor', 'Author'], ownOnlyFor: ['Author'] },
	'review.request_changes': { roles: ['Owner', 'Admin', 'Editor', 'Reviewer'] },
	'review.approve': { roles: ['Owner', 'Admin', 'Editor', 'Reviewer'] },
	'post.schedule': { roles: ['Owner', 'Admin', 'Editor'] },
	'post.publish': { roles: ['Owner', 'Admin', 'Editor'] },
	'post.archive': { roles: ['Owner', 'Admin', 'Editor'] },
	'revision.restore': { roles: ['Owner', 'Admin', 'Editor', 'Author'], ownOnlyFor: ['Author'] },
	'media.upload': { roles: ['Owner', 'Admin', 'Editor', 'Author'], ownOnlyFor: ['Author'] },
	'media.delete': { roles: ['Owner', 'Admin', 'Editor'] },
	'ai.suggest': { roles: ['Owner', 'Admin', 'Editor', 'Author', 'Reviewer'] },
	'membership.manage': { roles: ['Owner', 'Admin'] },
	'demo.reset': { roles: ['Owner'] },
	'jobs.run': { roles: ['Owner', 'Admin'] },
};

export function can(role: Role, permission: Permission, context?: Readonly<{ actorId: string; ownerId?: string }>): boolean {
	const rule = PERMISSION_MATRIX[permission];
	if (!rule.roles.includes(role)) return false;
	if (rule.ownOnlyFor?.includes(role)) return Boolean(context?.ownerId && context.ownerId === context.actorId);
	return true;
}

export function authorize(role: Role, permission: Permission, context?: Readonly<{ actorId: string; ownerId?: string }>): void {
	if (!can(role, permission, context)) throw new AppError('FORBIDDEN');
}
