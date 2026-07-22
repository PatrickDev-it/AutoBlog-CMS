import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.spec.ts',
	testIgnore: ['**/visual/**', '**/performance/**'],
	fullyParallel: false,
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
	snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
	use: {
		baseURL: 'http://127.0.0.1:3000',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'bun run dev:e2e',
		url: 'http://127.0.0.1:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
		env: {
			DATABASE_URL: 'file:./data/e2e.db',
			BETTER_AUTH_SECRET: 'e2e-only-secret-with-at-least-32-characters',
			NEXT_PUBLIC_APP_URL: 'http://127.0.0.1:3000',
			DEMO_ENABLED: 'true',
			AI_MODE: 'mock',
			CRON_SECRET: 'e2e-only-distinct-cron-secret-0000000',
			AUTH_SIGN_IN_RATE_LIMIT: '60',
		},
	},
});
