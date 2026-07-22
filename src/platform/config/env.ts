import { z } from 'zod';

const DEVELOPMENT_SECRET = 'development-only-autoblog-secret-change-me';

const booleanValue = z.string().optional().transform((value) => value === 'true');

const environmentSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
	DATABASE_URL: z.string().min(1).default('file:./data/autoblog.db'),
	DATABASE_AUTH_TOKEN: z.string().optional(),
	BETTER_AUTH_SECRET: z.string().min(32).default(DEVELOPMENT_SECRET),
	DEMO_ENABLED: booleanValue,
	AI_MODE: z.enum(['mock', 'gemini']).default('mock'),
	GEMINI_API_KEY: z.string().optional(),
	GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
	CRON_SECRET: z.string().min(24).default('development-only-cron-secret'),
	AI_MONTHLY_CHARACTER_QUOTA: z.coerce.number().int().positive().default(200_000),
	MEDIA_MAX_BYTES: z.coerce.number().int().positive().max(10 * 1024 * 1024).default(5 * 1024 * 1024),
});

export type Environment = z.infer<typeof environmentSchema>;

export function getEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
	return environmentSchema.parse(source);
}

export function assertRuntimeConfiguration(environment = getEnvironment()): void {
	if (environment.NODE_ENV === 'production' && environment.BETTER_AUTH_SECRET === DEVELOPMENT_SECRET) {
		throw new Error('BETTER_AUTH_SECRET_REQUIRED');
	}
	if (environment.AI_MODE === 'gemini' && !environment.GEMINI_API_KEY) {
		throw new Error('GEMINI_API_KEY_REQUIRED');
	}
}

export function isRemoteDatabase(url: string): boolean {
	return !url.startsWith('file:') && url !== ':memory:';
}
