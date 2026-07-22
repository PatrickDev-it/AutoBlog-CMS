import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/performance',
	workers: 1,
	fullyParallel: false,
	retries: 0,
	reporter: 'list',
	use: { baseURL: 'http://127.0.0.1:3100', ...devices['Desktop Chrome'] },
	webServer: {
		command: 'bun run start:performance',
		url: 'http://127.0.0.1:3100',
		reuseExistingServer: false,
		timeout: 120_000,
		env: {
			DATABASE_URL: 'file:./data/performance.db',
			BETTER_AUTH_SECRET: 'performance-only-secret-with-32-characters',
			NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3100',
			DEMO_ENABLED: 'true', AI_MODE: 'mock',
			CRON_SECRET: 'performance-only-cron-secret-000000',
			AUTH_SIGN_IN_RATE_LIMIT: '30',
		},
	},
});
