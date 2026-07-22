import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const surface of [
	{ name: 'sign-in', path: '/sign-in' },
	{ name: 'public preview', path: '/preview/demo/immutable-publishing' },
] as const) {
	test(`${surface.name} has no serious or critical axe findings`, async ({ page }) => {
		await page.goto(surface.path);
		const results = await new AxeBuilder({ page }).analyze();
		expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
	});
}

test('authenticated workspace has no serious or critical axe findings', async ({ page }) => {
	await page.goto('/sign-in');
	await page.getByRole('button', { name: /^Author/u }).click();
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('primary author flow is keyboard operable and moves focus into a new draft', async ({ page }) => {
	await page.goto('/sign-in');
	const author = page.getByRole('button', { name: /^Author/u });
	await author.focus(); await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	const create = page.getByRole('button', { name: 'Create draft' });
	await create.focus(); await page.keyboard.press('Enter');
	await expect(page.getByLabel('Title')).toBeFocused();
	await page.keyboard.press('Control+A'); await page.keyboard.type('Keyboard-authored evidence');
	await page.getByLabel('Article body').focus(); await page.keyboard.type('Keyboard input persists.');
	await expect(page.getByText(/Revision \d+ saved\./u)).toBeVisible({ timeout: 12_000 });
	const submit = page.getByRole('button', { name: 'Submit for review' });
	await submit.focus(); await page.keyboard.press('Enter');
	await expect(page.getByText('InReview', { exact: true }).first()).toBeVisible();
});

test('reduced-motion preference disables smooth scrolling and animation duration', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	const styles = await page.locator('html').evaluate((element) => {
		const html = getComputedStyle(element);
		const previewDot = document.querySelector('.preview-dot');
		if (!previewDot) throw new Error('Preview status marker not found.');
		const child = getComputedStyle(previewDot);
		return { scrollBehavior: html.scrollBehavior, animationDuration: child.animationDuration };
	});
	expect(styles.scrollBehavior).toBe('auto');
	expect(Number.parseFloat(styles.animationDuration)).toBeLessThanOrEqual(0.01);
});
