'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { PostDetail, PostSummary, RevisionDetail } from '@/src/modules/editorial/domain';
import { TRANSITION_RULES, type TransitionAction } from '@/src/modules/editorial/workflow';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { can } from '@/src/modules/identity/policy';
import { authClient } from '@/src/platform/auth/client';
import { AISuggestionPanel } from '@/src/ui/patterns/ai-suggestion-panel';
import { MediaPanel } from '@/src/ui/patterns/media-panel';

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
type ApiEnvelope<T> = { data: T } | { error: { code: string; message: string; requestId: string } };

function isData<T>(envelope: ApiEnvelope<T>): envelope is { data: T } {
	return 'data' in envelope;
}

const ACTION_LABELS: Readonly<Record<TransitionAction, string>> = {
	submit: 'Submit for review',
	request_changes: 'Request changes',
	approve: 'Approve',
	schedule: 'Schedule',
	publish: 'Publish now',
	archive: 'Archive',
};

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
	const [revisions, setRevisions] = useState<RevisionDetail[]>([]);
	const [comparison, setComparison] = useState<RevisionDetail | null>(null);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [workflowBusy, setWorkflowBusy] = useState(false);
	const [scheduledFor, setScheduledFor] = useState('');
	const [resetArmed, setResetArmed] = useState(false);
	const [resetBusy, setResetBusy] = useState(false);
	const saveInFlight = useRef(false);
	const titleInput = useRef<HTMLTextAreaElement>(null);
	const [baseline, setBaseline] = useState(initialPost ? JSON.stringify({ title: initialPost.title, excerpt: initialPost.excerpt, content: initialPost.content }) : '');

	const canCreate = can(context.role, 'post.create', { actorId: context.userId, ownerId: context.userId });
	const canEdit = post ? can(context.role, 'post.update', { actorId: context.userId, ownerId: post.authorId }) && ['Draft', 'ChangesRequested', 'Published'].includes(post.state) : false;
	const draft = useMemo(() => post ? JSON.stringify({ title: post.title, excerpt: post.excerpt, content: post.content }) : '', [post]);
	const hasUnsavedChanges = draft !== baseline;
	const availableActions = post ? (Object.entries(TRANSITION_RULES) as [TransitionAction, (typeof TRANSITION_RULES)[TransitionAction]][])
		.filter(([, rule]) => rule.from.includes(post.state) && can(context.role, rule.permission, { actorId: context.userId, ownerId: post.authorId })) : [];

	useEffect(() => {
		if (!post || !canEdit || draft === baseline || saveInFlight.current || ['conflict', 'error'].includes(saveState)) return;
		const savedDraft = draft;
		const timer = window.setTimeout(async () => {
			saveInFlight.current = true;
			setSaveState('saving');
			try {
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
				if (!response.ok || !isData(envelope)) throw new Error('AUTOSAVE_REJECTED');
				setBaseline(savedDraft);
				setPost((current) => current ? { ...envelope.data, title: current.title, excerpt: current.excerpt, content: current.content } : envelope.data);
				setPosts((current) => current.map((item) => item.id === envelope.data.id ? envelope.data : item));
				setSaveState('saved');
				setMessage(`Revision ${envelope.data.version} saved.`);
			} catch {
				setSaveState('error');
				setMessage('Autosave failed. Your text remains in this browser.');
			} finally {
				saveInFlight.current = false;
			}
		}, 850);
		return () => window.clearTimeout(timer);
	}, [baseline, canEdit, context.workspaceId, draft, post, saveState]);

	function editPost(changes: Partial<Pick<PostDetail, 'title' | 'excerpt' | 'content'>>) {
		if (!saveInFlight.current) setSaveState('idle');
		setServerConflict(null);
		setPost((current) => current ? { ...current, ...changes } : current);
	}

	async function selectPost(postId: string) {
		setSaveState('idle'); setMessage(''); setServerConflict(null); setHistoryOpen(false); setRevisions([]); setComparison(null);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${postId}`);
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		if (response.ok && isData(envelope)) {
			setPost(envelope.data);
			setBaseline(JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content }));
			window.requestAnimationFrame(() => titleInput.current?.focus());
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
			setBaseline(JSON.stringify({ title: envelope.data.title, excerpt: '', content: '' }));
			setMessage('Draft created. Start writing.');
			window.requestAnimationFrame(() => titleInput.current?.focus());
		}
	}

	async function reloadConflict(compareOnly = false) {
		if (!post) return;
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}`);
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		if (!response.ok || !isData(envelope)) return;
		if (compareOnly) { setServerConflict(envelope.data); return; }
		setPost(envelope.data); setServerConflict(null); setSaveState('saved');
		setBaseline(JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content }));
		setMessage(`Reloaded revision ${envelope.data.version}.`);
	}

	async function loadHistory() {
		if (!post) return;
		if (historyOpen) { setHistoryOpen(false); return; }
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}/revisions`);
		const envelope = await response.json() as ApiEnvelope<RevisionDetail[]>;
		if (response.ok && isData(envelope)) { setRevisions(envelope.data); setHistoryOpen(true); }
	}

	async function restoreRevision(revisionId: string) {
		if (!post || hasUnsavedChanges) return;
		setWorkflowBusy(true);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}/revisions/restore`, {
			method: 'POST', headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ expectedVersion: post.version, revisionId }),
		});
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		setWorkflowBusy(false);
		if (!response.ok || !isData(envelope)) { setMessage('Restore failed. Reload before retrying.'); setSaveState(response.status === 409 ? 'conflict' : 'error'); return; }
		setPost(envelope.data); setPosts((items) => items.map((item) => item.id === envelope.data.id ? envelope.data : item));
		setBaseline(JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content }));
		setMessage(`Revision ${envelope.data.version} created from history.`); setSaveState('saved'); setHistoryOpen(false); setComparison(null);
	}

	async function runTransition(action: TransitionAction) {
		if (!post || hasUnsavedChanges || saveState === 'saving') { setMessage('Wait for autosave before changing workflow state.'); return; }
		setWorkflowBusy(true);
		const body: Record<string, unknown> = { expectedVersion: post.version, action };
		if (action === 'schedule') {
			if (!scheduledFor) { setMessage('Choose a future publication time.'); setWorkflowBusy(false); return; }
			body.scheduledFor = new Date(scheduledFor).toISOString();
		}
		if (action === 'schedule' || action === 'publish') body.idempotencyKey = `browser:${post.id}:${post.version}:${action}`;
		const response = await fetch(`/api/workspaces/${context.workspaceId}/posts/${post.id}/transitions`, {
			method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
		});
		const envelope = await response.json() as ApiEnvelope<PostDetail>;
		setWorkflowBusy(false);
		if (!response.ok || !isData(envelope)) {
			setSaveState(response.status === 409 ? 'conflict' : 'error');
			setMessage('Workflow command was rejected. Reload the current revision before retrying.');
			return;
		}
		setPost(envelope.data); setPosts((items) => items.map((item) => item.id === envelope.data.id ? envelope.data : item));
		setBaseline(JSON.stringify({ title: envelope.data.title, excerpt: envelope.data.excerpt, content: envelope.data.content }));
		setSaveState('saved'); setMessage(`${ACTION_LABELS[action]} completed.`);
	}

	async function signOut() {
		await authClient.signOut();
		router.push('/sign-in'); router.refresh();
	}

	async function resetDemo() {
		if (!resetArmed) { setResetArmed(true); setMessage('Reset affects only the bounded demo workspace. Select Confirm reset to continue.'); return; }
		setResetBusy(true);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/demo/reset`, {
			method: 'POST', headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ idempotencyKey: `browser-reset:${crypto.randomUUID()}` }),
		});
		if (!response.ok) { setResetBusy(false); setResetArmed(false); setMessage('Demo reset was rejected or rate-limited.'); return; }
		window.location.reload();
	}

	return (
		<main id="main-content" className="workspace-shell">
			<aside className="workspace-sidebar">
				<div className="brand"><span className="brand-mark" aria-hidden="true">A</span><span>AutoBlog</span></div>
				<div className="workspace-label"><span>Workspace</span><strong>{context.workspaceName}</strong><small>Guided data · same policy and repository path</small></div>
				<nav aria-label="Posts" className="post-nav">
					<div className="post-nav-heading"><span>Editorial queue</span>{canCreate ? <button type="button" onClick={() => void createPost()} aria-label="Create draft">+</button> : null}</div>
					{posts.map((item) => <button type="button" key={item.id} aria-current={post?.id === item.id ? 'page' : undefined} onClick={() => void selectPost(item.id)}><span>{item.title}</span><small>{item.state} · v{item.version}</small></button>)}
				</nav>
				<div className="guided-checklist"><span className="eyebrow">Guided run</span><ol><li className="done">Enter as a role</li><li className={post ? 'done' : ''}>Select a seeded draft</li><li className={post && post.version > 1 ? 'done' : ''}>Edit and observe autosave</li><li className={post && !['Draft', 'ChangesRequested'].includes(post.state) ? 'done' : ''}>Submit for review</li><li className={post?.publishedRevisionId ? 'done' : ''}>Publish immutable revision</li></ol>
					{can(context.role, 'demo.reset') ? <button className={resetArmed ? 'reset-demo armed' : 'reset-demo'} type="button" disabled={resetBusy} onClick={() => void resetDemo()}>{resetBusy ? 'Resetting…' : resetArmed ? 'Confirm reset' : 'Reset demo data'}</button> : null}
				</div>
			</aside>

			<section className="editor-shell">
				<header className="editor-topbar">
					<div><span className="role-pill">{context.role}</span><span className="mode-pill">AI: {aiMode === 'gemini' ? 'Live Gemini' : 'Mock / demo'}</span></div>
					<div><span className={`save-state ${saveState}`} role="status">{saveState === 'saving' ? 'Saving…' : saveState === 'conflict' ? 'Conflict' : saveState === 'error' ? 'Save error' : saveState === 'saved' ? 'Saved' : 'Ready'}</span><button className="text-button" type="button" onClick={() => void signOut()}>Sign out</button></div>
				</header>

				{post ? <div className="editor-grid">
					<div className="editor-form">
						<div className="document-meta"><span>{post.state}</span><span>Revision {post.version}</span><span>/{post.slug}</span></div>
						<label htmlFor="post-title">Title</label><textarea ref={titleInput} id="post-title" className="title-input" value={post.title} disabled={!canEdit} onChange={(event) => editPost({ title: event.target.value })} />
						<label htmlFor="post-excerpt">Standfirst</label><textarea id="post-excerpt" className="excerpt-input" value={post.excerpt} disabled={!canEdit} onChange={(event) => editPost({ excerpt: event.target.value })} />
						<label htmlFor="post-content">Article body</label><textarea id="post-content" className="content-input" value={post.content} disabled={!canEdit} onChange={(event) => editPost({ content: event.target.value })} />
						<section className="workflow-panel" aria-labelledby="workflow-heading">
							<div><p className="eyebrow">Editorial workflow</p><h2 id="workflow-heading">Move with evidence</h2></div>
							<div className="workflow-actions">
								{availableActions.map(([action]) => <span key={action}>
									{action === 'schedule' ? <label htmlFor="schedule-time">Publication time<input id="schedule-time" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></label> : null}
									<button type="button" disabled={workflowBusy || hasUnsavedChanges || saveState === 'saving'} onClick={() => void runTransition(action)}>{ACTION_LABELS[action]}</button>
								</span>)}
							</div>
						</section>
						<AISuggestionPanel key={post.id} context={context} post={post} canApply={canEdit} configuredMode={aiMode} onApply={(suggestion) => editPost(suggestion)} />
						{message ? <p className={`editor-message ${saveState}`} role={saveState === 'error' || saveState === 'conflict' ? 'alert' : 'status'}>{message}</p> : null}
						{saveState === 'conflict' ? <div className="conflict-actions"><button type="button" onClick={() => void reloadConflict()}>Reload server revision</button><button type="button" onClick={() => void reloadConflict(true)}>Compare versions</button></div> : null}
						{serverConflict ? <section className="compare-panel" aria-labelledby="compare-heading"><h2 id="compare-heading">Conflict comparison</h2><div><article><h3>Your local draft</h3><pre>{post.content}</pre></article><article><h3>Server revision {serverConflict.version}</h3><pre>{serverConflict.content}</pre></article></div></section> : null}
					</div>
					<aside className="evidence-panel"><p className="eyebrow">Evidence rail</p><h2>Draft with context</h2><dl><div><dt>Author</dt><dd>{post.authorId}</dd></div><div><dt>Published pointer</dt><dd>{post.publishedRevisionId ? 'Immutable revision set' : 'Not published'}</dd></div><div><dt>Concurrency</dt><dd>Expected version {post.version}</dd></div></dl>
						{post.publishedRevisionId ? <a className="preview-link" href={`/preview/${context.workspaceSlug}/${post.slug}`} target="_blank" rel="noreferrer">Open public preview</a> : null}
						<button className="history-toggle" type="button" onClick={() => void loadHistory()}>{historyOpen ? 'Close revision history' : 'Open revision history'}</button>
						{historyOpen ? <section className="revision-history" aria-label="Revision history">{revisions.map((revision) => <article key={revision.id}><div><strong>v{revision.version}</strong><small>{new Date(revision.createdAt).toLocaleString()}</small></div><p>{revision.title}</p><div><button type="button" onClick={() => setComparison(revision)}>Compare</button>{can(context.role, 'revision.restore', { actorId: context.userId, ownerId: post.authorId }) && ['Draft', 'ChangesRequested', 'Published'].includes(post.state) ? <button type="button" disabled={workflowBusy || hasUnsavedChanges} onClick={() => void restoreRevision(revision.id)}>Restore as new</button> : null}</div></article>)}</section> : null}
						{comparison ? <section className="history-comparison"><h3>Current v{post.version} vs v{comparison.version}</h3><pre>{comparison.content}</pre></section> : null}
						<MediaPanel key={`media-${post.id}`} context={context} post={post} />
						<p>Autosave creates a revision. A stale version returns HTTP 409 and preserves the newer content.</p>
					</aside>
				</div> : <div className="empty-state">No posts are available for this workspace.</div>}
			</section>
		</main>
	);
}
