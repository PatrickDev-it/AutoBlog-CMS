'use client';

import { useEffect, useState } from 'react';
import { SheetContent, SheetTrigger } from '@/ui/sheet';
import { BsChevronBarExpand } from 'react-icons/bs';
import { SidebarTrigger } from '@/ui/sidebar';

export default ({ containerSelector }: { containerSelector: string }) => {
	const [container, setContainer] = useState<Element>(null);

	useEffect(() => {
		setContainer(document.querySelector(containerSelector)!);
	}, []);

	if (!container) return null;

	return (
		<SheetContent
			side="left"
			container={container}
			className="z-50 absolute size-full !max-w-full !bg-none !bg-background">
			<div className="shrink-0 flex flex-row justify-between items-center w-full gap-[--p]">
				<div className="flex flex-row items-center h-full gap-x-[--p]">
					<div className="flex flex-row items-center h-full gap-x-[--p] max-lg:hidden">
						<SidebarTrigger className="justify-start h-full w-fit [&>svg]:text-zinc-400 [&>svg]:!size-5 [&>svg]:!p-0 " />
					</div>
				</div>
				<SheetTrigger>
					<BsChevronBarExpand className="size-5" />
				</SheetTrigger>
			</div>
		</SheetContent>
	);
};
