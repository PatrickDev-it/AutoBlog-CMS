import Typewriter from '@/components/typewriter';
import { BsCalendar2WeekFill } from 'react-icons/bs';

export default () => {
	const date = new Date(Date.now()).toDateString().split(' ').slice(0, -1).join(' ');

	return (
		<div className="flex flex-col items-start justify-between w-full gap-y-3 py-8">
			<div className="flex flex-row items-end gap-x-2">
				<Typewriter
					text="Workout"
					className="font-righteous text-3xl text-zinc-200 light:text-zinc-800 leading-none -mb-px"
				/>
			</div>
			<span className="flex flex-row items-center gap-x-2">
				<BsCalendar2WeekFill className="text-[#84f342] size-4" />
				<Typewriter
					delay={550}
					text={date}
					className="text-base text-zinc-400 light:text-zinc-600 leading-none -mb-px text-end"
				/>
			</span>
		</div>
	);
};
