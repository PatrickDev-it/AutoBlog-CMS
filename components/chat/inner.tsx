'use client';

import { useEffect, useState } from 'react';
import { SheetContent, SheetTrigger } from '@/ui/sheet';

import { SidebarTrigger } from '@/ui/sidebar';
import { IoMdChatbubbles } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

import Chat from '@/app/@inset/_components/chat';

import sendMessage from '@/actions/send-message';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/ui/select';
import { Separator } from '@/ui/separator';

export const InnerChatTrigger = ({ Icon }: { Icon?: any }) => (
	<SheetTrigger>{Icon ? Icon : <IoMdChatbubbles className="size-5" />}</SheetTrigger>
);

export default ({ containerSelector }: { containerSelector: string }) => {
	const [model, setModel] = useState<any>('gemini-1.5-flash-8b');
	const [container, setContainer] = useState<Element>(null);

	useEffect(() => {
		setContainer(document.querySelector(containerSelector)!);
	}, []);

	if (!container) return null;

	return (
		<SheetContent
			container={container}
			onInteractOutside={e => e.preventDefault()}
			className="z-50 absolute flex flex-col gap-[--p] p-[--p] size-full !max-w-full !bg-none !bg-inset overflow-hidden">
			<div className="shrink-0 flex flex-row justify-between items-start w-full gap-[--p]">
				<SidebarTrigger className="justify-start size-fit [&>svg]:text-zinc-400 [&>svg]:!size-5 [&>svg]:!p-0 " />
				<Select value={model} onValueChange={setModel}>
					<SelectTrigger className="size-fit !p-0 [&>span]:!text-base [&>span]:!font-righteous [&>span]:pr-4 [&>svg]:hidden h-full !border-none !ring-0 !ring-transparent !outline-none">
						<SelectValue placeholder="Select a model" />
						<IoIosArrowDown className="!block size-4 text-foreground/45" />
					</SelectTrigger>
					<SelectContent sideOffset={15}>
						<SelectGroup>
							<SelectLabel>Frequent use</SelectLabel>
							<SelectItem value="gemini-1.5-flash">
								Gemini 1.5 flash
							</SelectItem>
							<SelectItem value="gemini-1.5-flash-8b">
								Gemini 1.5 flash 8b
							</SelectItem>
						</SelectGroup>
						<Separator />
						<SelectGroup>
							<SelectLabel>High reasoning</SelectLabel>
							<SelectItem value="gemini-1.5-pro">
								Gemini 1.5 pro
							</SelectItem>
							<SelectItem value="gemini-2.0-flash">
								Gemini 2 flash
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<InnerChatTrigger Icon={<IoClose className="size-5" />} />
			</div>
			<Chat
				onSend={async history =>
					await sendMessage(
						model,
						history.slice(0, -1),
						history
							.slice(-1)[0]
							.parts.map(p => p.text)
							.join('\n')
					)
				}
			/>
		</SheetContent>
	);
};
