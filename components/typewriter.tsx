import { useTypewriter } from '@/hooks/use-typewriter';

const Typewriter = ({ text, delay, speed, ...props }: { text: string; delay?: number; speed?: number } & any) => {
	const displayText = useTypewriter(text, delay, speed);

	return <p {...props}>{displayText}</p>;
};

export default Typewriter;
