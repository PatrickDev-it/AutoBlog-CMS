import { describe, expect, it } from 'vitest';

import { permissionSchema, roleSchema, type Permission, type Role } from '@/src/modules/identity/domain';
import { can, PERMISSION_MATRIX } from '@/src/modules/identity/policy';

const expected: Readonly<Record<Role, readonly Permission[]>> = {
	Owner: permissionSchema.options,
	Admin: permissionSchema.options.filter((permission) => permission !== 'demo.reset'),
	Editor: ['workspace.read', 'post.create', 'post.update', 'post.delete', 'post.submit', 'review.request_changes', 'review.approve', 'post.schedule', 'post.publish', 'post.archive', 'revision.restore', 'media.upload', 'media.delete', 'ai.suggest'],
	Author: ['workspace.read', 'post.create', 'post.update', 'post.submit', 'revision.restore', 'media.upload', 'ai.suggest'],
	Reviewer: ['workspace.read', 'review.request_changes', 'review.approve', 'ai.suggest'],
};

describe('RBAC permission matrix', () => {
	it.each(roleSchema.options)('evaluates every command for %s', (role) => {
		for (const permission of permissionSchema.options) {
			expect(can(role, permission, { actorId: 'actor', ownerId: 'actor' }), `${role}:${permission}`).toBe(expected[role].includes(permission));
			expect(PERMISSION_MATRIX[permission].roles.includes(role), `declared:${role}:${permission}`).toBe(expected[role].includes(permission));
		}
	});

	it('denies author ownership-scoped commands against another author', () => {
		for (const permission of ['post.update', 'post.submit', 'revision.restore', 'media.upload'] as const) {
			expect(can('Author', permission, { actorId: 'author-a', ownerId: 'author-b' })).toBe(false);
		}
	});
});
