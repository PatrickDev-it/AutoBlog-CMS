'use client';

import { Button } from '@/ui/button';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { ReceiverMessage, SenderMessage } from '../_ui/message';
import { FiArrowUp } from 'react-icons/fi';

import type { Content } from '@google/generative-ai';

export default ({ onSend }: { onSend: (history: Content[]) => Promise<string> }) => {
	const [input, setInput] = useState('');
	const [writing, setWriting] = useState(false);
	const [timeout, setTimeoutState] = useState<NodeJS.Timeout>();
	const [history, setHistory] = useState([]);

	const addMessage = (role: 'user' | 'model', text: string) => {
		if (role === 'user') setInput('');
		setHistory(p => {
			const last = p[p.length - 1];
			console.log('last => ', p, history);
			return last?.role !== role
				? [...p, { role, parts: [{ text }] }]
				: [...p.slice(0, -1), { role, parts: [...last.parts, { text }] }];
		});
	};

	const updatedState: <T>(
		setState: Dispatch<SetStateAction<T>>
	) => Promise<T> = async setState => {
		return new Promise(r => {
			setState(p => {
				r(p);
				return p;
			});
		});
	};

	useEffect(() => {
		const history = JSON.parse(sessionStorage.getItem('history'));
		if (history) setHistory(history);
	}, []);

	useEffect(() => {
		if (!history || !history.length) return;
		sessionStorage.setItem('history', JSON.stringify(history));
	}, [history]);

	return (
		<div className="relative grow shrink flex flex-col items-center justify-start overflow-hidden">
			<div className="flex flex-col size-full justify-start items-center gap-[--p] pb-60 overflow-x-hidden overflow-y-scroll">
				{history.map(({ role, parts }, index) =>
					parts.map(({ text: message }, i) => {
						return role === 'user' ? (
							<SenderMessage key={role + index + i}>
								{message}
							</SenderMessage>
						) : (
							<ReceiverMessage key={role + index + i}>
								{message}
							</ReceiverMessage>
						);
					})
				)}
			</div>
			<form
				onSubmit={e => e.preventDefault()}
				className="absolute flex flex-col h-fit max-h-40 w-full bottom-0 inset-x-auto bg-sidebar-accent !text-foreground rounded-md">
				<textarea
					className="relative grow shrink size-full px-[--p] pt-[--p] bg-transparent resize-none ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					placeholder="Chat with our AI ..."
					spellCheck={false}
					value={input}
					onChange={e => {
						setInput(e.target.value);
						setWriting(true);
						clearTimeout(timeout);
						setTimeoutState(setTimeout(() => setWriting(false), 2000));
					}}
					onKeyDown={async e => {
						if (e.key !== 'Enter' || e.shiftKey) return;
						if (!input || !input.trim().length) return;

						e.preventDefault();
						addMessage('user', input);

						await new Promise(r => setTimeout(r, 2500));

						const updatedWriting = await updatedState(setWriting);

						if (updatedWriting) return;
						const updatedMessages = await updatedState(setHistory);

						const response = await onSend(updatedMessages);
						addMessage('model', response);
					}}
				/>
				<div className="p-[--p]">
					<div className="flex flex-row items-center justify-end h-7">
						<Button
							type="submit"
							className="flex flex-row shrink-0 h-full text-background text-sm font-bold rounded-full aspect-square"
							onClick={async () => {
								if (!input || !input.trim().length) return;

								addMessage('user', input);

								await new Promise(r => setTimeout(r, 2500));

								const updatedWriting = await updatedState(
									setWriting
								);
								if (updatedWriting) return;
								const updatedMessages = await updatedState(
									setHistory
								);

								const response = await onSend(updatedMessages);
								addMessage('model', response);
							}}>
							<FiArrowUp className="size-5" />
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};
