import sharp from 'sharp';
import { z } from 'zod';
import { createHash } from 'node:crypto';

import { AppError } from '@/src/platform/observability/errors';

export const MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MEDIA_MAX_DIMENSION = 4096;
export const MEDIA_MAX_PIXELS = 16_000_000;

export const mediaUploadFieldsSchema = z.object({
	postId: z.string().min(1).max(120),
	replaceAssetId: z.string().min(1).max(120).optional(),
	altText: z.string().trim().max(500).default(''),
});

export type MediaAsset = Readonly<{
	id: string;
	workspaceId: string;
	postId: string | null;
	status: 'pending' | 'active' | 'replaced' | 'deleted' | 'cleanup_pending';
	fileName: string;
	mimeType: string;
	byteSize: number;
	width: number;
	height: number;
	altText: string;
	createdBy: string;
	replacesAssetId: string | null;
	createdAt: Date;
}>;

export type VerifiedImage = Readonly<{
	data: Buffer;
	fileName: string;
	mimeType: (typeof MEDIA_MIME_TYPES)[number];
	byteSize: number;
	width: number;
	height: number;
	checksum: string;
}>;

const FORMAT_MIME: Readonly<Record<string, (typeof MEDIA_MIME_TYPES)[number] | undefined>> = {
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
};

export function safeFileName(name: string): string {
	const leaf = name.replaceAll('\\', '/').split('/').at(-1) ?? 'upload';
	const normalized = leaf.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/gu, '-').replace(/^-+|-+$/gu, '').slice(0, 120);
	return normalized || 'upload';
}

export async function verifyImage(input: Readonly<{ data: Buffer; fileName: string; declaredMimeType: string; maxBytes: number }>): Promise<VerifiedImage> {
	if (input.data.byteLength === 0 || input.data.byteLength > input.maxBytes) throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'size' });
	if (!MEDIA_MIME_TYPES.includes(input.declaredMimeType as (typeof MEDIA_MIME_TYPES)[number])) throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'mime' });
	try {
		const metadata = await sharp(input.data, { failOn: 'warning', limitInputPixels: MEDIA_MAX_PIXELS }).metadata();
		const detectedMime = metadata.format ? FORMAT_MIME[metadata.format] : undefined;
		if (!detectedMime || detectedMime !== input.declaredMimeType) throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'content_type' });
		if (!metadata.width || !metadata.height || metadata.width > MEDIA_MAX_DIMENSION || metadata.height > MEDIA_MAX_DIMENSION || metadata.width * metadata.height > MEDIA_MAX_PIXELS) {
			throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'dimensions' });
		}
		const checksum = createHash('sha256').update(input.data).digest('hex');
		return {
			data: input.data,
			fileName: safeFileName(input.fileName),
			mimeType: detectedMime,
			byteSize: input.data.byteLength,
			width: metadata.width,
			height: metadata.height,
			checksum,
		};
	} catch (error) {
		if (error instanceof AppError) throw error;
		throw new AppError('VALIDATION_FAILED', { field: 'file', reason: 'decode' });
	}
}
