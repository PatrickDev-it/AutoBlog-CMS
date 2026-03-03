"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/utils/shadcn";
import { Button, ButtonProps } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

export function DatePicker({
	onSelect,
	defaultDate,
	className,
	placeholder,
	...props
}: ButtonProps & {
	onSelect: (date: Date) => void;
	defaultDate?: string | Date;
	placeholder?: string;
}) {
	const [date, setDate] = React.useState<Date>(
		defaultDate instanceof Date
			? defaultDate
			: defaultDate && defaultDate?.trim().length
			? new Date(defaultDate)
			: null
	);

	const select = (date: Date) => {
		setDate(date);
		if (onSelect) onSelect(date);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-[240px] justify-start text-left font-normal pt-[calc(var(--p)*1.5)] ",
						!date && "text-muted-foreground",
						className
					)}
					{...props}
				>
					<CalendarIcon />
					{!date || isNaN(date?.getTime()) ? (
						<span>{placeholder ?? "Pick a date"}</span>
					) : (
						format(date, "PPP")
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar mode="single" selected={date} onSelect={select} initialFocus />
			</PopoverContent>
		</Popover>
	);
}
