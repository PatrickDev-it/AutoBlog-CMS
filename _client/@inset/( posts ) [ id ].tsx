'use client';

import { useRef, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';

import { DatePicker } from '@/components/data-picker';
import WebApp from '@/components/webapp/_export';
import Image from 'next/image';

import type { ServerProps } from '@/app/@inset/[section]/[id]/page';

import { useToast } from '@/hooks/use-toast';

export default ({ api, section, post: defaultPost }: ServerProps) => {
	const { toast } = useToast();

	const [post, _setPost] = useState(defaultPost);
	const [timeout, startTimeout] = useState<NodeJS.Timeout | null>(null);

	const [page, setPage] = useState('preview');
	const [file, setFile] = useState<File | null>(null);

	const setImage = (file: File) => {
		const reader = new FileReader();
		reader.readAsDataURL(file); // Converte il file in Base64
		reader.onload = async () => {
			const base64 = reader.result;
			if (typeof base64 !== 'string' || !base64) return;

			const image = await api.updateImage({
				_id: post._id,
				base64,
				public_id: post.image?.public_id,
				display_name: post.name.replace(/[^a-zA-Z0-9]/g, ' '),
			});

			await api.updatePost({
				...post,
				image: {
					public_id: image.public_id,
					display_name: image.display_name,
				},
			});

			await new Promise(r => setTimeout(r, 65));
			_setPost(await api.getPost());
		};
		reader.onerror = () => {
			alert('Error reading file!');
		};
		setFile(file);
	};

	const handleSubmit = async (updatedPost: typeof defaultPost = post) => {
		await api.updatePost(updatedPost);
		await new Promise(r => setTimeout(r, 65));
		_setPost(await api.getPost());
	};

	const setPost = async (callback: Parameters<typeof _setPost>[0]) => {
		clearTimeout(timeout);

		const updatedPost = await new Promise(r =>
			_setPost(prev => {
				const updated =
					typeof callback === 'function' ? callback(prev) : callback;

				r(updated);
				return updated;
			})
		);

		startTimeout(
			setTimeout(async () => {
				await handleSubmit(updatedPost as any);

				toast({
					title: 'Post autosaved!',
					duration: 10000,
				});
			}, 4000)
		);

		return updatedPost;
	};

	return (
		<div className="relative grow shrink flex flex-col md:grid grid-cols-12 grid-rows-10 gap-[--p] size-full overflow-hidden">
			<ImageLoader
				className="row-start-1 max-xl:col-span-full col-span-8 row-span-4 w-full max-md:aspect-video  md:size-full overflow-hidden"
				image={post.image}
				onFileChange={fileChange => {
					setImage(fileChange);
				}}
			/>

			<textarea
				className="resize-none !m-0 text-base col-start-1 max-xl:col-span-full col-span-8 row-span-1 md:size-full flex flex-col justify-start size-full rounded-md border border-input bg-sidebar-accent p-[calc(var(--p)/2)] ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
				placeholder="Title"
				value={post.title}
				onInput={e => {
					// @ts-ignore
					setPost(p => ({ ...p, title: e.target.value }));
				}}
				spellCheck={false}
			/>

			<textarea
				spellCheck={false}
				value={post.description}
				onChange={e => {
					setPost(p => ({ ...p, description: e.target.value }));
				}}
				placeholder="Description"
				className="flex col-start-1 max-xl:col-span-full col-span-8 row-span-5 md:size-full resize-none rounded-md border border-input bg-sidebar-accent px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
			/>
			{typeof post.date === 'object' ? (
				<>
					<div className="relative col-span-2 row-span-1 row-start-1 gap-[inherit]">
						<label className="absolute top-[calc(var(--p)/2)] left-[--p] opacity-65 text-xs">
							From
						</label>
						<DatePicker
							defaultDate={post.date.from}
							onSelect={date =>
								setPost(p => ({
									...p,
									date: {
										// @ts-ignore
										...p.date,
										from: date,
									},
								}))
							}
							className="col-span-2 size-full bg-sidebar-accent"
						/>
					</div>
					<div className="relative col-span-2 row-span-1  row-start-1 gap-[inherit]">
						<label className="absolute top-[calc(var(--p)/2)] left-[--p] opacity-65 text-xs">
							To
						</label>
						<DatePicker
							defaultDate={post.date.to}
							onSelect={date =>
								setPost(p => ({
									...p,
									date: {
										// @ts-ignore
										...p.date,
										to: date,
									},
								}))
							}
							className="col-span-2 size-full bg-sidebar-accent"
						/>
					</div>
				</>
			) : (
				<div className="relative  col-span-4 row-span-1 row-start-1 gap-[inherit]">
					<label className="absolute top-[calc(var(--p)/2)] left-[--p] opacity-65 text-xs">
						Publication Date
					</label>
					<DatePicker
						defaultDate={post.date}
						onSelect={date =>
							setPost(p => ({
								...p,
								date: date.toISOString(),
							}))
						}
						className="size-full bg-sidebar-accent"
						placeholder="Data di pubblicazione"
					/>
				</div>
			)}

			<Input
				className="bg-sidebar-accent col-span-2 max-xl:col-span-3 row-span-1 row-start-2 md:size-full [&>input]:cursor-text"
				placeholder="Kind"
				value={post.kind}
				spellCheck={false}
				onChange={e => setPost(p => ({ ...p, kind: e.target.value }))}
			/>
			<Input
				className="bg-sidebar-accent col-span-2 max-xl:col-span-3 row-span-1 row-start-2 md:size-full [&>input]:cursor-text"
				placeholder="State"
				value={post.state}
				spellCheck={false}
				onChange={e => setPost(p => ({ ...p, state: e.target.value }))}
			/>

			<Button
				className="hidden max-xl:flex col-span-2 row-span-1 row-start-2 md:size-full"
				onClick={() => handleSubmit()}>
				Submit
			</Button>
			<div className="max-xl:hidden z-10 relative flex flex-col items-center justify-end -row-end-1 row-span-8 -col-end-1 col-span-4 md:size-full rounded-xl overflow-hidden">
				<div className="absolute size-full flex flex-col items-center justify-start px-6 ">
					<div className="relative flex items-start justify-center size-fit min-h-[110%] max-2xl:w-11/12 !min-w-[15vw] 2xl:max-w-[65%] [mask-image:linear-gradient(to_bottom,#000_60%,transparent_95%)] transition-all duration-300 ">
						<div className="absolute inset-auto bg-[#f8f8f8] mt-1 h-[calc(100%-2rem)] w-[calc(100%-1rem)] rounded-[2rem] -z-[1] overflow-hidden transition-all duration-300">
							<WebApp
								{...{
									page,
									...post,
								}}
							/>
						</div>
						<Image
							className="!relative !h-auto min-h-[110%] !min-w-[15vw] !inset-auto z-30 object-top  transition-all duration-300"
							src="/iphone.png"
							alt="Fitmatiz.."
							objectFit="contain"
							priority
							fill
						/>
					</div>
				</div>
				<div className="z-30 flex flex-col justify-around items-center bg-background w-full h-1/4 rounded-xl p-[--p] border border-input">
					<div className="flex flex-row items-center justify-between w-4/5">
						<Button
							style={{
								opacity:
									page === 'preview'
										? 0.5
										: 1,
							}}
							className="w-1/3"
							onClick={() => setPage('preview')}>
							Preview
						</Button>
						<Button
							style={{
								opacity: page === 'inner' ? 0.5 : 1,
							}}
							className="w-1/3"
							onClick={() => setPage('inner')}>
							Inner
						</Button>
					</div>
					{/* @ts-ignore */}
					<Button className="w-4/5" onClick={handleSubmit}>
						Submit
					</Button>
				</div>
			</div>
		</div>
	);
};

const ImageLoader = ({
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
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null); // Stato per l'anteprima

	const handleFileChange = () => {
		const file = fileInput.current?.files?.[0];

		if (!file) return;
		// Controlla che il file sia un'immagine supportata
		const validFormats = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
		if (!validFormats.includes(file.type)) {
			alert('Formato file non supportato. Usa WebP, PNG, JPEG o JPG.');
			setPreview(null);
			setFile(null);
			return;
		}

		// Crea un'anteprima temporanea
		setPreview(URL.createObjectURL(file));
		setFile(file);
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
			<div className="relative flex justify-center items-center size-full rounded-lg overflow-hidden">
				<div className="absolute inset-auto aspect-video size-full">
					<div className="relative flex justify-center items-center size-full">
						{image ? (
							<>
								<CldImage
									className="object-cover"
									fill
									src={image.public_id}
									alt={image.display_name}
								/>
								<Button
									className="z-50 absolute top-2 right-2 shadow-[0_0_7px_3px_#00000024]"
									onClick={() =>
										setImage(null)
									}>
									X
								</Button>
							</>
						) : !!preview ? (
							<>
								<img
									src={preview}
									alt="Preview"
									className="absolute !size-full object-cover object-center rounded-lg inset-auto"
								/>
								<Button
									className="z-50 absolute top-2 right-2 shadow-[0_0_10px_2px_#00000024]"
									onClick={() => (
										setPreview(null),
										setFile(null)
									)}>
									X
								</Button>
							</>
						) : (
							<Button
								className="size-full border-dashed border-2 bg-transparent hover:bg-transparent text-foreground"
								onClick={() =>
									fileInput.current?.click()
								}>
								Carica l'immagine di copertina
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
