import { and, eq } from 'drizzle-orm';

import { auth } from '@/src/platform/auth/auth';
import { getDatabase } from '@/src/platform/db/client';
import { memberships, workspaces } from '@/src/platform/db/schema';
import { roleSchema, type MembershipContext } from '@/src/modules/identity/domain';
import { AppError } from '@/src/platform/observability/errors';

export async function requireMembership(requestHeaders: Headers, requestedWorkspaceId: string): Promise<MembershipContext> {
	const session = await auth.api.getSession({ headers: requestHeaders });
	if (!session) throw new AppError('UNAUTHENTICATED');

	const [row] = await getDatabase().db
		.select({
			workspaceId: workspaces.id,
			workspaceSlug: workspaces.slug,
			workspaceName: workspaces.name,
			role: memberships.role,
		})
		.from(memberships)
		.innerJoin(workspaces, eq(workspaces.id, memberships.workspaceId))
		.where(and(eq(memberships.userId, session.user.id), eq(memberships.workspaceId, requestedWorkspaceId)))
		.limit(1);

	if (!row) throw new AppError('FORBIDDEN');
	return {
		...row,
		role: roleSchema.parse(row.role),
		userId: session.user.id,
		userName: session.user.name,
		userEmail: session.user.email,
	};
}
