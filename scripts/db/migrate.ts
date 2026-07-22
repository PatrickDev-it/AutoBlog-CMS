import { getEnvironment } from '@/src/platform/config/env';
import { createDatabase } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';

const environment = getEnvironment();
const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_AUTH_TOKEN);

try {
	const applied = await migrateDatabase(database.client);
	console.log(applied.length > 0 ? `Applied migrations: ${applied.join(', ')}` : 'Database schema is current.');
} finally {
	database.client.close();
}
