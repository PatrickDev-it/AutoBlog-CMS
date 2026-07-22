import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, role: 'Author' | 'Reviewer') {
	await page.goto('/sign-in');
	await page.getByRole('button', { name: new RegExp(`^${role}`) }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/, { timeout: 20_000 });
	await expect(page.getByText(role, { exact: true }).first()).toBeVisible();
}

test('author autosave survives reload through a real session and durable repository', async ({ page }) => {
	await signInAs(page, 'Author');
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toHaveValue('Untitled editorial brief');
	const content = page.getByLabel('Article body');
	const marker = `Durable E2E marker ${Date.now()}`;
	const title = `Durable editorial proof ${Date.now()}`;
	await page.getByLabel('Title').fill(title);
	await content.fill(marker);
	await expect(page.getByText(/Revision \d+ saved\./)).toBeVisible({ timeout: 12_000 });
	await page.reload();
	await page.getByRole('button', { name: new RegExp(title) }).click();
	await expect(page.getByLabel('Article body')).toHaveValue(marker);
});

test('reviewer is denied a create command by the server policy', async ({ page }) => {
	await signInAs(page, 'Reviewer');
	await expect(page.getByRole('button', { name: 'Create draft' })).toHaveCount(0);
	const response = await page.context().request.post('/api/workspaces/ws-demo/posts', {
		headers: { origin: 'http://127.0.0.1:3000' },
		data: { title: 'Forbidden reviewer draft', excerpt: '', content: '' },
	});
	expect(response.status()).toBe(403);
	const payload = await response.json() as { error: { code: string; requestId: string } };
	expect(payload.error.code).toBe('FORBIDDEN');
	expect(payload.error.requestId).toBeTruthy();
});

test('anonymous mutation receives a stable unauthenticated error', async ({ playwright }) => {
	const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3000' });
	const response = await anonymous.post('/api/workspaces/ws-demo/posts', {
		data: { title: 'Anonymous draft', excerpt: '', content: '' },
	});
	expect(response.status()).toBe(401);
	const payload = await response.json() as { error: { code: string; message: string; requestId: string } };
	expect(payload.error.code).toBe('UNAUTHENTICATED');
	expect(payload.error.message).not.toContain('database');
	expect(payload.error.requestId).toBeTruthy();
	await anonymous.dispose();
});
