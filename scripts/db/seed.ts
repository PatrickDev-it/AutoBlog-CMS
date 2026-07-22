import { getEnvironment } from '@/src/platform/config/env';
import { createDatabase } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

const environment = getEnvironment();
const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_AUTH_TOKEN);

try {
	await migrateDatabase(database.client);
	await seedDemo(database);
	console.log('Validated demo fixture is ready.');
} finally {
	database.client.close();
}
