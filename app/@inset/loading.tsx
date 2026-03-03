import { Skeleton } from '@/ui/skeleton';

export default function Loading() {
	return (
		<main className="relative flex-1 flex flex-col size-full gap-[--p] transition-all duration-500 p-px lg:overflow-y-scroll overflow-x-hidden max-lg:overflow-hidden">
			<div className="flex flex-col size-full items-center justify-center gap-[--p] p-[--p]">
				{/* Large skeleton for main content area */}
				<Skeleton className="w-32 h-8 rounded" />
				<Skeleton className="w-3/4 h-64 rounded-lg" />
				<div className="flex gap-2 w-full max-w-md justify-center">
					<Skeleton className="flex-1 h-10 rounded" />
					<Skeleton className="flex-1 h-10 rounded" />
				</div>
			</div>
		</main>
	);
}
