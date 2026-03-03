import { Skeleton } from '@/ui/skeleton';

export default function Loading() {
	return (
		<div className="relative flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[repeat(12,minmax(2.5rem,auto))] gap-[--p] size-full overflow-scroll">
			{/* Left panel - Image & metadata */}
			<div className="grid grid-rows-[1.3rem_auto] grid-cols-1 -col-end-1 col-span-5 row-span-full w-full gap-[--p]">
				{/* Header */}
				<div className="flex flex-row justify-between items-center row-span-1 size-full">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-8 w-20" />
				</div>

				{/* Image preview */}
				<Skeleton className="w-full aspect-video rounded-lg" />

				{/* Image upload area */}
				<div className="flex flex-col gap-[--p]">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="w-full h-32 rounded-lg" />
				</div>

				{/* Metadata fields */}
				<div className="flex flex-col gap-3">
					<div>
						<Skeleton className="h-4 w-20 mb-2" />
						<Skeleton className="w-full h-8" />
					</div>
					<div>
						<Skeleton className="h-4 w-20 mb-2" />
						<Skeleton className="w-full h-8" />
					</div>
				</div>
			</div>

			{/* Right panel - Content tabs */}
			<div className="flex flex-col col-span-7 row-span-full w-full gap-[--p]">
				{/* Tab buttons */}
				<div className="flex flex-row gap-2">
					<Skeleton className="h-8 w-24" />
					<Skeleton className="h-8 w-24" />
				</div>

				{/* Tab content - Editor area */}
				<div className="flex-1 flex flex-col gap-[--p] overflow-hidden">
					{/* Title field */}
					<div>
						<Skeleton className="h-4 w-16 mb-2" />
						<Skeleton className="w-full h-10" />
					</div>

					{/* Description field */}
					<div>
						<Skeleton className="h-4 w-24 mb-2" />
						<Skeleton className="w-full h-32" />
					</div>

					{/* Additional fields */}
					<div className="grid grid-cols-2 gap-[--p]">
						<div>
							<Skeleton className="h-4 w-16 mb-2" />
							<Skeleton className="w-full h-8" />
						</div>
						<div>
							<Skeleton className="h-4 w-16 mb-2" />
							<Skeleton className="w-full h-8" />
						</div>
					</div>

					{/* Rich text editor */}
					<div className="flex-1 min-h-[200px]">
						<Skeleton className="h-4 w-20 mb-2" />
						<Skeleton className="w-full h-full rounded-lg" />
					</div>
				</div>

				{/* Action buttons */}
				<div className="flex flex-row gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
				</div>
			</div>
		</div>
	);
}
