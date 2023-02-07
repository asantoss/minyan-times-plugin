// CONSOLE.LOG('LOADED');
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Switch from './components/Switch';
import {
	addMinutes,
	classNames,
	convertTime,
	formatTime,
	formatZman,
	getDateFromTimeString,
	getNextSetOfDays,
	getWeekday,
	isSameDate,
	queryClient,
	useFilteredTimesQuery,
	useLocationQuery,
	useZmanimApi
} from './utils';
import {
	ViewTypes,
	formulaLabels,
	FormulaTypes,
	NusachOptions,
	PrayerTypes
} from './utils/enums';
import Spinner from './components/Spinner';
import Accordion from './components/Accordion';

import Map from './components/Map';
import FilterDropdown from './components/FilterDropdown';
import Modal from './components/Modal';
import ZManimDisplay from './components/ZManimDisplay';
import SponsorLogo from './components/SponsorLogo';
import TimesCard from './components/TimesCard';
import WeekdayFilter from './components/WeekdaysFilter';
import Input from './components/Input';
import { debounce } from 'lodash';
import { useCallback } from 'react';

if (window.elementorFrontend) {
	window.addEventListener('elementor/frontend/init', () => {
		elementorFrontend.hooks.addAction(
			'frontend/element_ready/minyan-times-block.default',
			renderApp
		);
		elementorFrontend.hooks.addAction(
			'panel/open_editor/minyan-times-block.default',
			renderApp
		);
	});
} else {
	document.addEventListener('DOMContentLoaded', renderApp, { once: true });
}

async function renderApp() {
	let root = document.getElementById('mtp-plugin');
	if (root) {
		const dataEl = root.querySelector('pre');
		let data = {};
		if (dataEl) {
			data = JSON.parse(dataEl.innerText);
		}
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
}

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
	const [nusach, setNusach] = useState(null);
	const [sortBy, setSortBy] = useState(ViewTypes.TIME);
	const [date, setDate] = useState(today);
	const [rabbi, setRabbi] = useState('');
	const [shul, setShul] = useState('');
	const timesQuery = useFilteredTimesQuery({
		city,
		nusach,
		day: getWeekday(date),
		sortBy,
		rabbi,
		shul
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
				if (typeof data === 'object' && Object.keys(data)?.length > 0) {
					const { Time, Place } = data;
					const queryMatch =
						Time?.Weekday === getWeekday(date) &&
						Place?.PostalCode === postalCode;
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
			!Array.isArray(locationsQuery.data) ||
			!Array.isArray(timesQuery.data)
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
					return e.type === sect;
				})
				.reduce((acc, timeElement) => {
					let currentTime = '';

					timeElement.onClick = () => {
						if (googleKey) {
							setSelectedTimeOption(timeElement);
						}
					};
					if (timeElement.isCustom === '1') {
						let { formula, minutes } = timeElement;
						formula = Number(formula);
						minutes = Number(minutes);
						if (ZmanimQueryData.data?.Zman) {
							const { SunriseDefault, SunsetDefault, MinchaStrict } =
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
						sortBy === ViewTypes.TIME ? currentTime : timeElement.location;
					const optionLabel =
						sortBy === ViewTypes.TIME ? timeElement.location : currentTime;
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
					.sort((a, b) => {
						if (sortBy === ViewTypes.TIME) {
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
			return acc;
		}, output);
	}, [sortBy, timesQuery, ZmanimQueryData]);

	const pinLocations = useMemo(() => {
		const pins = [];
		let bounds = null;
		if (selectedTimeOption && selectedTimeOption.geometry) {
			const { viewport, location } = JSON.parse(
				selectedTimeOption.geometry ?? '{}'
			);
			bounds = viewport;
			const pin = {
				lat: Number(location.lat),
				lng: Number(location.lng),
				text: `${selectedTimeOption.address}, ${selectedTimeOption.state}, ${selectedTimeOption.city}, ${selectedTimeOption.zipCode}`
			};
			pins.push(pin);
		}
		return { pins, bounds };
	}, [selectedTimeOption]);

	function handleChangeDay(date) {
		setDate(date);
	}

	const debouncedCall = useCallback(
		debounce((e) => {
			const { name, value } = e.target;
			if (name === 'rabbi') {
				setRabbi(e.target.value);
			}
			if (name === 'shul') {
				setShul(e.target.value);
			}
		}),
		300
	);
	return (
		<div className="flex-col font-sans flex w-full">
			{googleKey && (
				<Modal
					className="my-2 mx-auto"
					state={pinLocations?.pins?.length > 0}
					onClose={() => setSelectedTimeOption(null)}
					button={() => {}}>
					{pinLocations?.pins?.length > 0 && (
						<Map apiKey={googleKey} {...pinLocations} />
					)}
				</Modal>
			)}
			<ZManimDisplay Zmanim={ZmanimQueryData.data} />
			<WeekdayFilter date={date} onChange={handleChangeDay} />
			<div className="md:self-center md:w-full sm:items-center items-start flex flex-col sm:flex-row text-sm text-darkBlue mt-4 mb-8 font-bold md:justify-center">
				<div className="mr-auto">
					{pinLocations.length === 0 && (
						<>
							<label htmlFor="sort" className="mx-4 hidden md:block">
								Sort By:
							</label>
							<Switch
								offText="Shul"
								value={sortBy ? true : false}
								onChange={setSortBy}
								onText="Times"
								className="m-2"
							/>
						</>
					)}
				</div>
				<fieldset className="md:flex grid grid-cols-2 gap-2">
					<Input
						onChange={debouncedCall}
						id="shul"
						name="shul"
						className="md:mx-2"
						label="Shul"
					/>
					<Input
						onChange={debouncedCall}
						id="rabbi"
						name="rabbi"
						label="Rabbi"
					/>
					<div className="md:mx-2">
						<label htmlFor="location">Location:</label>
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
							className="md:w-40"
						/>
					</div>
					<div className="md:mx-2">
						<label htmlFor="nusach">Nusach:</label>
						<FilterDropdown
							id="Nusach"
							name="Nusach"
							title={nusach ?? 'All'}
							options={[
								{ label: 'All', onClick: () => setNusach(null) },
								...NusachOptions.map((e) => ({
									label: e,
									onClick() {
										setNusach(e);
									}
								}))
							]}
							className="w- md:w-40"
						/>
					</div>
				</fieldset>
			</div>

			<div className="flex flex-col md:flex-row md:justify-between my-2">
				{PrayerTypes.map((type, i) => {
					const targetSection = formalizedData[type] ?? [];
					const options = Object.keys(targetSection);
					return (
						<TimesCard isOpen={i === 0} key={type} title={type}>
							<>
								<Spinner isLoading={timesQuery.isLoading} />
								{sponsors[type] && <SponsorLogo sponsor={sponsors[type]} />}
								{!timesQuery.isLoading &&
									timesQuery.data &&
									options.map((j) => {
										const options = targetSection[j];

										let title = j;
										const isCalculated = options.every(
											(e) => e.isCustom === '1'
										);
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

										return <Accordion title={title} options={options} />;
									})}
							</>
						</TimesCard>
					);
				})}
			</div>
		</div>
	);
}
