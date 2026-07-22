import { expect, test } from '@playwright/test';

test('recruiter can reach the bounded demo entry', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Publish with evidence.' })).toBeVisible();
	await page.getByRole('link', { name: 'Enter guided demo' }).click();
	await expect(page).toHaveURL(/\/sign-in$/);
});
