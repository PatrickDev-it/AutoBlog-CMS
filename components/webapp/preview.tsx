import Image from 'next/image';
import { useCallback } from 'react';

import type { Post } from '@/types/post';

const DEMO_PLACEHOLDER =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Arial" font-size="28">Demo Image</text></svg>';

const resolveImageSrc = (value?: string) => {
	if (!value) return DEMO_PLACEHOLDER;
	if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') || value.startsWith('data:')) return value;

	return DEMO_PLACEHOLDER;
};

export default ({ image, title, date, kind }: Omit<Post, 'image'> & { image: { public_id?: string; src?: string } }) => {
	console.log('date =>', date);
	const RenderImage = useCallback(
		({ public_id, src }: { public_id?: string; src?: string }) => (
			<Image
				src={resolveImageSrc(public_id ?? src)}
				fill
				unoptimized
				alt={title}
				className=" object-cover object-center rounded-md group-hover:scale-110 transition-all duration-200"
			/>
		),
		[image],
	);
	return (
		<div className="relative flex flex-col w-full gap-[--p] ">
			<div className="relative flex justify-center items-center w-full h-fit !aspect-video rounded-md shadow-[0_0_10px_1px_#00000035] overflow-hidden">
				{kind && (
					<label className="z-50 absolute top-0 left-0 text-[.7rem] font-light text-white bg-gray-500 px-1.5 py-1 rounded-tl-md rounded-br-md uppercase">
						{kind}
					</label>
				)}
				<RenderImage {...image} />
			</div>
			<div className="flex flex-col gap-1 !text-black animate-[fade-in_0.5s_ease-in-out_forwards] delay-75">
				<h1 className="font-extralight leading-5">{title}</h1>
				<p className="text-xs font-semibold tracking-wide text-black/65">
					{typeof date === 'object' ?
						<>
							{date &&
								date.from &&
								new Date(date.from).toLocaleString(undefined, {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}

							{date &&
								date.to &&
								' — ' +
									new Date(date.to).toLocaleString(undefined, {
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
						</>
					:	date &&
						new Date(date).toLocaleString(undefined, {
							month: 'long',
							day: 'numeric',
							year: 'numeric',
						})
					}
				</p>
			</div>
		</div>
	);
};
