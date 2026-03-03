import { Skeleton } from '@/ui/skeleton';

export default function Loading() {
	return (
		<div className="relative flex flex-col size-full gap-[--p] overflow-y-scroll p-[--p]">
			{/* Header section */}
			<div className="flex flex-row items-center justify-between w-full shrink-0">
				<Skeleton className="h-7 w-40" />
				<Skeleton className="h-8 w-8 rounded-full" />
			</div>

			{/* Group skeletons */}
			<div className="flex flex-col gap-[--p]">
				{[...Array(3)].map((_, groupIdx) => (
					<div key={groupIdx} className="flex flex-col gap-2 border-b pb-4">
						{/* Group header */}
						<div className="flex flex-row items-center justify-between px-2">
							<Skeleton className="h-5 w-32" />
							<Skeleton className="h-6 w-6 rounded" />
						</div>

						{/* Subgroups */}
						<div className="flex flex-col gap-2 ml-4">
							{[...Array(2)].map((_, sgIdx) => (
								<div key={sgIdx} className="flex flex-col gap-1">
									{/* Subgroup header */}
									<div className="flex flex-row items-center justify-between px-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-5 w-5 rounded" />
									</div>

									{/* Posts */}
									<div className="flex flex-col gap-1 ml-3">
										{[...Array(2)].map((_, pIdx) => (
											<Skeleton key={pIdx} className="h-8 w-full rounded px-2" />
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
