import Link from 'next/link';

import { DEMO_IDENTITIES } from '@/src/modules/identity/demo';
import { getEnvironment } from '@/src/platform/config/env';
import { SignInForm } from '@/src/ui/patterns/sign-in-form';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
	const environment = getEnvironment();
	return (
		<main id="main-content" className="auth-shell">
			<section className="auth-intro" aria-labelledby="sign-in-title">
				<Link className="brand" href="/" aria-label="AutoBlog CMS home">
					<span className="brand-mark" aria-hidden="true">A</span><span>AutoBlog CMS</span>
				</Link>
				<div>
					<p className="eyebrow">Bounded recruiter demo</p>
					<h1 id="sign-in-title">Choose a seat at the editorial table.</h1>
					<p className="hero-copy">Each role is a real database identity with a revocable HTTP-only session. The demo workspace is isolated from every configured workspace.</p>
				</div>
				<p className="auth-note">Demo data uses the production command, policy and repository path.</p>
			</section>
			<SignInForm demoEnabled={environment.DEMO_ENABLED} identities={DEMO_IDENTITIES} />
		</main>
	);
}
