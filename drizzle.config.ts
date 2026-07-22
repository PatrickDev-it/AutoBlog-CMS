import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/platform/db/schema.ts',
	out: './drizzle/generated',
	dbCredentials: { url: process.env.DATABASE_URL ?? 'file:./data/autoblog.db' },
	strict: true,
});
