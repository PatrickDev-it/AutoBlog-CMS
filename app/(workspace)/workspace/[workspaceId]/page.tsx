import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getEditorialService } from '@/src/modules/editorial/service';
import { requireMembership } from '@/src/platform/auth/session';
import { AppError } from '@/src/platform/observability/errors';
import { WorkspaceEditor } from '@/src/ui/patterns/workspace-editor';

export const dynamic = 'force-dynamic';

export default async function WorkspacePage({ params }: Readonly<{ params: Promise<{ workspaceId: string }> }>) {
	const { workspaceId } = await params;
	let membership: Awaited<ReturnType<typeof requireMembership>>;
	try {
		membership = await requireMembership(await headers(), workspaceId);
	} catch (error) {
		if (error instanceof AppError && error.code === 'UNAUTHENTICATED') redirect('/sign-in');
		throw error;
	}
	const service = getEditorialService();
	const posts = await service.list(membership);
	const selected = posts[0] ? await service.get(membership, posts[0].id) : null;
	return <WorkspaceEditor context={membership} initialPosts={posts} initialPost={selected} aiMode={process.env.AI_MODE ?? 'mock'} />;
}
