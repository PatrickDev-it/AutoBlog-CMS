'use client';

import { useEffect, useRef, useState } from 'react';

import type { PostDetail } from '@/src/modules/editorial/domain';
import type { MembershipContext } from '@/src/modules/identity/domain';
import { can } from '@/src/modules/identity/policy';
import type { MediaAsset } from '@/src/modules/media/domain';

type ApiEnvelope<T> = { data: T } | { error: { code: string; message: string; requestId: string } };
const hasData = <T,>(envelope: ApiEnvelope<T>): envelope is { data: T } => 'data' in envelope;

export function MediaPanel({ context, post }: Readonly<{ context: MembershipContext; post: PostDetail }>) {
	const [asset, setAsset] = useState<MediaAsset | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [altText, setAltText] = useState('');
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState('');
	const fileInput = useRef<HTMLInputElement>(null);
	const canUpload = can(context.role, 'media.upload', { actorId: context.userId, ownerId: post.authorId });
	const canDelete = can(context.role, 'media.delete');

	useEffect(() => {
		let current = true;
		void fetch(`/api/workspaces/${context.workspaceId}/media?postId=${encodeURIComponent(post.id)}`)
			.then(async (response) => response.json() as Promise<ApiEnvelope<MediaAsset[]>>)
			.then((envelope) => { if (current && hasData(envelope)) setAsset(envelope.data[0] ?? null); })
			.catch(() => { if (current) setMessage('Media metadata is temporarily unavailable.'); });
		return () => { current = false; };
	}, [context.workspaceId, post.id]);

	async function upload() {
		if (!file) { setMessage('Choose a PNG, JPEG or WebP image.'); return; }
		setBusy(true); setMessage('Verifying image…');
		const body = new FormData();
		body.set('file', file); body.set('postId', post.id); body.set('altText', altText);
		if (asset) body.set('replaceAssetId', asset.id);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/media`, { method: 'POST', body });
		const envelope = await response.json() as ApiEnvelope<MediaAsset>;
		setBusy(false);
		if (!response.ok || !hasData(envelope)) { setMessage('Upload rejected. Verify type, size and ownership.'); return; }
		setAsset(envelope.data); setFile(null); if (fileInput.current) fileInput.current.value = '';
		setMessage(asset ? 'Replacement activated; prior object queued for cleanup.' : 'Verified image activated.');
	}

	async function remove() {
		if (!asset) return;
		setBusy(true);
		const response = await fetch(`/api/workspaces/${context.workspaceId}/media/${asset.id}`, { method: 'DELETE' });
		setBusy(false);
		if (!response.ok) { setMessage('Deletion was rejected.'); return; }
		setAsset(null); setMessage('Asset removed and cleanup queued.');
	}

	return <section className="media-panel" aria-labelledby="media-heading">
		<p className="eyebrow">Verified media</p><h3 id="media-heading">Post cover</h3>
		{asset ? <div className="asset-card"><strong>{asset.fileName}</strong><span>{asset.mimeType} · {asset.width}×{asset.height} · {Math.ceil(asset.byteSize / 1024)} KB</span><span>{asset.altText || 'No alternative text supplied'}</span></div> : <p className="panel-empty">No active asset.</p>}
		{canUpload ? <div className="media-form">
			<label htmlFor={`media-file-${post.id}`}>PNG, JPEG or WebP · 5 MB maximum<input ref={fileInput} id={`media-file-${post.id}`} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>
			<label htmlFor={`media-alt-${post.id}`}>Alternative text<input id={`media-alt-${post.id}`} value={altText} maxLength={500} onChange={(event) => setAltText(event.target.value)} /></label>
			<button type="button" disabled={busy || !file} onClick={() => void upload()}>{asset ? 'Replace safely' : 'Upload verified image'}</button>
		</div> : null}
		{asset && canDelete ? <button className="danger-button" type="button" disabled={busy} onClick={() => void remove()}>Delete asset</button> : null}
		{message ? <p className="panel-message" role="status">{message}</p> : null}
	</section>;
}
