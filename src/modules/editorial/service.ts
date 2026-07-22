import { createPostSchema, savePostSchema, type PostDetail, type PostSummary } from '@/src/modules/editorial/domain';
import type { EditorialRepository } from '@/src/modules/editorial/repository';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { authorize } from '@/src/modules/identity/policy';
import { getDatabase } from '@/src/platform/db/client';
import { DrizzleEditorialRepository } from '@/src/modules/editorial/drizzle-repository';
import { AppError } from '@/src/platform/observability/errors';

export class EditorialService {
	constructor(private readonly repository: EditorialRepository) {}

	async list(context: MembershipContext): Promise<PostSummary[]> {
		authorize(context.role, 'workspace.read');
		return this.repository.list(context.workspaceId);
	}

	async get(context: MembershipContext, postId: string): Promise<PostDetail> {
		authorize(context.role, 'workspace.read');
		const post = await this.repository.find(context.workspaceId, postId);
		if (!post) throw new AppError('NOT_FOUND');
		return post;
	}

	async create(context: MembershipContext, input: unknown, requestId: string): Promise<PostDetail> {
		authorize(context.role, 'post.create', { actorId: context.userId, ownerId: context.userId });
		return this.repository.create({ workspaceId: context.workspaceId, actorId: context.userId, requestId, input: createPostSchema.parse(input) });
	}

	async save(context: MembershipContext, postId: string, input: unknown, requestId: string): Promise<PostDetail> {
		const existing = await this.repository.find(context.workspaceId, postId);
		if (!existing) throw new AppError('NOT_FOUND');
		authorize(context.role, 'post.update', { actorId: context.userId, ownerId: existing.authorId });
		return this.repository.save({ workspaceId: context.workspaceId, postId, actorId: context.userId, requestId, input: savePostSchema.parse(input) });
	}
}

let editorialService: EditorialService | undefined;

export function getEditorialService(): EditorialService {
	if (!editorialService) editorialService = new EditorialService(new DrizzleEditorialRepository(getDatabase()));
	return editorialService;
}
