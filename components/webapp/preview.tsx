import { CldImage } from 'next-cloudinary';
import { useCallback } from 'react';

import type { Post } from '@/types/post';

export default ({
	image,
	title,
	date,
	kind,
}: Omit<Post, 'image'> & { image: { public_id?: string; src?: string } }) => {
	console.log('date =>', date);
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
		<div className="relative flex flex-col w-full gap-[--p] ">
			<div className="relative flex justify-center items-center w-full h-fit !aspect-video rounded-md shadow-[0_0_10px_1px_#00000035] overflow-hidden">
				{kind && (
					<label className="z-50 absolute top-0 left-0 text-[.7rem] font-light text-white bg-gray-500 px-1.5 py-1 rounded-tl-md rounded-br-md uppercase">
						{kind}
					</label>
				)}
				<Image {...image} />
			</div>
			<div className="flex flex-col gap-1 !text-black animate-[fade-in_0.5s_ease-in-out_forwards] delay-75">
				<h1 className="font-extralight leading-5">{title}</h1>
				<p className="text-xs font-semibold tracking-wide text-black/65">
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
		</div>
	);
};
