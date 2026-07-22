'use client';

import { useState } from 'react';

import type { AISuggestionResult } from '@/src/modules/ai/domain';
import type { PostDetail } from '@/src/modules/editorial/domain';
import type { MembershipContext } from '@/src/modules/identity/domain';

type ApiEnvelope<T> = { data: T } | { error: { code: string; message: string; requestId: string } };
const hasData = <T,>(envelope: ApiEnvelope<T>): envelope is { data: T } => 'data' in envelope;

export function AISuggestionPanel({ context, post, canApply, configuredMode, onApply }: Readonly<{
	context: MembershipContext;
	post: PostDetail;
	canApply: boolean;
	configuredMode: string;
	onApply: (suggestion: AISuggestionResult['suggestion']) => void;
}>) {
	const [instruction, setInstruction] = useState('Improve structure and sharpen the editorial angle.');
	const [result, setResult] = useState<AISuggestionResult | null>(null);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState('AI never changes the post until Apply suggestion is selected.');

	async function suggest() {
		setBusy(true); setResult(null); setMessage('Generating a bounded suggestion…');
		const response = await fetch(`/api/workspaces/${context.workspaceId}/ai/suggest`, {
			method: 'POST', headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ postId: post.id, title: post.title, excerpt: post.excerpt, content: post.content, instruction }),
		});
		const envelope = await response.json() as ApiEnvelope<AISuggestionResult>;
		setBusy(false);
		if (!response.ok || !hasData(envelope)) { setMessage('Suggestion unavailable. Quota, rate or provider policy rejected the request.'); return; }
		setResult(envelope.data);
		setMessage(`${envelope.data.mode === 'mock' ? 'Mock demo' : 'Live Gemini'} suggestion ready. ${envelope.data.remainingCharacters.toLocaleString()} characters remain in this workspace window.`);
	}

	return <section className="ai-panel" aria-labelledby="ai-heading">
		<div><p className="eyebrow">AI assistance · {configuredMode === 'gemini' ? 'Live configured mode' : 'Deterministic mock mode'}</p><h2 id="ai-heading">Suggest, inspect, then apply</h2></div>
		<label htmlFor={`ai-instruction-${post.id}`}>Editorial instruction<textarea id={`ai-instruction-${post.id}`} maxLength={500} value={instruction} onChange={(event) => setInstruction(event.target.value)} /></label>
		<button type="button" disabled={busy || instruction.trim().length < 3} onClick={() => void suggest()}>{busy ? 'Generating…' : 'Generate suggestion'}</button>
		<p className="panel-message" role="status">{message}</p>
		{result ? <article className="suggestion-preview" aria-label="AI suggestion preview">
			<span>{result.provider} · {result.model} · {result.latencyMs} ms</span>
			<h3>{result.suggestion.title}</h3><p>{result.suggestion.excerpt}</p><pre>{result.suggestion.content}</pre><small>{result.suggestion.rationale}</small>
			<button type="button" disabled={!canApply} onClick={() => { onApply(result.suggestion); setMessage('Suggestion applied locally. Autosave will create a user-authored revision.'); }}>Apply suggestion</button>
			{!canApply ? <p>Read-only role: preview is available, application is not authorized.</p> : null}
		</article> : null}
	</section>;
}
