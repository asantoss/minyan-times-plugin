import dayjs from 'dayjs';
import React, { useContext, useMemo } from 'react';
import {
	addMinutes,
	classNames,
	convertTime,
	formatTime,
	formatZman,
	getDateFromTimeString,
	getNextSetOfDays,
	startDate,
	useFilteredTimesQuery,
	useZmanimData
} from '../utils';
import { FormulaTypes } from '../utils/enums';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import Spinner from './Spinner';

export default function TimeElement({ day, type, list = false }) {
	const weekDates = getNextSetOfDays(startDate, 6);
	const targetDate = weekDates.find((e) => {
		const dateDay = dayjs(e).format('dddd');
		return dateDay === day;
	});
	const [state] = useContext(PrayerTimesContext);
	const ZmanimQuery = useZmanimData(targetDate, state.zipCode);
	const { data, isLoading } = useFilteredTimesQuery({
		day,
		postId: state.postId,
		type
	});
	const timeSlots = useMemo(() => {
		return (data ?? [])
			.map((timeElement) => {
				let currentTime = '';
				if (timeElement.isCustom === '1') {
					let { formula, minutes } = timeElement;
					formula = Number(formula);
					minutes = Number(minutes);
					if (ZmanimQuery?.Zman) {
						const { SunriseDefault, SunsetDefault, MinchaStrict } =
							ZmanimQuery?.Zman;
						switch (formula) {
							case FormulaTypes['Before Sunset']:
								currentTime = formatZman(
									addMinutes(SunsetDefault, 0 - minutes)
								);
								break;
							case FormulaTypes['After Sunset']:
								currentTime = formatZman(addMinutes(SunsetDefault, minutes));
								break;
							case FormulaTypes['Before Sunrise']:
								currentTime = formatZman(
									addMinutes(SunriseDefault, 0 - minutes)
								);
								break;
							case FormulaTypes['After Sunrise']:
								currentTime = formatZman(
									addMinutes(SunriseDefault, Number(minutes))
								);
								break;
							case FormulaTypes['Midday']:
								currentTime = formatZman(MinchaStrict);
								break;
							default:
								break;
						}
					} else {
						currentTime = formatTime(timeElement);
					}
				} else {
					currentTime = convertTime(timeElement.time);
				}
				timeElement.label = currentTime;

				return timeElement;
			})
			.sort((a, b) => {
				const targetA = getDateFromTimeString(a.label);
				const targetB = getDateFromTimeString(b.label);
				//Sorted by time
				return targetA.isSameOrAfter(targetB) ? 1 : -1;
			});
	}, [data, isLoading, ZmanimQuery]);

	if (isLoading) {
		return <Spinner />;
	}
	const listFormat = new Intl.ListFormat('en', {
		style: 'long',
		type: 'conjunction'
	});
	if (list) {
		return (
			<span className="text-xs">
				{listFormat.format(timeSlots.map((e) => e.label))}
			</span>
		);
	}
	return (
		<>
			{timeSlots.map((e, i, arr) => (
				<span
					className={classNames(
						'text-xs my-2',
						i !== arr.length - 1 && 'border-b-2'
					)}>
					{e.label}
				</span>
			))}
		</>
	);
}
