import { expect, test } from '@playwright/test';

test('Owner resets only the bounded demo and keeps an authenticated session', async ({ page }) => {
	test.setTimeout(60_000);
	await page.goto('/sign-in');
	await page.getByRole('button', { name: /^Owner/u }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toBeFocused();
	const marker = `Reset removes only demo mutation ${Date.now()}`;
	await page.getByLabel('Title').fill(marker);
	await page.getByLabel('Article body').fill('Temporary bounded demo content.');
	await expect(page.getByText(/Revision \d+ saved\./u)).toBeVisible({ timeout: 12_000 });
	await page.getByRole('button', { name: 'Reset demo data' }).click();
	await expect(page.getByText(/affects only the bounded demo workspace/u)).toBeVisible();
	await page.getByRole('button', { name: 'Confirm reset' }).click();
	await expect(page.getByText('Owner', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
	await expect(page.getByRole('button', { name: new RegExp(marker) })).toHaveCount(0);
	await expect(page.getByLabel('Title')).toHaveValue('Designing the next editorial operating system');

	const key = `e2e-idempotency-${Date.now()}`;
	const first = await page.context().request.post('/api/workspaces/ws-demo/demo/reset', {
		headers: { origin: 'http://127.0.0.1:3000' }, data: { idempotencyKey: key },
	});
	const second = await page.context().request.post('/api/workspaces/ws-demo/demo/reset', {
		headers: { origin: 'http://127.0.0.1:3000' }, data: { idempotencyKey: key },
	});
	expect(first.status()).toBe(200); expect(second.status()).toBe(200);
	expect((await second.json() as { data: { alreadyApplied: boolean } }).data.alreadyApplied).toBe(true);
});
