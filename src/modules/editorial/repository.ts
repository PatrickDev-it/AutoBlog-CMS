import type { CreatePostInput, PostDetail, PostSummary, SavePostInput } from '@/src/modules/editorial/domain';

export interface EditorialRepository {
	list(workspaceId: string): Promise<PostSummary[]>;
	find(workspaceId: string, postId: string): Promise<PostDetail | null>;
	create(command: Readonly<{ workspaceId: string; actorId: string; requestId: string; input: CreatePostInput }>): Promise<PostDetail>;
	save(command: Readonly<{ workspaceId: string; postId: string; actorId: string; requestId: string; input: SavePostInput }>): Promise<PostDetail>;
}
