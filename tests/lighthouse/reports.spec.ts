import { mkdir, rm, writeFile } from 'node:fs/promises';
import { chromium, expect, test } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';

const OUTPUT_DIRECTORY = '.lighthouse';
const ROUTES = [
	{ name: 'marketing', url: 'http://127.0.0.1:3100/' },
	{ name: 'sign-in', url: 'http://127.0.0.1:3100/sign-in' },
] as const;
const BUDGETS = {
	performance: 0.8,
	accessibility: 0.95,
	bestPractices: 0.9,
	seo: 0.9,
	lcpMs: 2_500,
	cls: 0.1,
} as const;

type Metrics = Readonly<{
	performance: number;
	accessibility: number;
	bestPractices: number;
	seo: number;
	lcpMs: number;
	cls: number;
}>;

function required(value: number | null | undefined, metric: string): number {
	if (value === null || value === undefined) throw new Error(`Lighthouse omitted ${metric}.`);
	return value;
}

function median(values: readonly number[]): number {
	const ordered = [...values].sort((left, right) => left - right);
	return required(ordered[Math.floor(ordered.length / 2)], 'median value');
}

function medians(runs: readonly Metrics[]): Metrics {
	return {
		performance: median(runs.map((run) => run.performance)),
		accessibility: median(runs.map((run) => run.accessibility)),
		bestPractices: median(runs.map((run) => run.bestPractices)),
		seo: median(runs.map((run) => run.seo)),
		lcpMs: median(runs.map((run) => run.lcpMs)),
		cls: median(runs.map((run) => run.cls)),
	};
}

test('six production Lighthouse reports satisfy the release budgets', async () => {
	await rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
	await mkdir(OUTPUT_DIRECTORY, { recursive: true });
	const chrome = await launch({
		chromePath: chromium.executablePath(),
		chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
	});
	const summary: Record<string, Metrics> = {};

	try {
		for (const route of ROUTES) {
			const runs: Metrics[] = [];
			for (let index = 1; index <= 3; index += 1) {
				const result = await lighthouse(route.url, {
					port: chrome.port,
					output: 'html',
					logLevel: 'error',
					onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
					formFactor: 'desktop',
					screenEmulation: { mobile: false, width: 1_350, height: 940, deviceScaleFactor: 1, disabled: false },
				});
				if (!result) throw new Error(`Lighthouse returned no result for ${route.name}.`);
				const metrics = {
					performance: required(result.lhr.categories.performance?.score, 'performance score'),
					accessibility: required(result.lhr.categories.accessibility?.score, 'accessibility score'),
					bestPractices: required(result.lhr.categories['best-practices']?.score, 'best-practices score'),
					seo: required(result.lhr.categories.seo?.score, 'SEO score'),
					lcpMs: required(result.lhr.audits['largest-contentful-paint']?.numericValue, 'LCP'),
					cls: required(result.lhr.audits['cumulative-layout-shift']?.numericValue, 'CLS'),
				} satisfies Metrics;
				runs.push(metrics);
				const report = Array.isArray(result.report) ? result.report[0] : result.report;
				if (!report) throw new Error(`Lighthouse returned no HTML report for ${route.name}.`);
				await writeFile(`${OUTPUT_DIRECTORY}/${route.name}-${index}.html`, report, 'utf8');
			}
			summary[route.name] = medians(runs);
		}
	} finally {
		await chrome.kill();
	}

	await writeFile(`${OUTPUT_DIRECTORY}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
	process.stdout.write(`[lighthouse] ${JSON.stringify(summary)}\n`);
	for (const route of ROUTES) {
		const metrics = summary[route.name];
		expect(metrics, `${route.name} summary`).toBeDefined();
		if (!metrics) continue;
		expect(metrics.performance).toBeGreaterThanOrEqual(BUDGETS.performance);
		expect(metrics.accessibility).toBeGreaterThanOrEqual(BUDGETS.accessibility);
		expect(metrics.bestPractices).toBeGreaterThanOrEqual(BUDGETS.bestPractices);
		expect(metrics.seo).toBeGreaterThanOrEqual(BUDGETS.seo);
		expect(metrics.lcpMs).toBeLessThanOrEqual(BUDGETS.lcpMs);
		expect(metrics.cls).toBeLessThanOrEqual(BUDGETS.cls);
	}
});
