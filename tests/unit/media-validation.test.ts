import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import { safeFileName, verifyImage } from '@/src/modules/media/domain';

describe('media boundary validation', () => {
	it('decodes allowlisted image content and sanitizes the untrusted name', async () => {
		const data = await sharp({ create: { width: 32, height: 24, channels: 3, background: '#c8ff5a' } }).png().toBuffer();
		const verified = await verifyImage({ data, fileName: '../../ unsafe résumé.png', declaredMimeType: 'image/png', maxBytes: 1_000_000 });
		expect(verified).toMatchObject({ mimeType: 'image/png', width: 32, height: 24 });
		expect(verified.fileName).toBe('unsafe-r-sum-.png');
		expect(verified.checksum).toMatch(/^[a-f0-9]{64}$/u);
	});

	it('rejects forged MIME, non-images, oversize and excessive dimensions', async () => {
		const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#000' } }).png().toBuffer();
		await expect(verifyImage({ data: png, fileName: 'forged.jpg', declaredMimeType: 'image/jpeg', maxBytes: 1_000_000 })).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
		await expect(verifyImage({ data: Buffer.from('not an image'), fileName: 'fake.png', declaredMimeType: 'image/png', maxBytes: 1_000_000 })).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
		await expect(verifyImage({ data: png, fileName: 'large.png', declaredMimeType: 'image/png', maxBytes: png.byteLength - 1 })).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
		const wide = await sharp({ create: { width: 4097, height: 1, channels: 3, background: '#000' } }).png().toBuffer();
		await expect(verifyImage({ data: wide, fileName: 'wide.png', declaredMimeType: 'image/png', maxBytes: 1_000_000 })).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
	});

	it('removes path components and unsafe filename characters', () => {
		expect(safeFileName('C:\\temp\\<script>.webp')).toBe('script-.webp');
	});
});
