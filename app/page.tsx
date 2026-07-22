import Link from 'next/link';

const capabilities = [
	['01', 'Immutable by design', 'Every meaningful save becomes a revision; published content remains pinned to an auditable snapshot.'],
	['02', 'Policy before pixels', 'Owner, Admin, Editor, Author and Reviewer permissions execute on the server, not in hidden buttons.'],
	['03', 'AI with a boundary', 'Suggestions are quota-bound, mode-labeled and applied only after an explicit editorial decision.'],
] as const;

export default function MarketingPage() {
	return (
		<div className="marketing-shell">
			<header className="marketing-nav">
				<Link className="brand" href="/" aria-label="AutoBlog CMS home">
					<span className="brand-mark" aria-hidden="true">A</span>
					<span className="brand-word">AutoBlog CMS</span>
				</Link>
				<nav className="nav-links" aria-label="Primary navigation">
					<a href="#architecture">Architecture</a>
					<Link href="/sign-in" className="button">Try the demo</Link>
				</nav>
			</header>

			<main id="main-content">
				<section className="hero" aria-labelledby="hero-title">
					<div>
						<p className="eyebrow">Editorial systems, made defensible</p>
						<h1 id="hero-title">Publish with evidence.</h1>
						<p className="hero-copy">
							AutoBlog gives AI-assisted teams one durable workflow for drafting, review,
							approval and publication—without silent overwrites or simulated security.
						</p>
						<div className="hero-actions">
							<Link className="button" href="/sign-in">Enter guided demo</Link>
							<a className="button secondary" href="#architecture">Inspect the system</a>
						</div>
						<ul className="proof" aria-label="Engineering proof points">
							<li><strong>5 roles</strong>server-enforced</li>
							<li><strong>409</strong>stale-write contract</li>
							<li><strong>1 path</strong>demo to production</li>
						</ul>
					</div>

					<div className="editor-preview" aria-label="Editorial workspace preview">
						<div className="preview-toolbar">
							<span>autoblog / spring-edition</span>
							<span className="preview-dot" role="status" aria-label="Saved" />
						</div>
						<div className="preview-canvas">
							<span className="preview-state">IN REVIEW · REV 12</span>
							<h2 className="preview-title">Designing the next editorial operating system</h2>
							<div className="preview-lines" aria-hidden="true"><span /><span /><span /></div>
							<div className="preview-footer"><span>Reviewer: Maya Chen</span><span>AI mode: Mock</span></div>
						</div>
					</div>
				</section>

				<section className="capabilities" id="architecture" aria-labelledby="architecture-title">
					<div className="section-heading">
						<h2 id="architecture-title">A polished surface over explicit invariants.</h2>
						<p>One modular monolith owns identity, editorial state, media and AI boundaries. Every advertised path is designed to be persisted, authorized and tested.</p>
					</div>
					<div className="capability-grid">
						{capabilities.map(([number, title, copy]) => (
							<article className="capability-card" key={number}>
								<span>{number}</span><h3>{title}</h3><p>{copy}</p>
							</article>
						))}
					</div>
				</section>
			</main>

			<footer className="site-footer"><span>AutoBlog CMS · portfolio engineering release</span><span>Next.js · TypeScript · libSQL</span></footer>
		</div>
	);
}
