'use client';

import { Button } from '@/ui/button';

export default ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
	return (
		<div className="mx-auto text-center text-[clamp(1rem,1.5vw,1.5rem)] font-raleway">
			<h2>Something went wrong!</h2>
			<Button
				onClick={
					// Attempt to recover by trying to re-render the segment
					() => reset()
				}>
				Try again
			</Button>
		</div>
	);
};
