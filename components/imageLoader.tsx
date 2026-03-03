'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';

import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

const DEMO_PLACEHOLDER =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="Arial" font-size="28">Demo Image</text></svg>';

const resolveImageSrc = (value?: string) => {
	if (!value) return DEMO_PLACEHOLDER;
	if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') || value.startsWith('data:')) return value;

	return DEMO_PLACEHOLDER;
};

export const ImageLoader = ({
	image: cdlImage,
	onFileChange,
	...props
}: React.ComponentProps<'div'> & {
	image: { display_name: string; public_id: string };
	onFileChange: (file: File) => void;
}) => {
	const fileInput = useRef<HTMLInputElement>(null);

	const [image, setImage] = useState<{ display_name: string; public_id: string } | null>(cdlImage);
	const [preview, setPreview] = useState<string | null>(null); // Preview state

	const handleFileChange = () => {
		const file = fileInput.current?.files?.[0];

		if (!file) return;
		// Validate the selected file format
		const validFormats = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
		if (!validFormats.includes(file.type)) {
			alert('Unsupported file format. Use WebP, PNG, JPEG, or JPG.');
			setPreview(null);

			return;
		}

		// Create a temporary preview
		setPreview(URL.createObjectURL(file));
		onFileChange(file);
		setImage(null);
	};

	return (
		<div {...props}>
			<Input
				type="file"
				name="file"
				value={''}
				ref={fileInput}
				onChange={handleFileChange}
				accept="image/webp, image/png, image/jpeg, image/jpg"
				className="hidden"
			/>
			<div className="relative flex justify-center items-center aspect-video size-full rounded-lg overflow-hidden">
				{!!preview ?
					<>
						<img
							src={preview}
							alt="Preview"
							className="absolute !size-full object-cover object-center rounded-lg inset-auto"
						/>
						<Button
							className="z-10 absolute top-0 right-0 rounded-tl-none rounded-br-none rounded-bl-lg shadow-[0_0_10px_2px_#00000024] bg-foreground/35 backdrop-blur-lg p-1 aspect-square"
							onClick={() => setPreview(null)}>
							X
						</Button>
					</>
				: image?.public_id ?
					<>
						<Image
							className="object-cover rounded-lg"
							fill
							unoptimized
							src={resolveImageSrc(image.public_id)}
							alt={image.display_name}
						/>
						<Button
							className="z-10 absolute top-0 right-0 rounded-tl-none rounded-br-none rounded-bl-lg shadow-[0_0_7px_3px_#00000024]  bg-foreground/35 backdrop-blur-lg p-1 aspect-square"
							onClick={() => setImage(null)}>
							X
						</Button>
					</>
				:	<Button
						className="size-full border-foreground/25 border-dashed border-2 bg-transparent hover:bg-transparent text-foreground"
						onClick={() => fileInput.current?.click()}>
						Upload cover image
					</Button>
				}
			</div>
		</div>
	);
};
