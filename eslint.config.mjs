import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default defineConfig([
	...nextVitals,
	...nextTypeScript,
	globalIgnores([
		'.next/**',
		'coverage/**',
		'data/**',
		'playwright-report/**',
		'test-results/**',
		'.sinapsi/**',
	]),
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
		},
	},
]);
