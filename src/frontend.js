import { QueryClientProvider } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Switch from './components/Switch';
import {
	addMinutes,
	classNames,
	convertTime,
	formatZman,
	getNextSetOfDays,
	getWeekday,
	isSameDate,
	queryClient,
	useFilteredTimesQuery,
	useLocationQuery,
	useZmanimApi
} from './utils';
import {
	days,
	FilterTypes,
	formulaLabels,
	FormulaTypes,
	NusachOptions,
	PrayerTypes
} from './utils/enums';
import Spinner from './components/Spinner';
import Menu from './components/Menu';
import Map from './components/Map';
import FilterDropdown from './components/FilterDropdown';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Modal from './components/Modal';
import ZManimDisplay from './components/ZManimDisplay';

document.addEventListener(
	'DOMContentLoaded',
	() => {
		const root = document.getElementById('mtp-plugin');
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<div className="mtp-block">
					<QueryClientProvider client={queryClient}>
						<ReactQueryDevtools />
						<MinyanTimes {...data} />
					</QueryClientProvider>
				</div>,
				root
			);
		}
	},
	{ once: true }
);
const today = new Date();

if (today.getDay() === 6) {
	today.setDate(today.getDate() + 1);
	//Skip a date on Saturdays
}
const weekDates = getNextSetOfDays(today, 6);

