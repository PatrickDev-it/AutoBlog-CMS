import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getEditorialService } from '@/src/modules/editorial/service';
import { AppError } from '@/src/platform/observability/errors';

export const revalidate = 60;

export default async function PublicPreviewPage({ params }: Readonly<{ params: Promise<{ workspaceSlug: string; postSlug: string }> }>) {
	const { workspaceSlug, postSlug } = await params;
	let post;
	try {
		post = await getEditorialService().publicPost(workspaceSlug, postSlug);
	} catch (error) {
		if (error instanceof AppError && error.code === 'NOT_FOUND') notFound();
		throw error;
	}
	return (
		<main id="main-content" className="public-article">
			<nav aria-label="Preview context"><Link href="/">AutoBlog</Link><span>Published preview</span></nav>
			<article>
				<p className="eyebrow">{post.workspaceName}</p>
				<h1>{post.title}</h1>
				<p className="public-standfirst">{post.excerpt}</p>
				<div className="public-content">{post.content}</div>
				<footer>Immutable revision {post.revisionId} · Published {post.publishedAt.toLocaleDateString('en-GB')}</footer>
			</article>
		</main>
	);
}
