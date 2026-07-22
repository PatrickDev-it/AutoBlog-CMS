import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getEnvironment } from '@/src/platform/config/env';
import { getDatabase, type DatabaseContext } from '@/src/platform/db/client';
import { accounts, authRateLimits, sessions, users, verifications } from '@/src/platform/db/schema';

export function createAuthentication(database: DatabaseContext, options: Readonly<{ baseURL: string; secret: string }>) {
	return betterAuth({
		appName: 'AutoBlog CMS',
		baseURL: options.baseURL,
		secret: options.secret,
		database: drizzleAdapter(database.db, {
			provider: 'sqlite',
			schema: { user: users, session: sessions, account: accounts, verification: verifications, rateLimit: authRateLimits },
		}),
		trustedOrigins: [options.baseURL],
		emailAndPassword: {
			enabled: true,
			disableSignUp: true,
			minPasswordLength: 12,
			maxPasswordLength: 128,
		},
		session: {
			expiresIn: 60 * 60 * 12,
			updateAge: 60 * 60,
			cookieCache: { enabled: false },
		},
		rateLimit: {
			enabled: true,
			storage: 'database',
			window: 60,
			max: 60,
			customRules: {
				'/sign-in/email': { window: 60, max: 8 },
			},
		},
		advanced: {
			cookiePrefix: 'autoblog',
			useSecureCookies: options.baseURL.startsWith('https://'),
		},
	});
}

const environment = getEnvironment();
export const auth = createAuthentication(getDatabase(), {
	baseURL: environment.NEXT_PUBLIC_APP_URL,
	secret: environment.BETTER_AUTH_SECRET,
});
