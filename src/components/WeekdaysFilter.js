import dayjs from 'dayjs';
import React, { useContext, useRef, useState } from 'react';
import {
	classNames,
	firstDayOfWeek,
	getDateAsString,
	getNextSetOfDays,
	startDate
} from '../utils';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import Input from './Input';

const dtFormat = new Intl.DateTimeFormat('en-US', {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	weekday: 'short'
});
export default function WeekdayFilter() {
	const [state, dispatch] = useContext(PrayerTimesContext);
	const formEl = useRef();
	function handleChangeDate(e) {
		const { value } = e.target;
		const date = dayjs(value).toDate();
		var day = date.getUTCDay();
		if ([6].includes(day)) {
			e.target.setCustomValidity('Saturdays are not available.');
			if (formEl.current) {
				formEl.current.reportValidity();
			}
			return;
		} else {
			e.target.setCustomValidity('');
		}
		const newStartOfWeek = firstDayOfWeek(date);
		const currentStartOfWeek = firstDayOfWeek(state.date);
		if (!dayjs(currentStartOfWeek).isSame(dayjs(newStartOfWeek))) {
			const newWeek = getNextSetOfDays(newStartOfWeek, 6);
			dispatch({ type: 'SET_WEEK', payload: newWeek });
		}
		dispatch({ type: 'SET_DATE', payload: date });
	}

	function isSameDate(date1, date2) {
		date1 = getDateAsString(date1);
		date2 = getDateAsString(date2);
		const value = date1 === date2;
		return value;
	}
	return (
		<form ref={formEl} className="flex flex-wrap flex-row-reverse">
			<Input
				onChange={handleChangeDate}
				id="date"
				className="ml-auto"
				name="date"
				type="date"
				value={getDateAsString(state.date)}
				min={getDateAsString(startDate)}
			/>
			<div className="lg:flex grid gap-2 grid-cols-3 items-start my-3 justify-between">
				{state.week.map((weekDate) => (
					<button
						type="button"
						className={classNames(
							' py-2 mx-2 px-1 font-sans text-bold rounded-full text-white text-sm w-28',
							isSameDate(state.date, weekDate)
								? 'bg-darkBlue text-bold'
								: 'bg-normalBlue'
						)}
						onClick={() => dispatch({ type: 'SET_DATE', payload: weekDate })}>
						{isSameDate(startDate, weekDate)
							? 'Today'
							: dtFormat.format(weekDate)}
					</button>
				))}
			</div>
		</form>
	);
}
