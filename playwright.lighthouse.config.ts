import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/lighthouse',
	workers: 1,
	fullyParallel: false,
	retries: 0,
	reporter: 'list',
	timeout: 180_000,
	webServer: {
		command: 'bun run start:performance',
		url: 'http://127.0.0.1:3100',
		reuseExistingServer: false,
		timeout: 120_000,
		env: {
			DATABASE_URL: 'file:./data/lighthouse.db',
			BETTER_AUTH_SECRET: 'lighthouse-only-secret-with-32-characters',
			NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3100',
			DEMO_ENABLED: 'true',
			AI_MODE: 'mock',
			CRON_SECRET: 'lighthouse-only-cron-secret-000000',
			AUTH_SIGN_IN_RATE_LIMIT: '30',
		},
	},
});
