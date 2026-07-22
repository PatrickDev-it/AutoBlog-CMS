import { expect, test } from '@playwright/test';

test('marketing desktop visual', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveScreenshot('marketing-desktop.png', { fullPage: true, animations: 'disabled' });
});

test('sign-in desktop visual', async ({ page }) => {
	await page.goto('/sign-in');
	await expect(page).toHaveScreenshot('sign-in-desktop.png', { fullPage: true, animations: 'disabled' });
});

test('workspace desktop visual', async ({ page }) => {
	await page.goto('/sign-in');
	await page.getByRole('button', { name: /^Author/u }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	await expect(page).toHaveScreenshot('workspace-desktop.png', { fullPage: true, animations: 'disabled' });
});

test('public preview desktop visual', async ({ page }) => {
	await page.goto('/preview/demo/immutable-publishing');
	await expect(page).toHaveScreenshot('public-preview-desktop.png', { fullPage: true, animations: 'disabled' });
});

test('marketing and workspace mobile visuals', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await expect(page).toHaveScreenshot('marketing-mobile.png', { fullPage: true, animations: 'disabled' });
	await page.goto('/sign-in');
	await page.getByRole('button', { name: /^Author/u }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	await expect(page).toHaveScreenshot('workspace-mobile.png', { fullPage: true, animations: 'disabled' });
});
