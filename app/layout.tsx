import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
	title: {
		default: 'AutoBlog CMS — Editorial control for AI-assisted teams',
		template: '%s | AutoBlog CMS',
	},
	description:
		'An authenticated editorial CMS with immutable revisions, role-based workflow and bounded AI assistance.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: '#090b0d',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en" data-scroll-behavior="smooth">
			<body>
				<a className="skip-link" href="#main-content">Skip to content</a>
				{children}
			</body>
		</html>
	);
}
