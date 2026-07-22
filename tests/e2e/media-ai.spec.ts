import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, role: 'Author' | 'Editor') {
	await page.goto('/sign-in');
	await page.getByRole('button', { name: new RegExp(`^${role}`) }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/, { timeout: 20_000 });
}

test('AI suggestion remains a preview until the author explicitly applies it', async ({ page }) => {
	await signInAs(page, 'Author');
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toHaveValue('Untitled editorial brief');
	const title = `Explicit AI application ${Date.now()}`;
	await page.getByLabel('Title').fill(title);
	await page.getByLabel('Article body').fill('Human-authored baseline.');
	await expect(page.getByText(/Revision \d+ saved\./)).toBeVisible({ timeout: 12_000 });
	await page.getByRole('button', { name: 'Generate suggestion' }).click();
	await expect(page.getByText(/Mock demo suggestion ready/)).toBeVisible({ timeout: 20_000 });
	await expect(page.getByRole('article', { name: 'AI suggestion preview' })).toBeVisible();
	await expect(page.getByLabel('Article body')).toHaveValue('Human-authored baseline.');
	await page.getByRole('button', { name: 'Apply suggestion' }).click();
	await expect(page.getByLabel('Article body')).toHaveValue(/Editorial next step/u);
	await expect(page.getByText(/Revision \d+ saved\./)).toBeVisible({ timeout: 12_000 });
});

test('verified media can be safely replaced and deleted through authorized roles', async ({ page }) => {
	test.setTimeout(60_000);
	await signInAs(page, 'Author');
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toHaveValue('Untitled editorial brief');
	const title = `Media lifecycle ${Date.now()}`;
	await page.getByLabel('Title').fill(title);
	await page.getByLabel('Article body').fill('Media lifecycle fixture.');
	await expect(page.getByText(/Revision \d+ saved\./)).toBeVisible({ timeout: 12_000 });
	const file = page.getByLabel(/PNG, JPEG or WebP/);
	await file.setInputFiles('app/icon.png');
	await page.getByLabel('Alternative text').fill('AutoBlog brand mark');
	await page.getByRole('button', { name: 'Upload verified image' }).click();
	await expect(page.getByText('Verified image activated.')).toBeVisible({ timeout: 12_000 });
	await expect(page.getByText(/image\/png/)).toBeVisible();
	await file.setInputFiles('app/icon.png');
	await page.getByRole('button', { name: 'Replace safely' }).click();
	await expect(page.getByText(/Replacement activated/)).toBeVisible({ timeout: 12_000 });
	await expect(page.getByRole('button', { name: 'Delete asset' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Sign out' }).click();
	await signInAs(page, 'Editor');
	await page.getByRole('button', { name: new RegExp(title) }).click();
	await expect(page.getByRole('button', { name: 'Delete asset' })).toBeVisible({ timeout: 12_000 });
	await page.getByRole('button', { name: 'Delete asset' }).click();
	await expect(page.getByText(/cleanup queued/)).toBeVisible();
});

test('anonymous AI and media mutations are rejected before provider access', async ({ playwright }) => {
	const anonymous = await playwright.request.newContext({ baseURL: 'http://127.0.0.1:3000' });
	const ai = await anonymous.post('/api/workspaces/ws-demo/ai/suggest', { data: { postId: 'post-editorial-systems', title: 'Anonymous attempt', excerpt: '', content: '', instruction: 'Generate content.' } });
	expect(ai.status()).toBe(401);
	expect((await ai.json() as { error: { code: string } }).error.code).toBe('UNAUTHENTICATED');
	const media = await anonymous.post('/api/workspaces/ws-demo/media', { multipart: { postId: 'post-editorial-systems', file: { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not-an-image') } } });
	expect(media.status()).toBe(401);
	expect((await media.json() as { error: { code: string } }).error.code).toBe('UNAUTHENTICATED');
	const jobs = await anonymous.post('/api/jobs/run');
	expect(jobs.status()).toBe(401);
	const scheduler = await anonymous.post('/api/jobs/run', { headers: { 'x-autoblog-cron-secret': 'e2e-only-distinct-cron-secret-0000000' } });
	expect(scheduler.status()).toBe(200);
	await anonymous.dispose();
});
