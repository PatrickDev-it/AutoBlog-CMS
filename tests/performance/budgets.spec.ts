import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const BUDGETS = {
	lcpMs: 2_500,
	inpProxyMs: 200,
	workflowResponseMs: 500,
	cls: 0.1,
	landingJavaScriptBytes: 180 * 1024,
	workspaceJavaScriptBytes: 320 * 1024,
} as const;

type Metrics = Readonly<{ lcp: number; cls: number; eventDuration: number; javaScriptBytes: number }>;

async function installObservers(context: BrowserContext) {
	await context.addInitScript(() => {
		const metrics = { lcp: 0, cls: 0, eventDuration: 0 };
		Object.defineProperty(window, '__autoblogMetrics', { value: metrics, configurable: true });
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) metrics.lcp = Math.max(metrics.lcp, entry.startTime);
		}).observe({ type: 'largest-contentful-paint', buffered: true });
		new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
				if (!shift.hadRecentInput) metrics.cls += shift.value ?? 0;
			}
		}).observe({ type: 'layout-shift', buffered: true });
		try {
			new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) metrics.eventDuration = Math.max(metrics.eventDuration, entry.duration);
			}).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit & { durationThreshold: number });
		} catch { /* Event Timing is optional in older Chromium builds. */ }
	});
}

async function readMetrics(page: Page): Promise<Metrics> {
	await page.waitForTimeout(800);
	return page.evaluate(() => {
		const metrics = (window as unknown as { __autoblogMetrics: { lcp: number; cls: number; eventDuration: number } }).__autoblogMetrics;
		const javaScriptBytes = performance.getEntriesByType('resource')
			.map((entry) => entry as PerformanceResourceTiming)
			.filter((entry) => entry.initiatorType === 'script')
			.reduce((total, entry) => total + (entry.transferSize || entry.encodedBodySize), 0);
		return { ...metrics, javaScriptBytes };
	});
}

test('marketing route stays inside production Web Vital and JavaScript budgets', async ({ browser }) => {
	const context = await browser.newContext(); await installObservers(context);
	const page = await context.newPage(); await page.goto('/');
	const metrics = await readMetrics(page);
	process.stdout.write(`[performance] landing ${JSON.stringify(metrics)}\n`);
	expect(metrics.lcp).toBeGreaterThan(0);
	expect(metrics.lcp).toBeLessThanOrEqual(BUDGETS.lcpMs);
	expect(metrics.cls).toBeLessThanOrEqual(BUDGETS.cls);
	expect(metrics.javaScriptBytes).toBeLessThanOrEqual(BUDGETS.landingJavaScriptBytes);
	await context.close();
});

test('cold authenticated workspace stays inside production interaction and bundle budgets', async ({ browser }) => {
	const authentication = await browser.newContext();
	const signIn = await authentication.newPage(); await signIn.goto('/sign-in');
	await signIn.getByRole('button', { name: /^Author/u }).click();
	await expect(signIn).toHaveURL(/\/workspace\/ws-demo$/u, { timeout: 20_000 });
	const storageState = await authentication.storageState(); await authentication.close();

	const context = await browser.newContext({ storageState }); await installObservers(context);
	const page = await context.newPage(); await page.goto('/workspace/ws-demo');
	const before = await page.evaluate(() => performance.now());
	await page.getByRole('button', { name: 'Open revision history' }).click();
	await expect(page.getByRole('region', { name: 'Revision history' })).toBeVisible();
	const interactionMs = await page.evaluate((started) => performance.now() - started, before);
	const metrics = await readMetrics(page);
	const inpUpperBoundMs = metrics.eventDuration || 16;
	process.stdout.write(`[performance] workspace ${JSON.stringify({ ...metrics, inpUpperBoundMs, workflowResponseMs: Math.round(interactionMs) })}\n`);
	expect(metrics.lcp).toBeGreaterThan(0);
	expect(metrics.lcp).toBeLessThanOrEqual(BUDGETS.lcpMs);
	expect(metrics.cls).toBeLessThanOrEqual(BUDGETS.cls);
	expect(inpUpperBoundMs).toBeLessThanOrEqual(BUDGETS.inpProxyMs);
	expect(interactionMs).toBeLessThanOrEqual(BUDGETS.workflowResponseMs);
	expect(metrics.javaScriptBytes).toBeLessThanOrEqual(BUDGETS.workspaceJavaScriptBytes);
	await context.close();
});
