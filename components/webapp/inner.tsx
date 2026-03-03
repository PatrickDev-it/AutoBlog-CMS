import { useCallback } from 'react';

import { CldImage } from 'next-cloudinary';
import { Separator } from '@/ui/separator';

import type { Post } from '@/types/post';

export default ({
	image,
	title,
	date,
	kind,
	description,
}: Omit<Post, 'image'> & { image: { public_id?: string; src?: string } }) => {
	const Image = useCallback(
		({ public_id, src }: { public_id?: string; src?: string }) =>
			public_id ? (
				<CldImage
					src={public_id}
					fill
					alt={title}
					className=" object-cover object-center rounded-md group-hover:scale-110 transition-all duration-200"
				/>
			) : (
				<img
					src={src}
					alt={title}
					className=" object-cover object-center rounded-md group-hover:scale-110 transition-all duration-200"
				/>
			),
		[image]
	);
	return (
		<div className="relative flex flex-col w-full gap-[--p] !text-black">
			<div className="flex flex-col gap-1 !text-black animate-[fade-in_0.5s_ease-in-out_forwards] delay-75">
				{kind && (
					<label className="text-[.7rem] font-semibold text-gray-500 tracking-wide uppercase">
						{kind}
					</label>
				)}
				<h1 className="font-extralight leading-5">{title}</h1>
				<p className="text-[.7rem] font-semibold tracking-wide text-black/65">
					{typeof date === 'object' ? (
						<>
							{date &&
								date.from &&
								new Date(date.from).toLocaleString(
									undefined,
									{
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									}
								)}

							{date &&
								date.to &&
								' — ' +
									new Date(
										date.to
									).toLocaleString(
										undefined,
										{
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										}
									)}
						</>
					) : (
						date &&
						new Date(date).toLocaleString(undefined, {
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})
					)}
				</p>
			</div>
			<div className="relative flex justify-center items-center w-full h-fit !aspect-video rounded-md shadow-[0_0_10px_1px_#00000035] overflow-hidden">
				<Image {...image} />
			</div>
			<div className="flex flex-col  gap-[--p] mt-[--p]">
				<span className="leading-none">
					Description
					<Separator className="mt-[calc(var(--p)/2)]" />
				</span>
				<div className="flex flex-col gap-y-[calc(var(--p)/2)] tracking-tight leading-5 -mt-0.5 text-sm font-light">
					<p>{description}</p>
				</div>
			</div>
		</div>
	);
};
