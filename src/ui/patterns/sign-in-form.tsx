'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DEMO_PASSWORD, DEMO_WORKSPACE_ID } from '@/src/modules/identity/demo';
import type { Role } from '@/src/modules/identity/domain';
import { authClient } from '@/src/platform/auth/client';

type DemoIdentity = Readonly<{ id: string; name: string; email: string; role: Role }>;

export function SignInForm({ demoEnabled, identities }: Readonly<{ demoEnabled: boolean; identities: readonly DemoIdentity[] }>) {
	const router = useRouter();
	const [pendingRole, setPendingRole] = useState<Role | null>(null);
	const [error, setError] = useState('');

	async function enterDemo(identity: DemoIdentity) {
		setPendingRole(identity.role);
		setError('');
		const result = await authClient.signIn.email({ email: identity.email, password: DEMO_PASSWORD });
		if (result.error) {
			setError('The demo session could not be created. Verify that migrations and seed data are current.');
			setPendingRole(null);
			return;
		}
		router.push(`/workspace/${DEMO_WORKSPACE_ID}`);
		router.refresh();
	}

	return (
		<section className="auth-panel" aria-labelledby="role-heading">
			<div className="panel-heading"><p className="eyebrow">Active policy</p><h2 id="role-heading">Evaluate by role</h2></div>
			{demoEnabled ? (
				<div className="role-list">
					{identities.map((identity) => (
						<button className="role-card" type="button" key={identity.id} disabled={pendingRole !== null} onClick={() => void enterDemo(identity)}>
							<span><strong>{identity.role}</strong><small>{identity.name}</small></span>
							<span aria-hidden="true">{pendingRole === identity.role ? 'Opening…' : '→'}</span>
						</button>
					))}
				</div>
			) : <p className="empty-state">Public demo entry is disabled in this environment.</p>}
			{error ? <p className="form-error" role="alert">{error}</p> : null}
			<p className="privacy-note">Mode: deterministic demo identities. No social provider, billing account or live AI call is used.</p>
		</section>
	);
}
