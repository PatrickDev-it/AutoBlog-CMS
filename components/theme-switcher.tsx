'use client';
import { useState } from 'react';
import switchTheme from '@/utils/switch-theme';
import { Switch } from '@/ui/switch';
import { BsMoonStars } from 'react-icons/bs';
import { LucideSunMoon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export default function ThemeSwitcher() {
	const [theme, setTheme] = useTheme();
	const [checked, setChecked] = useState(theme === 'dark');
	return (
		<Switch
			className="w-10 h-5 !py-0.5 !px-px"
			checked={checked}
			onCheckedChange={c => {
				setChecked(c);
				setTheme(switchTheme(true));
			}}
			icon={checked ? <BsMoonStars size={8} /> : <LucideSunMoon size={8} />}
		/>
	);
}
