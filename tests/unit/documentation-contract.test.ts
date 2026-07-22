import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

function read(relativePath: string): string {
	return readFileSync(resolve(root, relativePath), 'utf8');
}

function localLinks(relativePath: string): string[] {
	const document = read(relativePath);
	return [...document.matchAll(/\]\((?!https?:|#)([^)]+)\)/gu)].map((match) => match[1].split('#')[0]);
}

describe('release documentation contract', () => {
	it('has no broken local evidence links', () => {
		for (const relativePath of [
			'README.md',
			'FEATURES.md',
			'SECURITY.md',
			'docs/data-model.md',
			'docs/deployment.md',
			'docs/releases/v2.0.0.md',
		]) {
			const base = dirname(resolve(root, relativePath));
			for (const link of localLinks(relativePath)) {
				expect(existsSync(resolve(base, link)), `Missing ${relativePath} link: ${link}`).toBe(true);
			}
		}
	});

	it('keeps every RFC problem visible and rejects superseded product claims', () => {
		const ledger = read('docs/engineering/rfc-closure-ledger.md');
		for (let problem = 1; problem <= 18; problem += 1) {
			expect(ledger).toContain(`P-${String(problem).padStart(2, '0')}`);
		}

		const publicDocs = `${read('README.md')}\n${read('FEATURES.md')}`;
		for (const supersededClaim of [
			'WCAG AA Compliant',
			'20+ example posts',
			'Session Storage: Browser-based state persistence',
			'Choose between Gemini 1.5 Flash',
		]) {
			expect(publicDocs).not.toContain(supersededClaim);
		}
	});
});
