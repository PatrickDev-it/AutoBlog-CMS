import { cn } from '@/utils/shadcn';
import { Separator } from '@/ui/separator';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/ui/context-menu';

import useLongPress from '@/hooks/use-longPress';

import { useRef, type PropsWithChildren } from 'react';

export default function Context({
	actions,
	children,
}: PropsWithChildren & { actions: React.ComponentPropsWithoutRef<typeof ContextMenuItem>[] }) {
	const trigger = useRef<HTMLSpanElement>(null);

	const onLongPress = () => {
		if (!trigger.current) return;

		const rect = trigger.current.getBoundingClientRect();

		trigger.current.dispatchEvent(
			new MouseEvent('contextmenu', {
				bubbles: true,
				clientX: rect.left, // Centro dell'elemento
				clientY: rect.top, // Centro dell'elemento
			})
		);
	};

	const longPressEvent = useLongPress(onLongPress, {
		shouldPreventDefault: false,
		delay: 300,
	});

	return (
		<ContextMenu>
			<ContextMenuTrigger ref={trigger} {...longPressEvent}>
				{children}
			</ContextMenuTrigger>
			<ContextMenuContent className='w-full p-0 [&>[role="menuitem"]]:px-3 max-lg:-translate-y-[115%] '>
				<ContextMenuItem {...actions[0]} className="" />
				{actions.slice(1).map(({ className, ...props }, i) => (
					<>
						<Separator key={'separator--' + i} />
						<ContextMenuItem
							key={i}
							className={cn(
								'text-sidebar-foreground/50 hover:bg-accent hover:text-accent-foreground',
								className
							)}
							{...props}
						/>
					</>
				))}
			</ContextMenuContent>
		</ContextMenu>
	);
}
