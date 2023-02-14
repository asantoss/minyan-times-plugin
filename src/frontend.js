import { QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
	addMinutes,
	convertTime,
	formatTime,
	formatZman,
	getDateFromTimeString,
	queryClient,
	useFilteredTimesQuery,
	useLocationQuery,
	useZmanimData
} from './utils';
import { Helmet } from 'react-helmet';
import { ViewTypes, FormulaTypes, PrayerTypes } from './utils/enums';
import Spinner from './components/Spinner';
import Accordion from './components/Accordion';
import Map from './components/Map';
import Modal from './components/Modal';
import ZManimDisplay from './components/ZManimDisplay';
import SponsorLogo from './components/SponsorLogo';
import TimesCard from './components/TimesCard';
import WeekdayFilter from './components/WeekdaysFilter';
import usePrayerTimesReducer, {
	PrayerTimesContext
} from './utils/hooks/usePrayerTimesReducer';
import SearchFilters from './components/SearchFilters';

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

function MinyanTimes(props) {
	const { googleKey, zipCode, city } = props;

	const [state, dispatch] = usePrayerTimesReducer({
		zipCode,
		city
	});
	const timesQuery = useFilteredTimesQuery(state);
	const locationsQuery = useLocationQuery();
	const ZmanimQueryData = useZmanimData(state.date, state.zipCode);

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
		if (state.currentTimeRecord != null) {
			const isSelectedIdx = data.findIndex(
				(e) => e.locationId === state.currentTimeRecord.locationId
			);
			if (isSelectedIdx === -1) {
				dispatch({ type: 'SET_TIME_RECORD', payload: null });
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
							dispatch({ type: 'SET_TIME_RECORD', payload: timeElement });
						}
					};
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
						state.sortBy === ViewTypes.TIME
							? currentTime
							: timeElement.location;
					const optionLabel =
						state.sortBy === ViewTypes.TIME
							? timeElement.location
							: currentTime;
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
			return acc;
		}, output);
	}, [state.sortBy, timesQuery, ZmanimQueryData]);

	const pinLocations = useMemo(() => {
		const pins = [];
		let bounds = null;
		if (state.currentTimeRecord && state.currentTimeRecord.geometry) {
			const { viewport, location } = JSON.parse(
				state.currentTimeRecord.geometry ?? '{}'
			);
			bounds = viewport;
			const pin = {
				lat: Number(location.lat),
				lng: Number(location.lng),
				text: `${state.currentTimeRecord.address}, ${state.currentTimeRecord.state}, ${state.currentTimeRecord.city}, ${state.currentTimeRecord.zipCode}`
			};
			pins.push(pin);
		}
		return { pins, bounds };
	}, [state.currentTimeRecord]);

	return (
		<PrayerTimesContext.Provider value={[state, dispatch]}>
			<div className="flex-col font-sans flex w-full">
				<Helmet>
					<meta charSet="utf-8" />
				</Helmet>
				{googleKey && (
					<Modal
						className="my-2 mx-auto"
						state={pinLocations?.pins?.length > 0}
						onClose={() => dispatch({ type: 'SET_TIME_RECORD', payload: null })}
						button={() => {}}>
						{pinLocations?.pins?.length > 0 && (
							<Map apiKey={googleKey} {...pinLocations} />
						)}
					</Modal>
				)}
				<ZManimDisplay Zmanim={ZmanimQueryData} />
				<WeekdayFilter />
				<SearchFilters />
				<div className="flex flex-col md:flex-row md:justify-between my-2">
					{PrayerTypes.map((type, i) => {
						const targetSection = formalizedData[type] ?? [];
						const sectionOptions = Object.keys(targetSection);
						return (
							<TimesCard isOpen={i === 0} key={type} title={type}>
								<>
									<Spinner isLoading={timesQuery.isLoading} />
									{sponsors[type] && <SponsorLogo sponsor={sponsors[type]} />}
									{!timesQuery.isLoading &&
										timesQuery.data &&
										sectionOptions.map((j) => {
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
		</PrayerTimesContext.Provider>
	);
}
