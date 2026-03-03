import { useTypewriter } from '@/hooks/use-typewriter';
import Image from 'next/image';
import Markdown from 'react-markdown';

export const SenderMessage = ({ children }: { children: string }) => {
	return (
		<Markdown className="self-end ml-auto size-fit max-w-[75%] bg-foreground rounded-md px-[--p] py-1.5 text-background">
			{children}
		</Markdown>
	);
};

export const ReceiverMessage = ({ children }: { children: string }) => {
	const text = useTypewriter(children, 0, 5);
	return (
		<div className="relative flex flex-row items-start justify-start size-fit max-w-[75%] gap-[--p] self-start mr-auto">
			<div className="relative flex justify-center items-center size-6 rounded-full">
				<Image
					src="/ai.svg"
					alt="ai"
					fill
					className="drop-shadow-[0_0_3px_hsl(var(--foreground)/0.5)] p-0.5"
				/>
			</div>

			<Markdown
				components={{
					ul: ({ node, ...props }) => (
						<ul className="list-disc ml-[--p] my-2" {...props} />
					),
					li: ({ node, ...props }) => <li className="ml-[--p]" {...props} />,
				}}
				className="self-start mr-auto size-fit bg-transparent text-foreground [&_*]:!select-text">
				{text}
			</Markdown>
		</div>
	);
};
