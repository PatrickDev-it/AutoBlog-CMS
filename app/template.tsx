"use client";
import switchTheme from "@/utils/switch-theme";
import { PropsWithChildren, useEffect } from "react";

export default function Template({ children }: PropsWithChildren) {
	useEffect(() => {
		switchTheme(false);
	}, []);
	return children;
}
