import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { getEnvironment } from '@/src/platform/config/env';
import * as schema from '@/src/platform/db/schema';

export type Database = LibSQLDatabase<typeof schema>;
export type DatabaseContext = Readonly<{ client: Client; db: Database; url: string }>;

export function createDatabase(url: string, authToken?: string): DatabaseContext {
	if (url.startsWith('file:')) {
		mkdirSync(dirname(resolve(url.slice('file:'.length))), { recursive: true });
	}
	const client = createClient(authToken ? { url, authToken } : { url });
	return { client, db: drizzle(client, { schema }), url };
}

let applicationDatabase: DatabaseContext | undefined;

export function getDatabase(): DatabaseContext {
	if (!applicationDatabase) {
		const environment = getEnvironment();
		applicationDatabase = createDatabase(environment.DATABASE_URL, environment.DATABASE_AUTH_TOKEN);
	}
	return applicationDatabase;
}

export function resetDatabaseSingleton(): void {
	applicationDatabase?.client.close();
	applicationDatabase = undefined;
}
