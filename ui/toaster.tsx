'use client';

import CircularProgress from '@/components/check-progress';
import Typewriter from '@/components/typewriter';
import { useToast } from '@/hooks/use-toast';
import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/ui/toast';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(function ({ id, title, description, action, ...props }) {
				return (
					<Toast key={id} {...props}>
						<div className="grid gap-1">
							{title && (
								<ToastTitle className="flex flex-row items-center justify-start gap-x-3">
									<div className="size-5">
										<CircularProgress />
									</div>
									<Typewriter
										text={title}
										speed={23}
									/>
								</ToastTitle>
							)}
							{description && (
								<ToastDescription>
									<Typewriter
										text={description}
										delay={585}
										speed={10}
									/>
								</ToastDescription>
							)}
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
