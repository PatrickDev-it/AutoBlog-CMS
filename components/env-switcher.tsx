'use client';

import * as React from 'react';

import Image from 'next/image';
import { Separator } from '@/ui/separator';
import { useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

const Env = ({ name, description }: { name: string; description?: string }) => {
	return (
		<SelectItem
			value={name.toLowerCase()}
			className=" cursor-pointer !rounded-none !p-2">
			<div className="flex flex-col w-full justify-center items-start gap-y-2 !px-2">
				<h2 className=" text-sm font-bold leading-none [font-family:var(--font-righteous)]">
					{name}
				</h2>
				<p className="line-clamp-1 text-left text-xs leading-none">
					{description}
				</p>
			</div>
		</SelectItem>
	);
};

export default ({
	envs,
}: {
	envs: {
		name: string;
		description?: string;
	}[];
}) => {
	envs = envs.filter(env => env.name.toLowerCase() !== 'users');
	const router = useRouter();
	const path = usePathname();
	const segments = path.split('/').filter(Boolean);

	return (
		<Select
			onValueChange={value => {
				router.replace(`/${value}`);
			}}
			value={segments[0]}>
			<SelectTrigger className="[&>span]:flex [&>span]:h-fit [&>span]:w-full z-50 shadow-none bg-transparent relative flex-row justify-start items-start size-full !px-p-[--sidebar-p] !py-0 gap-x-3.5 cursor-pointer !outline-none focus-within:outline-none !ring-0 !border-none  focus-visible:ring-0">
				<div className={'relative h-clamp-10 w-fit min-w-16'}>
					<Image
						className="dark:invert !w-auto my-auto"
						src="/logo.svg"
						alt="Acme Logo"
						fill
					/>
				</div>
				<SelectValue
					placeholder={
						<div className="flex flex-col justify-start items-start w-full h-full">
							<h2>Seleziona la pagina</h2>
							<p className="text-xs">Edita i contenuti</p>
						</div>
					}
				/>
			</SelectTrigger>
			<SelectContent
				side="bottom"
				align="start"
				sideOffset={6}
				className="items-center w-full text-neutral-500 rounded-md !p-0 !border-none !outline-none shadow-[0_0_0_1px_#ffffff24] light:shadow-[0_0_0_1px_#00000024]">
				{envs.map((env, i) => (
					<div
						key={i}
						className="relative group grid grid-rows-subgrid grid-cols-subgrid !p-0 w-full overflow-hidden">
						{i !== 0 && (
							<Separator className="absolute top-0 left-0 bg-neutral-800 w-full" />
						)}
						<Env {...env} />
					</div>
				))}
			</SelectContent>
		</Select>
	);
};
