import type { MediaAsset, VerifiedImage } from '@/src/modules/media/domain';

export interface MediaRepository {
	findPostOwner(workspaceId: string, postId: string): Promise<string | null>;
	list(workspaceId: string, postId: string): Promise<MediaAsset[]>;
	find(workspaceId: string, assetId: string): Promise<(MediaAsset & { storageKey: string }) | null>;
	finalize(command: Readonly<{
		workspaceId: string; postId: string; actorId: string; requestId: string; storageKey: string;
		image: VerifiedImage; altText: string; replaceAssetId?: string;
	}>): Promise<MediaAsset>;
	markForDeletion(command: Readonly<{ workspaceId: string; assetId: string; actorId: string; requestId: string }>): Promise<void>;
	enqueueOrphanCleanup(workspaceId: string, storageKey: string, requestId: string): Promise<void>;
}
