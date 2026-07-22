import { DrizzleMediaRepository } from '@/src/modules/media/drizzle-repository';
import { DatabaseMediaProvider } from '@/src/modules/media/database-provider';
import { mediaUploadFieldsSchema, verifyImage, type MediaAsset } from '@/src/modules/media/domain';
import type { MediaProvider } from '@/src/modules/media/provider';
import type { MediaRepository } from '@/src/modules/media/repository';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { authorize } from '@/src/modules/identity/policy';
import { getEnvironment } from '@/src/platform/config/env';
import { getDatabase } from '@/src/platform/db/client';
import { AppError } from '@/src/platform/observability/errors';

const PROVIDER_TIMEOUT_MS = 8_000;

async function providerOperation<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<T> {
	const controller = new AbortController();
	let timeout: ReturnType<typeof setTimeout> | undefined;
	try {
		return await Promise.race([
			operation(controller.signal),
			new Promise<T>((_resolve, reject) => {
				timeout = setTimeout(() => { controller.abort(); reject(new AppError('PROVIDER_UNAVAILABLE')); }, timeoutMs);
			}),
		]);
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError('PROVIDER_UNAVAILABLE', undefined, error);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}

export class MediaService {
	constructor(
		private readonly repository: MediaRepository,
		private readonly provider: MediaProvider,
		private readonly maxBytes: number,
	) {}

	async list(context: MembershipContext, postId: string): Promise<MediaAsset[]> {
		authorize(context.role, 'workspace.read');
		if (!await this.repository.findPostOwner(context.workspaceId, postId)) throw new AppError('NOT_FOUND');
		return this.repository.list(context.workspaceId, postId);
	}

	async upload(context: MembershipContext, raw: Readonly<{
		postId: unknown; replaceAssetId?: unknown; altText?: unknown; fileName: string;
		declaredMimeType: string; data: Buffer;
	}>, requestId: string): Promise<MediaAsset> {
		const fields = mediaUploadFieldsSchema.parse({ postId: raw.postId, replaceAssetId: raw.replaceAssetId || undefined, altText: raw.altText });
		const ownerId = await this.repository.findPostOwner(context.workspaceId, fields.postId);
		if (!ownerId) throw new AppError('NOT_FOUND');
		authorize(context.role, 'media.upload', { actorId: context.userId, ownerId });
		const image = await verifyImage({ data: raw.data, fileName: raw.fileName, declaredMimeType: raw.declaredMimeType, maxBytes: this.maxBytes });
		const storageKey = `${context.workspaceId}/${crypto.randomUUID()}`;
		try {
			await providerOperation((signal) => this.provider.put(storageKey, image.data, signal));
		} catch (error) {
			await this.repository.enqueueOrphanCleanup(context.workspaceId, storageKey, requestId);
			throw error;
		}
		try {
			return await this.repository.finalize({
				workspaceId: context.workspaceId, postId: fields.postId, actorId: context.userId,
				requestId, storageKey, image, altText: fields.altText,
				...(fields.replaceAssetId ? { replaceAssetId: fields.replaceAssetId } : {}),
			});
		} catch (error) {
			try {
				await providerOperation((signal) => this.provider.delete(storageKey, signal));
			} catch {
				await this.repository.enqueueOrphanCleanup(context.workspaceId, storageKey, requestId);
			}
			throw error;
		}
	}

	async read(context: MembershipContext, assetId: string): Promise<Readonly<{ asset: MediaAsset; data: Buffer }>> {
		authorize(context.role, 'workspace.read');
		const asset = await this.repository.find(context.workspaceId, assetId);
		if (!asset || asset.status !== 'active') throw new AppError('NOT_FOUND');
		const data = await providerOperation((signal) => this.provider.get(asset.storageKey, signal));
		if (!data) throw new AppError('NOT_FOUND');
		return { asset, data };
	}

	async delete(context: MembershipContext, assetId: string, requestId: string): Promise<void> {
		authorize(context.role, 'media.delete');
		await this.repository.markForDeletion({ workspaceId: context.workspaceId, assetId, actorId: context.userId, requestId });
	}
}

let mediaService: MediaService | undefined;

export function getMediaService(): MediaService {
	if (!mediaService) {
		const database = getDatabase();
		mediaService = new MediaService(new DrizzleMediaRepository(database), new DatabaseMediaProvider(database), getEnvironment().MEDIA_MAX_BYTES);
	}
	return mediaService;
}
