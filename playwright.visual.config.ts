import base from './playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
	...base,
	testDir: './tests/visual',
	testIgnore: [],
	retries: 0,
	workers: 1,
});
