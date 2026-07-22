import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { Client } from '@libsql/client';

export async function migrateDatabase(client: Client, directory = join(process.cwd(), 'drizzle')): Promise<string[]> {
	await client.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
		name TEXT PRIMARY KEY,
		checksum TEXT NOT NULL,
		applied_at INTEGER NOT NULL
	)`);

	const names = (await readdir(directory)).filter((name) => /^\d+_[a-z0-9_-]+\.sql$/u.test(name)).sort();
	const applied: string[] = [];

	for (const name of names) {
		const sql = await readFile(join(directory, name), 'utf8');
		const checksum = createHash('sha256').update(sql).digest('hex');
		const existing = await client.execute({ sql: 'SELECT checksum FROM schema_migrations WHERE name = ?', args: [name] });
		if (existing.rows.length > 0) {
			if (existing.rows[0]?.checksum !== checksum) throw new Error(`MIGRATION_CHECKSUM_MISMATCH:${name}`);
			continue;
		}

		const transaction = await client.transaction('write');
		try {
			await transaction.executeMultiple(sql);
			await transaction.execute({
				sql: 'INSERT INTO schema_migrations (name, checksum, applied_at) VALUES (?, ?, ?)',
				args: [name, checksum, Date.now()],
			});
			await transaction.commit();
			applied.push(name);
		} catch (error) {
			await transaction.rollback();
			throw error;
		} finally {
			transaction.close();
		}
	}

	return applied;
}