function MinyanTimes(props) {
	const { googleKey } = props;
	const [selectedTimeOption, setSelectedTimeOption] = useState(null);
	const [city, setCity] = useState('Baltimore');
	const [nusach, setNusach] = useState('Asheknaz');
	const [sortBy, setSortBy] = useState(FilterTypes.TIME);
	const [date, setDate] = useState(today);
	const [openSection, setOpenSection] = useState('');
	const timesQuery = useFilteredTimesQuery({
		city,
		nusach,
		day: getWeekday(date),
		sortBy
	});
	const locationsQuery = useLocationQuery();
	const cityOptions = useMemo(() => {
		if (locationsQuery.isLoading) {
			return [];
		}
		return locationsQuery.data?.reduce(
			(acc, e) => ({
				...acc,
				[e.city]: e
			}),
			{}
		);
	}, [locationsQuery]);
	const postalCode = useMemo(() => {
		if (cityOptions[city]) {
			return cityOptions[city].zipCode;
		}
		return '';
	}, [city, cityOptions]);

	const zManimQueries = useZmanimApi({ dates: weekDates, postalCode });

	const ZmanimQueryData = useMemo(() => {
		const output = {};
		for (const query of zManimQueries) {
			const { status } = query;
			if (status === 'success') {
				const { data } = query;
				if (Object.keys(data)?.length > 0) {
					const {
						Time: { Weekday },
						Place: { PostalCode }
					} = data;
					const queryMatch =
						Weekday === getWeekday(date) && PostalCode === postalCode;
					if (queryMatch) {
						return query;
					}
				}
			}
		}

		return output;
	}, [zManimQueries, date, postalCode]);

	const sponsors = useMemo(() => {
		return PrayerTypes.reduce((a, e) => {
			a[e] = props[e];
			return a;
		}, {});
	}, [timesQuery]);

	const formalizedData = useMemo(() => {
		const output = {
			Shacharis: [],
			Mincha: [],
			Maariv: []
		};
		if (
			timesQuery.isLoading ||
			locationsQuery.isLoading ||
			!Array.isArray(timesQuery.data) ||
			Object.keys(ZmanimQueryData).length < 1
		) {
			return output;
		}
		const { data } = timesQuery;
		if (selectedTimeOption != null) {
			const isSelectedIdx = data.findIndex(
				(e) => e.locationId === selectedTimeOption.locationId
			);
			if (isSelectedIdx === -1) {
				setSelectedTimeOption(null);
			}
		}
		return PrayerTypes.reduce((acc, sect) => {
			const options = (data || [])
				.filter((e) => {
					return e.type && e.type.includes(sect);
				})
				.reduce((acc, timeElement) => {
					let currentTime = '';

					timeElement.onClick = () => {
						setSelectedTimeOption(timeElement);
					};
					if (timeElement.isCustom === '1') {
						let { formula, minutes } = timeElement;
						formula = Number(formula);
						minutes = Number(minutes);
						if (ZmanimQueryData.data?.Zman) {
							const { SunriseDefault, SunsetDefault } =
								ZmanimQueryData.data.Zman;
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
								default:
									break;
							}
						} else {
							currentTime = `Neitz (${minutes}m ${formulaLabels[formula]})`;
						}
					} else {
						currentTime = convertTime(timeElement.time);
					}
					const menuLabel =
						sortBy === FilterTypes.TIME ? currentTime : timeElement.location;
					const optionLabel =
						sortBy === FilterTypes.TIME ? timeElement.location : currentTime;
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

			acc[sect] = Object.fromEntries(
				Object.keys(options)
					.sort((a, b) => a.label - b.label)
					.map((e) => [e, options[e]])
			);
			return acc;
		}, output);
	}, [sortBy, timesQuery, ZmanimQueryData]);

	const pinLocations = useMemo(() => {
		const output = [];
		if (selectedTimeOption) {
			const pin = {
				lat: Number(selectedTimeOption.lat),
				lng: Number(selectedTimeOption.lng),
				text: `${selectedTimeOption.address}, ${selectedTimeOption.state}, ${selectedTimeOption.city}, ${selectedTimeOption.zipCode}`
			};
			output.push(pin);
		}
		return output;
	}, [selectedTimeOption]);

	function handleChangeDay(date) {
		setDate(date);
	}
	return (
		<div className="flex-col font-sans flex w-full">
			<Modal
				className="my-2 mx-auto"
				state={pinLocations.length > 0}
				onClose={() => setSelectedTimeOption(null)}
				button={() => {}}>
				{googleKey && pinLocations.length > 0 && (
					<Map apiKey={googleKey} locations={pinLocations} />
				)}
			</Modal>
			<ZManimDisplay Zmanim={ZmanimQueryData.data} />
			<div className=" md:flex  grid gap-2 grid-cols-3 items-start my-3 justify-between">
				{weekDates.map((weekDate) => (
					<button
						className={classNames(
							' py-2 mx-2 px-1 font-sans text-bold rounded-full text-white text-sm w-28',
							isSameDate(date, weekDate)
								? 'bg-darkBlue text-bold'
								: 'bg-normalBlue'
						)}
						onClick={() => handleChangeDay(weekDate)}>
						{getWeekday(weekDate)}
					</button>
				))}
			</div>
			<div className="md:self-center sm:items-center items-start flex flex-col sm:flex-row text-md text-darkBlue mt-4 mb-8 font-bold md:justify-center">
				<label htmlFor="filter">Filter:</label>
				<FilterDropdown
					id="location"
					name="location"
					title={city}
					options={(Object.keys(cityOptions) ?? []).map((e) => ({
						label: cityOptions[e].city,
						onClick() {
							setCity(cityOptions[e].city);
						}
					}))}
					className="m-2"></FilterDropdown>

				<FilterDropdown
					id="Nusach"
					name="Nusach"
					title={nusach}
					options={NusachOptions.map((e) => ({
						label: e,
						onClick() {
							setNusach(e);
						}
					}))}
					className="m-2 w-28"></FilterDropdown>
				<label
					htmlFor="sort"
					className="mx-4
				 hidden mdblock">
					Sort By:
				</label>
				{pinLocations.length === 0 && (
					<Switch
						offText="Shul"
						value={sortBy ? true : false}
						onChange={setSortBy}
						onText="Times"
						className="m-2"
					/>
				)}
			</div>

			<div className="flex flex-col md:flex-row md:justify-between md:h-96  my-2">
				{PrayerTypes.map((type, i) => {
					const targetSection = formalizedData[type] ?? [];
					const options = Object.keys(targetSection);

					return (
						<div
							className={classNames(
								'md:relative mb-2 md:min-h-full max-h-96 overflow-y-auto overscroll-y-none  flex font-extrabold  text-darkBlue flex-col  text-center mx-2 rounded-xl bg-lightBlue p-2'
							)}>
							<span
								onClick={() =>
									setOpenSection(openSection === type ? null : type)
								}
								className="md:hidden my-2 inline-flex text-xl">
								{type}
								<ChevronDownIcon
									className={classNames(
										openSection === type ? 'rotate-180' : '  text-white',
										' h-8 w-8 ml-auto  text-darkBlue active:border-0 transition duration-500 ease-out'
									)}
									aria-hidden="true"
								/>
							</span>
							<span className="hidden md:inline-block my-2 text-xl">
								{type}
							</span>
							<div
								className={classNames(
									openSection === type ? '' : 'hidden md:block'
								)}>
								<Spinner isLoading={timesQuery.isLoading} />
								{sponsors[type] && (
									<button className="px-4 py-2 mx-2 font-sans rounded-full text-md bg-normalBlue my-2  text-white text-2xl font-extrabold">
										{sponsors[type]}
									</button>
								)}
								{!timesQuery.isLoading &&
									timesQuery.data &&
									options.map((j) => (
										<Menu title={j} options={targetSection[j]} />
									))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
