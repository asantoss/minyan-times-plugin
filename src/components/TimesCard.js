import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { useContext, useMemo, useState } from 'react';
import {
	addMinutes,
	classNames,
	convertTime,
	formatTime,
	formatZman,
	getDateFromTimeString,
	useCityGeocodeData,
	useFilteredTimesQuery,
	useZmanimGPSData
} from '../utils';
import { FormulaTypes, jewishHolidays, ViewTypes } from '../utils/enums';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import Accordion from './Accordion';
import Spinner from './Spinner';
import SponsorLogo from './SponsorLogo';

export default function TimesCard({ type, children }) {
	const [state] = useContext(PrayerTimesContext);

	const timesQuery = useFilteredTimesQuery({ ...state, type });
	const geocodeQuery = useCityGeocodeData(state.city);

	let ZmanimQueryData = useZmanimGPSData(
		state.date,
		geocodeQuery?.lat,
		geocodeQuery?.lng
	);
	const options = useMemo(() => {
		if (
			timesQuery.isLoading ||
			!Array.isArray(timesQuery.data) ||
			!ZmanimQueryData?.Zman
		) {
			return [];
		}
		const { data } = timesQuery;
		const options = (data || [])
			.filter((e) => {
				const anyHolidays = jewishHolidays.findIndex((h) => e[h] === '1');
				if (anyHolidays > -1 && ZmanimQueryData?.Time) {
					return (
						e.type === type &&
						ZmanimQueryData?.Time[jewishHolidays[anyHolidays]]
					);
				}
				return e.type === type;
			})
			.reduce((acc, timeElement) => {
				let currentTime = '';
				timeElement.url = `/mtp_location/${timeElement?.locationSlug}`;
				if (timeElement.isCustom === '1') {
					let { formula, minutes } = timeElement;
					formula = Number(formula);
					minutes = Number(minutes);
					if (ZmanimQueryData?.Zman) {
						const { SunriseDefault, SunsetDefault, MinchaStrict } =
							ZmanimQueryData?.Zman;
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
				const menuLabel =
					state.sortBy === ViewTypes.TIME ? currentTime : timeElement.location;
				const optionLabel =
					state.sortBy === ViewTypes.TIME ? timeElement.location : currentTime;
				if (acc[menuLabel]) {
					acc[menuLabel] = [
						...acc[menuLabel],
						{ ...timeElement, label: optionLabel }
					];
				} else {
					acc[menuLabel] = [{ ...timeElement, label: optionLabel }];
				}
				return acc;
			}, {});
		return Object.fromEntries(
			Object.keys(options)
				.sort((a, b) => {
					if (state.sortBy === ViewTypes.TIME) {
						const targetA = getDateFromTimeString(a);
						const targetB = getDateFromTimeString(b);
						//Sorted by time
						return targetA.isSameOrAfter(targetB) ? 1 : -1;
					} else {
						return a - b;
					}
				})
				.map((e) => [e, options[e]])
		);
	}, [state.sortBy, timesQuery, ZmanimQueryData]);
	return (
		<div
			className={classNames(
				'w-full md:w-1/4',
				'md:relative mb-2 md:min-h-full flex font-extrabold  text-darkBlue flex-col  text-center mx-0 md:mx-2 md:rounded-xl bg-lightBlue p-2'
			)}>
			<div>
				<Spinner isLoading={timesQuery.isLoading} />
				{children}
				{!timesQuery.isLoading &&
					timesQuery.data &&
					Object.keys(options).map((j) => {
						let title = j;
						const isCalculated = options[j].every((e) => e?.isCustom === '1');
						if (isCalculated) {
							title = (
								<span className="inline-flex  justify-between w-full">
									{title}{' '}
									<span class="bg-yellow-100 self-center text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
										Approximate
									</span>
								</span>
							);
						}
						return <Accordion title={title} options={options[j]} />;
					})}
			</div>
		</div>
	);
}
