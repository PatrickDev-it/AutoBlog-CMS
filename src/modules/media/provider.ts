export interface MediaProvider {
	put(storageKey: string, data: Buffer, signal: AbortSignal): Promise<void>;
	get(storageKey: string, signal: AbortSignal): Promise<Buffer | null>;
	delete(storageKey: string, signal: AbortSignal): Promise<void>;
}
