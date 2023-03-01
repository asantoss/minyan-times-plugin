import React, { useContext, useMemo } from 'react';
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
import { FormulaTypes, ViewTypes } from '../utils/enums';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import Accordion from './Accordion';
import Spinner from './Spinner';

export default function TimesCard({ type, children }) {
	const [state] = useContext(PrayerTimesContext);

	const geocodeQuery = useCityGeocodeData(state.city);

	let ZManQuery = useZmanimGPSData(
		state.date,
		geocodeQuery?.lat,
		geocodeQuery?.lng
	);
	const timesQuery = useFilteredTimesQuery({
		...state,
		type,
		zManTime: ZManQuery?.Time || null
	});
	const options = useMemo(() => {
		if (
			timesQuery.isLoading ||
			!Array.isArray(timesQuery.data) ||
			!ZManQuery?.Zman
		) {
			return [];
		}
		const { data } = timesQuery;
		const options = (data || []).reduce((acc, timeElement) => {
			let currentTime = '';
			timeElement.url = `/mtp_location/${timeElement?.locationSlug}`;
			if (timeElement.isCustom === '1') {
				let { formula, minutes } = timeElement;
				formula = Number(formula);
				minutes = Number(minutes);
				if (ZManQuery?.Zman) {
					const { SunriseDefault, SunsetDefault, MinchaStrict } =
						ZManQuery?.Zman;
					switch (formula) {
						case FormulaTypes['Before Sunset']:
							currentTime = formatZman(addMinutes(SunsetDefault, 0 - minutes));
							break;
						case FormulaTypes['After Sunset']:
							currentTime = formatZman(addMinutes(SunsetDefault, minutes));
							break;
						case FormulaTypes['Before Sunrise']:
							currentTime = formatZman(addMinutes(SunriseDefault, 0 - minutes));
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

			let menuLabel =
				state.sortBy === ViewTypes.TIME ? currentTime : timeElement.location;
			let optionLabel =
				state.sortBy === ViewTypes.TIME ? timeElement.location : currentTime;
			if (type === 'Daf Yomi' && timeElement.teacher) {
				menuLabel =
					state.sortBy === ViewTypes.TIME
						? currentTime
						: `${timeElement.location} (${timeElement.teacher})`;
				optionLabel =
					state.sortBy === ViewTypes.TIME
						? `${timeElement.location} (${timeElement.teacher})`
						: currentTime;
			}
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
	}, [state.sortBy, timesQuery, ZManQuery]);
	return (
		<div
			className={classNames(
				'w-full ',
				'md:relative mb-2  md:min-h-full flex font-extrabold  text-darkBlue flex-col text-center  md:mx-2 md:rounded-xl bg-lightBlue p-2'
			)}>
			<div>
				<Spinner isLoading={timesQuery.isLoading} />
				{children}
				{!timesQuery.isLoading &&
					timesQuery.data &&
					Object.keys(options).map((j) => {
						let title = j;
						if (state.sortBy === ViewTypes.TIME) {
							const isEveryCalculated = options[j].every(
								(e) => e?.isCustom === '1'
							);
							if (isEveryCalculated) {
								title = (
									<span className="inline-flex  justify-between w-full">
										{title}{' '}
										<span class="bg-yellow-100 self-center text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
											Approximate
										</span>
									</span>
								);
							}
						} else {
							options[j].forEach((option) => {
								if (option.isCustom === '1') {
									option.label = (
										<span className="inline-flex items-center  justify-between w-full">
											{option.label}{' '}
											<span class="bg-yellow-100 self-center text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
												Approximate
											</span>
										</span>
									);
								}
							});
						}
						return <Accordion title={title} options={options[j]} />;
					})}
			</div>
		</div>
	);
}
