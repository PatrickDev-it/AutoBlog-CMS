import { createPostSchema, restoreRevisionSchema, savePostSchema, transitionPostSchema, type JobRunResult, type PostDetail, type PostSummary, type PublicPost, type RevisionDetail } from '@/src/modules/editorial/domain';
import { TRANSITION_RULES } from '@/src/modules/editorial/workflow';
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
		if (!['Draft', 'ChangesRequested', 'Published'].includes(existing.state)) throw new AppError('ILLEGAL_TRANSITION', { state: existing.state, operation: 'save' });
		return this.repository.save({ workspaceId: context.workspaceId, postId, actorId: context.userId, requestId, input: savePostSchema.parse(input) });
	}

	async revisions(context: MembershipContext, postId: string): Promise<RevisionDetail[]> {
		authorize(context.role, 'workspace.read');
		if (!await this.repository.find(context.workspaceId, postId)) throw new AppError('NOT_FOUND');
		return this.repository.listRevisions(context.workspaceId, postId);
	}

	async restore(context: MembershipContext, postId: string, input: unknown, requestId: string): Promise<PostDetail> {
		const existing = await this.repository.find(context.workspaceId, postId);
		if (!existing) throw new AppError('NOT_FOUND');
		authorize(context.role, 'revision.restore', { actorId: context.userId, ownerId: existing.authorId });
		if (!['Draft', 'ChangesRequested', 'Published'].includes(existing.state)) throw new AppError('ILLEGAL_TRANSITION', { state: existing.state, operation: 'restore' });
		return this.repository.restore({ workspaceId: context.workspaceId, postId, actorId: context.userId, requestId, input: restoreRevisionSchema.parse(input) });
	}

	async transition(context: MembershipContext, postId: string, input: unknown, requestId: string): Promise<PostDetail> {
		const parsed = transitionPostSchema.parse(input);
		const existing = await this.repository.find(context.workspaceId, postId);
		if (!existing) throw new AppError('NOT_FOUND');
		const rule = TRANSITION_RULES[parsed.action];
		authorize(context.role, rule.permission, { actorId: context.userId, ownerId: existing.authorId });
		if (parsed.action === 'submit' && existing.content.trim().length === 0) throw new AppError('VALIDATION_FAILED', { field: 'content' });
		if (parsed.action === 'schedule') {
			if (!parsed.scheduledFor || new Date(parsed.scheduledFor).getTime() <= Date.now()) throw new AppError('VALIDATION_FAILED', { field: 'scheduledFor' });
		}
		return this.repository.transition({ workspaceId: context.workspaceId, postId, actorId: context.userId, requestId, input: parsed });
	}

	async publicPost(workspaceSlug: string, postSlug: string): Promise<PublicPost> {
		const post = await this.repository.findPublic(workspaceSlug, postSlug);
		if (!post) throw new AppError('NOT_FOUND');
		return post;
	}

	async runDueJobs(now = new Date(), limit = 10): Promise<JobRunResult> {
		return this.repository.runDuePublicationJobs(now, limit);
	}
}

let editorialService: EditorialService | undefined;

export function getEditorialService(): EditorialService {
	if (!editorialService) editorialService = new EditorialService(new DrizzleEditorialRepository(getDatabase()));
	return editorialService;
}
