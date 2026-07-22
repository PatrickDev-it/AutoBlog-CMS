import type { CreatePostInput, JobRunResult, PostDetail, PostSummary, PublicPost, RestoreRevisionInput, RevisionDetail, SavePostInput, TransitionPostInput } from '@/src/modules/editorial/domain';

export interface EditorialRepository {
	list(workspaceId: string): Promise<PostSummary[]>;
	find(workspaceId: string, postId: string): Promise<PostDetail | null>;
	create(command: Readonly<{ workspaceId: string; actorId: string; requestId: string; input: CreatePostInput }>): Promise<PostDetail>;
	save(command: Readonly<{ workspaceId: string; postId: string; actorId: string; requestId: string; input: SavePostInput }>): Promise<PostDetail>;
	listRevisions(workspaceId: string, postId: string): Promise<RevisionDetail[]>;
	restore(command: Readonly<{ workspaceId: string; postId: string; actorId: string; requestId: string; input: RestoreRevisionInput }>): Promise<PostDetail>;
	transition(command: Readonly<{ workspaceId: string; postId: string; actorId: string; requestId: string; input: TransitionPostInput }>): Promise<PostDetail>;
	findPublic(workspaceSlug: string, postSlug: string): Promise<PublicPost | null>;
	runDuePublicationJobs(now: Date, limit?: number): Promise<JobRunResult>;
}
