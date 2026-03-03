'use client';

import Status_bar from './status_bar';
import Header from './header';
import Inner from './inner';
import Preview from './preview';
import type { Post } from '@/types/post';

export default ({
	page,
	className,
	...props
}: {
	page: 'preview' | 'inner';
	className?: string;
} & Post) => {
	return (
		<div className="relative size-full flex flex-col justify-start items-center [&>*]:px-[--p] z-50 overflow-scroll !whitespace-pre-wrap">
			<Status_bar />
			<Header />
			{page === 'preview' ? <Preview {...props} /> : <Inner {...props} />}
		</div>
	);
};
