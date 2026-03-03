'use client';
import { useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';

import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

export const ImageLoader = ({
	image: cdlImage,
	onFileChange,
	...props
}: React.ComponentProps<'div'> & {
	image: { display_name: string; public_id: string };
	onFileChange: (file: File) => void;
}) => {
	const fileInput = useRef<HTMLInputElement>(null);

	const [image, setImage] = useState<{ display_name: string; public_id: string } | null>(
		cdlImage
	);
	const [preview, setPreview] = useState<string | null>(null); // Stato per l'anteprima

	const handleFileChange = () => {
		const file = fileInput.current?.files?.[0];

		if (!file) return;
		// Controlla che il file sia un'immagine supportata
		const validFormats = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
		if (!validFormats.includes(file.type)) {
			alert('Formato file non supportato. Usa WebP, PNG, JPEG o JPG.');
			setPreview(null);

			return;
		}

		// Crea un'anteprima temporanea
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
				{!!preview ? (
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
				) : image?.public_id ? (
					<>
						<CldImage
							className="object-cover rounded-lg"
							fill
							src={image.public_id}
							alt={image.display_name}
						/>
						<Button
							className="z-10 absolute top-0 right-0 rounded-tl-none rounded-br-none rounded-bl-lg shadow-[0_0_7px_3px_#00000024]  bg-foreground/35 backdrop-blur-lg p-1 aspect-square"
							onClick={() => setImage(null)}>
							X
						</Button>
					</>
				) : (
					<Button
						className="size-full border-foreground/25 border-dashed border-2 bg-transparent hover:bg-transparent text-foreground"
						onClick={() => fileInput.current?.click()}>
						Carica l'immagine di copertina
					</Button>
				)}
			</div>
		</div>
	);
};
