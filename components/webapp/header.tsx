"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import Link from "next/link";
import { BiStats } from "react-icons/bi";
import { CgGym } from "react-icons/cg";
import { IoPersonSharp } from "react-icons/io5";
import { LuSunMoon } from "react-icons/lu";
import { BsMoonStars } from "react-icons/bs";

import { usePathname } from "next/navigation";
import { Switch } from "@/ui/switch";
import switchTheme from "@/utils/switch-theme";
import { TbMenuDeep } from "react-icons/tb";

export default () => {
	const tabs = [
		{ href: "/stats", label: "Stats", icon: { Element: BiStats, color: "#F34284" } },
		{ href: "/workout", label: "Workout", icon: { Element: CgGym, color: "#84f342" } },
		{ href: "/profile", label: "Profile", icon: { Element: IoPersonSharp, color: "#4a7ef2" } },
	];

	const pathname = usePathname();
	const [active, setActive] = useState(1);

	const [theme, setTheme] = useState();
	const [checked, setChecked] = useState(theme === "dark");

	useEffect(() => {
		const resolvedTheme = switchTheme(false);
		setTheme(resolvedTheme);
		setChecked(resolvedTheme === "dark");
	}, []);

	return (
		<>
			<div className="flex flex-row items-start justify-between w-full h-14 !pb-2.5 light:bg-zinc-100 shadow-[inset_0_-1px_#ffffff24] light:shadow-[inset_0_-1px_#00000024]">
				<div className="relative h-10 w-fit min-w-16 -ml-1">
					<Image className="!w-auto my-auto" src={"/logo.svg"} alt="logo" fill />
				</div>
				<TbMenuDeep className="text-black w-8 h-8 cursor-pointer" />
			</div>

			<div
				className={
					"z-50 absolute bottom-4 mx-auto flex flex-row justify-between h-9 w-fit !px-1 !py-0.5 gap-x-1 bg-[#1d1d1f] light:bg-zinc-100 shadow-[0_0_5px_1px_#ffffff36] light:shadow-[0_0_5px_1px_#00000024] rounded-full"
				}
			></div>
		</>
	);
};
