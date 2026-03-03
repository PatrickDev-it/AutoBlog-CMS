import '@/config/_export';

import './globals.css';
import '@/lib/cloudinary';

import { Toaster } from '@/ui/toaster';
import { SidebarProvider } from '@/ui/sidebar';
import { ThemeProvider } from '@/hooks/use-theme';

import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
	title: 'BT - Dashboard',
	description: 'Developed by PatrickDev',
	robots: { index: false, follow: false },
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#000',
};

export default function RootLayout({ sidebar, inset }: Layouts) {
	return (
		<html lang="en" className="dark">
			<ThemeProvider defaultValue="dark">
				<body className="antialiased">
					<div id="content">
						<div>
							<SidebarProvider className="p-0 bg-transparent size-full">
								{sidebar}
								{inset}
							</SidebarProvider>
						</div>
					</div>
					<Toaster />
				</body>
			</ThemeProvider>
		</html>
	);
}

export interface Layouts {
	inset: ReactNode;
	sidebar: ReactNode;
}
