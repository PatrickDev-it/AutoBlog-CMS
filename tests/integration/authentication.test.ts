import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '@/src/modules/identity/demo';
import { createAuthentication } from '@/src/platform/auth/auth';
import { createDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

let database: DatabaseContext;
let databasePath: string;

beforeEach(async () => {
	await mkdir('data/tests', { recursive: true });
	databasePath = join('data', 'tests', `${crypto.randomUUID()}.db`).replaceAll('\\', '/');
	database = createDatabase(`file:${databasePath}`);
	await migrateDatabase(database.client);
	await seedDemo(database);
});

afterEach(async () => {
	database.client.close();
});

describe('database-backed authentication', () => {
	it('rejects arbitrary credentials and issues a revocable secure session for a seeded identity', async () => {
		const testAuth = createAuthentication(database, { baseURL: 'http://localhost:3000', secret: 'integration-secret-at-least-32-characters' });
		await expect(testAuth.api.signInEmail({ body: { email: 'author@demo.autoblog.local', password: 'arbitrary-non-empty' } })).rejects.toBeDefined();

		const response = await testAuth.api.signInEmail({
			body: { email: 'author@demo.autoblog.local', password: DEMO_PASSWORD },
			asResponse: true,
		});
		expect(response.status).toBe(200);
		const cookie = response.headers.get('set-cookie');
		expect(cookie).toContain('HttpOnly');
		expect(cookie).toContain('SameSite=Lax');

		const session = await testAuth.api.getSession({ headers: new Headers({ cookie: cookie ?? '' }) });
		expect(session?.user.email).toBe('author@demo.autoblog.local');
		await testAuth.api.signOut({ headers: new Headers({ cookie: cookie ?? '' }) });
		const revoked = await testAuth.api.getSession({ headers: new Headers({ cookie: cookie ?? '' }) });
		expect(revoked).toBeNull();
	});
});
