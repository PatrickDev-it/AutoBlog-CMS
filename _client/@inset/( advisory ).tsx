'use client';

import { useState } from 'react';
import { ImageLoader } from '@/components/imageLoader';
import { Button } from '@/ui/button';
import { ServerProps } from '@/app/@inset/advisory/page';
import { useToast } from '@/hooks/use-toast';

export default ({ api, data }: ServerProps) => {
	const { toast } = useToast();
	const [about, setAbout] = useState(data.about);
	const [services, setServices] = useState(data.services);

	const [image, setImage] = useState<{ display_name: string; public_id: string }>(data.image ?? ({} as any));
	const [file, setFile] = useState<File | null>(null);
	const [timeout, startTimeout] = useState<NodeJS.Timeout | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file); // Converte il file in Base64
			reader.onload = async () => {
				const base64 = reader.result;
				if (typeof base64 !== 'string' || !base64) return;
				// Demo mode: Update local state only
				setImage({
					public_id: `demo-image-${Date.now()}`,
					display_name: 'Advisory Image',
				});

				toast({
					title: '🖼️ Advisory Image Updated',
					description: 'Cover image changed successfully',
					duration: 3000,
				});
			};
			reader.onerror = () => {
				alert('Error reading file!');
			};
		}

		// Demo mode: Local state update only - no API call
		console.log('Demo mode: Advisory updated locally', { about, services });

		toast({
			title: '✅ Advisory Panel Saved',
			description: 'About and services information updated',
			duration: 3000,
		});
	};

	return (
		<div className="relative flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-[repeat(12,minmax(2.5rem,auto))] gap-[--p] size-full overflow-scroll">
			<div className="grid grid-rows-[1.3rem_auto] grid-cols-1 -col-end-1 col-span-5 row-span-full w-full gap-[--p]">
				<div className="flex flex-row justify-between items-center row-span-1 size-full">
					<h3 className="text-xl leading-none ml-1">Immagine di copertina</h3>

					<Button onClick={handleSubmit} className=" text-xs w-fit h-full">
						Save
					</Button>
				</div>
				<ImageLoader className="flex row-span-1 w-full h-[70svh] lg:h-full" image={data.image} onFileChange={setFile} />
			</div>
			<div className="flex flex-col col-start-1 col-span-7 row-span-5 size-full gap-[--p]">
				<h3 className="text-xl leading-none ml-1">About</h3>
				<textarea
					spellCheck={false}
					value={about}
					onChange={e => setAbout(e.target.value)}
					className="flex size-full resize-none rounded-md border border-input bg-sidebar-accent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm"
				/>
			</div>

			<div className="flex flex-col col-start-1 col-span-7 row-span-7 size-full gap-[--p]">
				<h3 className="text-xl leading-none ml-1">Services Offered</h3>

				<textarea
					spellCheck={false}
					value={services}
					onChange={e => setServices(e.target.value)}
					className="flex size-full resize-none rounded-md bg-sidebar-accent border border-input px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm"
				/>
			</div>
		</div>
	);
};
