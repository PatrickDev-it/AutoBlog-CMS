'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { PostDetail, PostSummary } from '@/src/modules/editorial/domain';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { can } from '@/src/modules/identity/policy';
import { authClient } from '@/src/platform/auth/client';

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
type ApiEnvelope<T> = { data: T } | { error: { code: string; message: string; requestId: string } };

function isData<T>(envelope: ApiEnvelope<T>): envelope is { data: T } {
	return 'data' in envelope;
}

export function WorkspaceEditor({ context, initialPosts, initialPost, aiMode }: Readonly<{
	context: MembershipContext;
	initialPosts: PostSummary[];
	initialPost: PostDetail | null;
	aiMode: string;
}>) {
	const router = useRouter();
	const [posts, setPosts] = useState(initialPosts);
	const [post, setPost] = useState(initialPost);
	const [saveState, setSaveState] = useState<SaveState>('idle');
	const [message, setMessage] = useState('');
	const [serverConflict, setServerConflict] = useState<PostDetail | null>(null);
	const baseline = useRef(initialPost ? JSON.stringify({ title: initialPost.title, excerpt: initialPost.excerpt, content: initialPost.content }) : '');

	const canCreate = can(context.role, 'post.create', { actorId: context.userId, ownerId: context.userId });
	const canEdit = post ? can(context.role, 'post.update', { actorId: context.userId, ownerId: post.authorId }) : false;
	const draft = useMemo(() => post ? JSON.stringify({ title: post.title, excerpt: post.excerpt, content: post.content }) : '', [post]);

	useEffect(() => {
		if (!post || !canEdit || draft === baseline.current || ['saving', 'conflict', 'error'].includes(saveState)) return;
		const timer = window.setTimeout(async () => {
			setSaveState('saving');
			const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ expectedVersion: post.version, title: post.title, excerpt: post.excerpt, content: post.content }),
			});
			const envelope = await response.json() as ApiEnvelope<PostDetail>;
			if (response.status === 409) {
				setSaveState('conflict');
				setMessage('A newer revision exists. Your local draft has not overwritten it.');
				return;
			}
			if (!response.ok || !isData(envelope)) {
				setSaveState('error');
				setMessage('Autosave failed. Your text remains in this browser.');
				return;
			}
			baseline.current = JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content });
			setPost(envelope.data);
			setPosts((current) => current.map((item) => item.id === envelope.data.id ? envelope.data : item));
			setSaveState('saved');
			setMessage(`Revision ${envelope.data.version} saved.`);
		}, 850);
		return () => window.clearTimeout(timer);
	}, [canEdit, context.workspaceId, draft, post, saveState]);

	function editPost(changes: Partial<Pick<PostDetail, 'title' | 'excerpt' | 'content'>>) {
		if (!post) return;
		setSaveState('idle');
		setServerConflict(null);
		setPost({ ...post, ...changes });
	}

	async function selectPost(postId: string) {
		setSaveState('idle'); setMessage(''); setServerConflict(null);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${postId}`);
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		if (response.ok && isData(envelope)) {
			setPost(envelope.data);
			baseline.current = JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content });
		}
	}

	async function createPost() {
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts`, {
			method: 'POST', headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ title: 'Untitled editorial brief', excerpt: '', content: '' }),
		});
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		if (response.ok && isData(envelope)) {
			setPosts((current) => [envelope.data, ...current]);
			setPost(envelope.data);
			baseline.current = JSON.stringify({ title: envelope.data.title, excerpt: '', content: '' });
			setMessage('Draft created. Start writing.');
		}
	}

	async function reloadConflict(compareOnly = false) {
		if (!post) return;
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}`);
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		if (!response.ok || !isData(envelope)) return;
		if (compareOnly) { setServerConflict(envelope.data); return; }
		setPost(envelope.data); setServerConflict(null); setSaveState('saved');
		baseline.current = JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content });
		setMessage(`Reloaded revision ${envelope.data.version}.`);
	}

	async function signOut() {
		await authClient.signOut();
		router.push('/sign-in'); router.refresh();
	}

	return (
		<main id="main-content" className="workspace-shell">
			<aside className="workspace-sidebar">
				<div className="brand"><span className="brand-mark" aria-hidden="true">A</span><span>AutoBlog</span></div>
				<div className="workspace-label"><span>Workspace</span><strong>{context.workspaceName}</strong></div>
				<nav aria-label="Posts" className="post-nav">
					<div className="post-nav-heading"><span>Editorial queue</span>{canCreate ? <button type="button" onClick={() => void createPost()} aria-label="Create draft">+</button> : null}</div>
					{posts.map((item) => <button type="button" key={item.id} aria-current={post?.id === item.id ? 'page' : undefined} onClick={() => void selectPost(item.id)}><span>{item.title}</span><small>{item.state} · v{item.version}</small></button>)}
				</nav>
				<div className="guided-checklist"><span className="eyebrow">Guided run</span><ol><li className="done">Enter as a role</li><li className={post ? 'done' : ''}>Select a seeded draft</li><li>Edit and observe autosave</li><li>Submit for review</li><li>Publish immutable revision</li></ol></div>
			</aside>

			<section className="editor-shell">
				<header className="editor-topbar">
					<div><span className="role-pill">{context.role}</span><span className="mode-pill">AI: {aiMode === 'gemini' ? 'Live Gemini' : 'Mock / demo'}</span></div>
					<div><span className={`save-state ${saveState}`} role="status">{saveState === 'saving' ? 'Saving…' : saveState === 'conflict' ? 'Conflict' : saveState === 'error' ? 'Save error' : saveState === 'saved' ? 'Saved' : 'Ready'}</span><button className="text-button" type="button" onClick={() => void signOut()}>Sign out</button></div>
				</header>

				{post ? <div className="editor-grid">
					<div className="editor-form">
						<div className="document-meta"><span>{post.state}</span><span>Revision {post.version}</span><span>/{post.slug}</span></div>
						<label htmlFor="post-title">Title</label><textarea id="post-title" className="title-input" value={post.title} disabled={!canEdit} onChange={(event) => editPost({ title: event.target.value })} />
						<label htmlFor="post-excerpt">Standfirst</label><textarea id="post-excerpt" className="excerpt-input" value={post.excerpt} disabled={!canEdit} onChange={(event) => editPost({ excerpt: event.target.value })} />
						<label htmlFor="post-content">Article body</label><textarea id="post-content" className="content-input" value={post.content} disabled={!canEdit} onChange={(event) => editPost({ content: event.target.value })} />
						{message ? <p className={`editor-message ${saveState}`} role={saveState === 'error' || saveState === 'conflict' ? 'alert' : 'status'}>{message}</p> : null}
						{saveState === 'conflict' ? <div className="conflict-actions"><button type="button" onClick={() => void reloadConflict()}>Reload server revision</button><button type="button" onClick={() => void reloadConflict(true)}>Compare versions</button></div> : null}
						{serverConflict ? <section className="compare-panel" aria-labelledby="compare-heading"><h2 id="compare-heading">Conflict comparison</h2><div><article><h3>Your local draft</h3><pre>{post.content}</pre></article><article><h3>Server revision {serverConflict.version}</h3><pre>{serverConflict.content}</pre></article></div></section> : null}
					</div>
					<aside className="evidence-panel"><p className="eyebrow">Evidence rail</p><h2>Draft with context</h2><dl><div><dt>Author</dt><dd>{post.authorId}</dd></div><div><dt>Published pointer</dt><dd>{post.publishedRevisionId ? 'Immutable revision set' : 'Not published'}</dd></div><div><dt>Concurrency</dt><dd>Expected version {post.version}</dd></div></dl><p>Autosave creates a revision. A stale version returns HTTP 409 and preserves the newer content.</p></aside>
				</div> : <div className="empty-state">No posts are available for this workspace.</div>}
			</section>
		</main>
	);
}
