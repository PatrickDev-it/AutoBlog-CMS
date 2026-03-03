import { Separator } from '@/ui/separator';
import BreadcrumbNav from '@/components/BreadCrumbNav';
import { SidebarInset, SidebarRail, SidebarTrigger } from '@/ui/sidebar';

import type { PropsWithChildren } from 'react';
import ThemeSwitcher from '@/components/theme-switcher';
import InnerChat, { InnerChatTrigger } from '@/components/chat/inner';
import { Sheet } from '@/ui/sheet';

export default function Layout({ children }: PropsWithChildren) {
	return (
		<SidebarInset className="!max-h-full md:!max-h-svh shrink-0 pt-[--external-p]">
			<div className="shrink-0 flex flex-row items-center justify-between h-fit px-[--p] pb-[--p] pt-[--sidebar-p] ">
				<div
					id="header"
					className='relative flex items-center h-clamp-10 md:[&:is(.group[data-collapsible="offcanvas"]_+_*_#header)]:h-4 w-36 aspect-[8/1] transition-[height] ease-linear duration-[2500ms]'>
					{/* <Toolbar /> */}
				</div>
				<ThemeSwitcher />
			</div>
			<div
				id="chatContainer"
				className="relative shrink-1 flex flex-col bg-inset dark:shadow-[0_0_10px_-1px_#ffffff55] shadow-[0_0_10px_-1px_#00000055] h-full max-lg:rounded-t-3xl rounded-tl-lg gap-[--p] p-[--p] overflow-hidden">
				<SidebarRail className="!bottom-0 !top-auto !-left-px !right-auto h-[calc(100%-.5rem)] w-[--p] cursor-e-resize" />

				<Sheet modal={false}>
					<div className="shrink-0 flex flex-row justify-between items-center w-full gap-[--p]">
						<div className="flex flex-row items-center h-full gap-x-[--p]">
							<div className="flex flex-row items-center h-full gap-x-[--p] max-lg:hidden">
								<SidebarTrigger className="justify-start h-full w-fit [&>svg]:text-zinc-400 [&>svg]:!size-5 [&>svg]:!p-0 " />
								<Separator orientation="vertical" className="h-3/5 bg-white/45" />
							</div>

							<BreadcrumbNav />
						</div>
						<InnerChatTrigger />
					</div>
					<InnerChat containerSelector="#chatContainer" />
					<main className="relative flex-1 flex flex-col size-full gap-[--p] transition-all duration-500 p-px lg:overflow-y-scroll overflow-x-hidden max-lg:overflow-hidden ">
						{children}
					</main>
				</Sheet>
			</div>
		</SidebarInset>
	);
}
