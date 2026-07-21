import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('marketing entry has no detectable critical accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([]);
});
