import { useTypewriter } from '@/hooks/use-typewriter';
import Image from 'next/image';
import Markdown from 'react-markdown';

export const SenderMessage = ({ children }: { children: string }) => {
	return (
		<Markdown className="self-end ml-auto size-fit max-w-[75%] bg-foreground rounded-md px-[--p] py-1.5 text-background">{children}</Markdown>
	);
};

export const ReceiverMessage = ({ children }: { children: string }) => {
	const text = useTypewriter(children, 0, 2);
	const isTyping = text.length < children.length;

	return (
		<div className="relative flex flex-row items-start justify-start size-fit max-w-[75%] gap-[--p] self-start mr-auto">
			<div className="relative flex justify-center items-center size-6 rounded-full shrink-0">
				<Image src="/ai.svg" alt="ai" fill className="drop-shadow-[0_0_3px_hsl(var(--foreground)/0.5)] p-0.5" />
			</div>

			<div className="flex flex-col gap-2 w-full">
				<Markdown
					components={{
						ul: ({ node, ...props }) => <ul className="list-disc ml-[--p] my-2" {...props} />,
						li: ({ node, ...props }) => <li className="ml-[--p]" {...props} />,
					}}
					className="self-start mr-auto size-fit bg-transparent text-foreground [&_*]:!select-text">
					{text}
				</Markdown>
				{isTyping && (
					<div className="flex items-center gap-1 mt-1">
						<div className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-pulse"></div>
						<div className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-pulse"></div>
						<div className="w-1.5 h-1.5 bg-green-500/60 rounded-full animate-pulse"></div>
					</div>
				)}
			</div>
		</div>
	);
};
