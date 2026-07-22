import { eq } from 'drizzle-orm';

import type { MediaProvider } from '@/src/modules/media/provider';
import type { DatabaseContext } from '@/src/platform/db/client';
import { mediaObjects } from '@/src/platform/db/schema';

export class DatabaseMediaProvider implements MediaProvider {
	constructor(private readonly database: DatabaseContext) {}

	async put(storageKey: string, data: Buffer, signal: AbortSignal): Promise<void> {
		signal.throwIfAborted();
		await this.database.db.insert(mediaObjects).values({ storageKey, data, createdAt: new Date() });
		signal.throwIfAborted();
	}

	async get(storageKey: string, signal: AbortSignal): Promise<Buffer | null> {
		signal.throwIfAborted();
		const [object] = await this.database.db.select({ data: mediaObjects.data }).from(mediaObjects).where(eq(mediaObjects.storageKey, storageKey)).limit(1);
		signal.throwIfAborted();
		return object?.data ?? null;
	}

	async delete(storageKey: string, signal: AbortSignal): Promise<void> {
		signal.throwIfAborted();
		await this.database.db.delete(mediaObjects).where(eq(mediaObjects.storageKey, storageKey));
	}
}
