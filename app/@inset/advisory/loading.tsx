import { Skeleton } from '@/ui/skeleton';

export default function Loading() {
	return (
		<div className="relative flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[repeat(12,minmax(2.5rem,auto))] gap-[--p] size-full overflow-scroll">
			{/* Left panel - Image */}
			<div className="grid grid-rows-[1.3rem_auto] grid-cols-1 -col-end-1 col-span-5 row-span-full w-full gap-[--p]">
				{/* Header */}
				<div className="flex flex-row justify-between items-center row-span-1 size-full">
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-8 w-20" />
				</div>

				{/* Image preview */}
				<Skeleton className="w-full aspect-video rounded-lg" />

				{/* Upload area */}
				<div className="flex flex-col gap-[--p]">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="w-full h-32 rounded-lg" />
				</div>
			</div>

			{/* Right panel - Content */}
			<div className="flex flex-col col-span-7 row-span-full w-full gap-[--p]">
				{/* About section */}
				<div className="flex flex-col gap-2">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="w-full h-24" />
				</div>

				{/* Services section */}
				<div className="flex flex-col gap-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="w-full h-32" />
				</div>

				{/* Submit button */}
				<Skeleton className="h-10 w-28 mt-auto" />
			</div>
		</div>
	);
}
