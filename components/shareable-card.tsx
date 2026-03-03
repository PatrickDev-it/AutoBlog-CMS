'use client';

import { Button } from '@/ui/button';
import { Share2 } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface ShareableCardProps {
	member: {
		name: string;
		role: string;
		avatar: string;
	};
}

export function ShareableCard({ member }: ShareableCardProps) {
	const [makeCard, setMakeCard] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	const generateCard = async () => {
		if (!cardRef.current) return;

		setMakeCard(true);
		await new Promise(resolve => setTimeout(resolve, 1000));
		const canvas = await html2canvas(cardRef.current);
		const dataUrl = canvas.toDataURL('image/webp');
		const link = document.createElement('a');
		link.href = dataUrl;
		link.download = `${member.name.replace(' ', '_')}_card.webp`;
		link.click();

		setMakeCard(false);
	};

	return (
		<>
			<Button variant="outline" size="sm" onClick={generateCard}>
				<Share2 className="h-4 w-4 mr-1" />
				Share Card
			</Button>
			<div
				className="z-[9999] fixed inset-0 flex justify-center items-center m-auto bg-black/35 backdrop-blur-sm w-screen  h-screen h-svh"
				style={{
					zIndex: 9999,
					display: makeCard ? 'flex' : 'none',
				}}>
				<div
					ref={cardRef}
					className="bg-white p-6 rounded-lg shadow-lg w-64">
					<div className="flex items-center space-x-4 mb-4">
						<Image
							src={member.avatar || '/placeholder.svg'}
							alt={member.name}
							width={64}
							height={64}
							className="rounded-full"
						/>
						<div>
							<h2 className="text-xl font-bold">
								{member.name}
							</h2>
							<p className="text-gray-600">
								{member.role}
							</p>
						</div>
					</div>
					<div className="text-center mb-4">
						<p className="text-sm text-gray-500">
							Proud member of
						</p>
						<div className="flex justify-center items-center space-x-2 mt-2">
							<Image
								src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/original-7fbbd2e655385d29c6c9f1902c10b284-YJOa6ZmbohzjVXSW5coU1whjjxURks.webp"
								alt="Acme Logo"
								width={24}
								height={24}
								className="rounded"
							/>
							<span className="text-lg font-semibold">
								Acme
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
