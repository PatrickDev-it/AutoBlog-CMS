import { Skeleton } from '@/ui/skeleton';

export default function Loading() {
	return (
		<div className="relative flex flex-col justify-between items-start gap-[--p] size-full overflow-hidden">
			{/* Header */}
			<div className="w-full px-[--p] pt-[--p]">
				<Skeleton className="h-7 w-48" />
			</div>

			{/* Grid of image sections */}
			<div className="grow shrink grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 w-full lg:max-h-[95%] place-content-between content-between max-lg:overflow-y-scroll gap-[--p] p-[--p] px-[--p]">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="relative flex row-span-1 col-span-1 size-full rounded-lg overflow-hidden">
						{/* Label skeleton */}
						<Skeleton className="absolute top-0 left-0 h-6 w-20 rounded-br-lg" />

						{/* Image placeholder */}
						<Skeleton className="size-full rounded-lg" />
					</div>
				))}
			</div>
		</div>
	);
}
