import { expect, test, type Page } from '@playwright/test';

async function signInAs(page: Page, role: 'Author' | 'Reviewer' | 'Editor') {
	await page.goto('/sign-in');
	await page.getByRole('button', { name: new RegExp(`^${role}`) }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/, { timeout: 20_000 });
}

async function changeRole(page: Page, role: 'Author' | 'Reviewer' | 'Editor') {
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/sign-in$/);
	await signInAs(page, role);
}

test('author, reviewer and editor complete an immutable publication', async ({ page }) => {
	test.setTimeout(60_000);
	await signInAs(page, 'Author');
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toHaveValue('Untitled editorial brief');
	const marker = `Flagship publication ${Date.now()}`;
	await page.getByLabel('Title').fill(marker);
	await page.getByLabel('Standfirst').fill('A browser-tested editorial workflow.');
	await page.getByLabel('Article body').fill('First accepted version.');
	const savedMessage = page.getByText(/Revision \d+ saved\./);
	await expect(savedMessage).toBeVisible({ timeout: 12_000 });
	const firstSavedText = await savedMessage.textContent();
	const firstVersion = Number(firstSavedText?.match(/\d+/u)?.[0]);
	expect(firstVersion).toBeGreaterThan(1);
	await page.getByLabel('Article body').fill('Second version restored through immutable history.');
	await expect.poll(async () => Number((await savedMessage.textContent())?.match(/\d+/u)?.[0])).toBeGreaterThan(firstVersion);
	const secondVersion = Number((await savedMessage.textContent())?.match(/\d+/u)?.[0]);

	await page.getByRole('button', { name: 'Open revision history' }).click();
	await expect(page.getByRole('region', { name: 'Revision history' })).toBeVisible();
	await page.getByRole('button', { name: 'Compare' }).nth(1).click();
	await expect(page.getByText(`Current v${secondVersion} vs v${firstVersion}`)).toBeVisible();
	await page.getByRole('button', { name: 'Restore as new' }).nth(1).click();
	await expect(page.getByText(`Revision ${secondVersion + 1} created from history.`)).toBeVisible();
	await expect(page.getByLabel('Article body')).toHaveValue('First accepted version.');

	await page.getByRole('button', { name: 'Submit for review' }).click();
	await expect(page.getByText('InReview', { exact: true }).first()).toBeVisible();
	await changeRole(page, 'Reviewer');
	await page.getByRole('button', { name: new RegExp(marker) }).click();
	await page.getByRole('button', { name: 'Approve' }).click();
	await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible();

	await changeRole(page, 'Editor');
	await page.getByRole('button', { name: new RegExp(marker) }).click();
	await page.getByRole('button', { name: 'Publish now' }).click();
	await expect(page.getByText('Published', { exact: true }).first()).toBeVisible();
	const preview = page.getByRole('link', { name: 'Open public preview' });
	const path = await preview.getAttribute('href');
	expect(path).toMatch(/^\/preview\/demo\//u);
	if (!path) throw new Error('Preview path was not rendered.');
	await page.goto(path);
	await expect(page.getByRole('heading', { level: 1, name: marker })).toBeVisible();
	await expect(page.getByText('First accepted version.')).toBeVisible();
});

test('autosave surfaces a stale writer conflict without overwriting server content', async ({ page }) => {
	await signInAs(page, 'Author');
	await page.getByRole('button', { name: 'Create draft' }).click();
	await expect(page.getByLabel('Title')).toHaveValue('Untitled editorial brief');
	const title = `Conflict evidence ${Date.now()}`;
	await page.getByLabel('Title').fill(title);
	await page.getByLabel('Article body').fill('Local baseline.');
	await expect(page.getByText(/Revision \d+ saved\./)).toBeVisible({ timeout: 12_000 });
	await expect(page.getByRole('button', { name: new RegExp(title) })).toBeVisible({ timeout: 12_000 });
	const listResponse = await page.context().request.get('/api/workspaces/ws-demo/posts');
	const list = await listResponse.json() as { data: { id: string; title: string; version: number; excerpt: string }[] };
	const selected = list.data.find((post) => post.title === title);
	if (!selected) throw new Error('Created conflict fixture was not listed.');
	const serverResponse = await page.context().request.patch(`/api/workspaces/ws-demo/posts/${selected.id}`, {
		headers: { origin: 'http://127.0.0.1:3000' },
		data: { expectedVersion: selected.version, title, excerpt: selected.excerpt, content: 'Newer server content.' },
	});
	expect(serverResponse.status()).toBe(200);
	await page.getByLabel('Article body').fill('Stale browser content.');
	await expect(page.getByText('Conflict', { exact: true })).toBeVisible({ timeout: 12_000 });
	await expect(page.getByText(/has not overwritten/)).toBeVisible();
	await page.getByRole('button', { name: 'Compare versions' }).click();
	await expect(page.getByText('Newer server content.')).toBeVisible();
});
