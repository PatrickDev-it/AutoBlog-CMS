'use client';

import { cn } from '@/utils/shadcn';

import { MdDelete } from 'react-icons/md';
import { RiEdit2Fill } from 'react-icons/ri';
import { BiSolidSave } from 'react-icons/bi';

import { Checkbox } from '@/ui/checkbox';
import { DetailedHTMLProps, HtmlHTMLAttributes, useEffect, useState } from 'react';

import Copy from '@/components/Copy';
import { Button } from '@/ui/button';
import { Separator } from '@/ui/separator';

import type { CheckedState } from '@radix-ui/react-checkbox';
import type { ServerProps } from '@/app/@inset/users/page';
import { Input } from '@/ui/input';

export { Sidebar } from './( users )';

export const Main = ({ api, users }: ServerProps) => {
	const [checkAll, setCheckAll] = useState<CheckedState>(false);

	return (
		<div className="flex flex-col w-full h-full ">
			<div className="relative flex flex-col w-full h-8 shrink-0 items-center">
				<label
					key="all"
					htmlFor="all"
					className="flex flex-row items-start w-full gap-[--p]">
					<Checkbox
						id="all"
						onCheckedChange={check => setCheckAll(check)}
					/>
					<span className="leading-5 text-foreground/50 text-sm">
						Username
					</span>
				</label>

				<Separator className="absolute w-full bottom-0" />
			</div>

			<div className="grid grow grid-cols-12 col-span-full -row-end-1 size-full items-start gap-[--p]">
				{users.map(user => (
					<User
						key={user.id}
						user={user}
						checkAll={checkAll}
						className="col-span-full row-span-1 h-12"
					/>
				))}
			</div>
		</div>
	);
};

const User = ({
	user: _user,
	checkAll,
	className,
	...props
}: {
	user: ServerProps['users'][0];
	checkAll: CheckedState;
} & Partial<DetailedHTMLProps<HtmlHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>>) => {
	const [user, setUser] = useState<ServerProps['users'][0]>(_user);
	const [edit, setEdit] = useState(false);
	const [checked, setChecked] = useState<CheckedState>(false);

	useEffect(() => {
		setChecked(checkAll);
	}, [checkAll]);

	return (
		<label
			key={user.id}
			htmlFor={user.id}
			className={cn(
				'relative grid grid-cols-subgrid col-span-12 row-span-1 h-10 items-center gap-[--p] cursor-pointer [&>span]:flex [&>span]:flex-row [&>span]:items-center [&>span]:gap-[--p]',
				className
			)}
			{...props}>
			<span className="col-span-2 leading-none">
				<Checkbox
					id={user.id}
					checked={checked}
					onCheckedChange={check => setChecked(check)}
				/>

				<input
					className="!px-0 p-1 !m-0 text-base cursor-default bg-transparent rounded-md ring-offset-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none ring-0 ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
					type="text"
					value={user.username}
					readOnly={!edit}
					style={{
						backgroundColor: edit
							? 'hsl(var(--background))'
							: 'transparent',
					}}
					onChange={e =>
						setUser(p => ({ ...p, username: e.target.value }))
					}
				/>
			</span>
			<span className=" col-span-3">
				{user.email}
				<Copy text={user.email} className="h-1/2 p-0.5" />
			</span>
			<span className="col-span-6 line-clamp-1">
				{user.password}
				<Copy text={user.password} className="h-1/2 p-0.5" />
			</span>
			<div className="flex flex-row items-center justify-end col-span-1 size-full gap-x-[--p]">
				<Button
					onClick={() => setEdit(p => !p)}
					className="border-input border !bg-background rounded-full aspect-square h-2/3 p-0">
					<BiSolidSave className="text-foreground" />
				</Button>
				<Button
					onClick={() => setEdit(p => !p)}
					className="border-input border rounded-full aspect-square h-2/3 p-0">
					<RiEdit2Fill />
				</Button>

				<Button className="border-input border rounded-full aspect-square h-2/3 p-0 dark:bg-red-400 bg-red-600">
					<MdDelete />
				</Button>
			</div>
			<Separator className="absolute w-full bottom-0" />
		</label>
	);
};
