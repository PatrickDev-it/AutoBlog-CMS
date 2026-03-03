'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator } from '@/ui/breadcrumb';
import { MdMapsHomeWork } from 'react-icons/md';

import Link from 'next/link';

export default () => {
	const path = usePathname();
	const segments = path.split('/').filter(Boolean);

	return (
		<Breadcrumb className="flex h-full w-fit shrink-0 items-center gap-2.5">
			<BreadcrumbList key={'list--0'} className="!gap-2.5 w-full">
				<BreadcrumbItem key={'home--0'}>
					<Link className="hover:text-zinc-200 capitalize" href={'/'}>
						<MdMapsHomeWork className="size-5" />
					</Link>
				</BreadcrumbItem>

				{segments.map((segment, i) => (
					<>
						<BreadcrumbSeparator key={'separator--' + segment + i} />

						<BreadcrumbItem
							key={segment + i}
							className="max-md:max-w-[25%]">
							<Link
								className="hover:text-zinc-200 capitalize line-clamp-1 "
								href={'/' + segments.slice(0, i + 1).join('/')}>
								{segment}
							</Link>
						</BreadcrumbItem>
					</>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);

	return;
};
