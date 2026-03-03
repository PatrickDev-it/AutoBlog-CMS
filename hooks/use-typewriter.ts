import { useEffect, useState } from 'react';

const typing = async ({ text, callback }: { text: string; callback: (i: number) => any }, { delay, speed }: { delay: number; speed: number }) => {
	await new Promise(r => setTimeout(r, delay));

	let i = 1;
	while (i < text.length) {
		await new Promise(r => setTimeout(r, speed));
		i++;
		callback(i);
	}
};

export const useTypewriter = (text: string, delay = 0, speed = 2) => {
	const [displayText, setDisplayText] = useState('');

	useEffect(() => {
		typing({ text, callback: i => setDisplayText(text.slice(0, i)) }, { delay, speed });
	}, [text, speed]);

	return displayText;
};
