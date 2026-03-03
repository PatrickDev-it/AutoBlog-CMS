'use client';

import { ImageLoader } from '@/components/imageLoader';
import { ServerProps } from '@/app/@inset/home/page';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default ({ api, images: initImages }: ServerProps) => {
	const { toast } = useToast();
	const [images, setImages] = useState<typeof initImages>(initImages ?? []);

	const handleChange = async (file: File, image: (typeof initImages)[0]) => {
		if (!file) return;

		const reader = new FileReader();
		reader.readAsDataURL(file); // Converte il file in Base64
		reader.onload = async () => {
			const base64 = reader.result as string;

			// Demo mode: Update local state only
			const demoImage = {
				...image,
				public_id: `/demo/section-${image.section}-${Date.now()}.jpg`,
				display_name: `${image.section}-image`,
			};
			// @ts-ignore
			setImages(p => p.map(i => (i.section === image.section ? demoImage : i)));

			toast({
				title: '🖼️ Home Image Updated',
				description: `${image.section.charAt(0).toUpperCase() + image.section.slice(1)} section image changed`,
				duration: 3000,
			});
		};
		reader.onerror = () => {
			alert('Error reading file!');
		};
	};

	return (
		<div className="relative flex flex-col justify-between items-start gap-[--p] size-full overflow-hidden">
			<h3 className="text-xl leading-none ml-1">Images of home sections</h3>

			<div className="grow shrink grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 w-full lg:max-h-[95%] place-content-between content-between max-lg:overflow-y-scroll gap-[--p] p-px">
				{
					images.map(image => (
						<div className="relative flex row-span-1 col-span-1 size-full rounded-lg overflow-hidden">
							<label className="z-30 absolute top-0 left-0 px-4 py-1.5 leading-none text-xs font-bold text-background bg-foreground rounded-br-lg">
								{image.section}
							</label>
							<ImageLoader onFileChange={file => handleChange(file, image)} className="size-full" image={image} />
						</div>
					))
					// Aggiorna l'immagine nel database
				}
			</div>
		</div>
	);
};
