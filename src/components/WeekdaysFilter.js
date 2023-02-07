import React, { useState } from 'react';
import { classNames, getNextSetOfDays, getWeekday, isSameDate } from '../utils';

const today = new Date();

if (today.getDay() === 6) {
	today.setDate(today.getDate() + 1);
	//Skip a date on Saturdays
}
const options = {
	weekday: 'short',
	year: 'numeric',
	month: 'long',
	day: 'numeric'
};

const dtFormat = new Intl.DateTimeFormat('en-US', {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	weekday: 'short'
});
export default function WeekdayFilter({ date, onChange }) {
	const [weekDates, setWeekDates] = useState(getNextSetOfDays(today, 6));
	return (
		<div className=" md:flex  grid gap-2 grid-cols-3 items-start my-3 justify-between">
			{weekDates.map((weekDate) => (
				<button
					className={classNames(
						' py-2 mx-2 px-1 font-sans text-bold rounded-full text-white text-sm w-28',
						isSameDate(date, weekDate)
							? 'bg-darkBlue text-bold'
							: 'bg-normalBlue'
					)}
					onClick={() => onChange(weekDate)}>
					{isSameDate(today, weekDate) ? 'Today' : dtFormat.format(weekDate)}
				</button>
			))}
		</div>
	);
}
