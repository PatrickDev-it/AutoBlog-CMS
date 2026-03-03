import { cn } from '@/utils/shadcn';
import { Button } from '@/ui/button';
import { CopyIcon } from '@radix-ui/react-icons';

export default ({ text, className }: { text: string; className?: string }) => {
	const handleClick = () => {
		navigator.clipboard.writeText(text);
	};

	return (
		<Button
			onClick={handleClick}
			className={cn(
				'group flex justify-center items-center bg-background aspect-square border-input border',
				className
			)}>
			<CopyIcon className="!size-4/5 p-0.5 text-foreground group-hover:text-background" />
		</Button>
	);
};
