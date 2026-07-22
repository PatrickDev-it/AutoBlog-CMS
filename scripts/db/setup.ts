import { getEnvironment } from '@/src/platform/config/env';
import { createDatabase } from '@/src/platform/db/client';
import { migrateDatabase } from '@/src/platform/db/migrate';
import { seedDemo } from '@/src/platform/db/seed';

const environment = getEnvironment();
const database = createDatabase(environment.DATABASE_URL, environment.DATABASE_AUTH_TOKEN);

try {
	const applied = await migrateDatabase(database.client);
	if (environment.DEMO_ENABLED) await seedDemo(database);
	console.log(`Database ready (${applied.length} migration${applied.length === 1 ? '' : 's'} applied).`);
} finally {
	database.client.close();
}
