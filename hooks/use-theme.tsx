'use client';

import switchTheme from '@/utils/switch-theme';
import { createContext, useContext, useEffect, useState } from 'react';

import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';

type Theme = 'dark' | 'light';
type ThemeContext = [Theme, Dispatch<SetStateAction<Theme>>];

const themeContext = createContext<ThemeContext>(['dark', () => {}]);

export const ThemeProvider = ({
	children,
	defaultValue,
}: PropsWithChildren & { defaultValue?: Theme }) => {
	const [theme, setTheme] = useState<Theme>(defaultValue ?? 'dark');

	useEffect(() => {
		const resolvedTheme = switchTheme(false);
		setTheme(resolvedTheme);
	}, []);

	return <themeContext.Provider value={[theme, setTheme]}>{children}</themeContext.Provider>;
};

export const useTheme = () => {
	const context = useContext(themeContext);

	if (!context) {
		throw new Error('useTheme must be used within a SocketProvider.');
	}
	return context;
};
