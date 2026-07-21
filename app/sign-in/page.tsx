import Link from 'next/link';

export default function SignInPlaceholderPage() {
	return (
		<main id="main-content" className="marketing-shell" style={{ paddingBlock: '12vh' }}>
			<p className="eyebrow">Guided demo</p>
			<h1>Application core is being initialized.</h1>
			<p className="hero-copy">Real bounded demo identities replace the former arbitrary-token gate in the next vertical slice.</p>
			<Link className="button secondary" href="/">Return to product overview</Link>
		</main>
	);
}
