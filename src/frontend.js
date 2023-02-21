import { QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Tab } from '@headlessui/react';
import {
	classNames,
	getCityGeocode,
	queryClient,
	useZmanimGPSApi
} from './utils';
import { Helmet } from 'react-helmet';
import { PrayerTypes } from './utils/enums';
import ZManimDisplay from './components/ZManimDisplay';
import SponsorLogo from './components/SponsorLogo';
import TimesCard from './components/TimesCard';
import WeekdayFilter from './components/WeekdaysFilter';
import usePrayerTimesReducer, {
	PrayerTimesContext
} from './utils/hooks/usePrayerTimesReducer';
import SearchFilters from './components/SearchFilters';
import ErrorBoundary from './components/ErrorBoundary';
import DafYomiFilters from './components/DafYomiFilters';

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
				<ErrorBoundary>
					<QueryClientProvider client={queryClient}>
						<ReactQueryDevtools />
						<MinyanTimes {...data} />
					</QueryClientProvider>
				</ErrorBoundary>
			</div>,
			root
		);
	}
}

function MinyanTimes(props) {
	const { zipCode, city, googleKey } = props;

	const [state, dispatch] = usePrayerTimesReducer({
		zipCode,
		city,
		googleKey
	});
	const geoQuery = getCityGeocode({
		city: state.city,
		googleKey
	});
	useZmanimGPSApi({
		dates: state.week,
		lat: geoQuery.data?.lat,
		lng: geoQuery.data?.lng,
		enabled: !geoQuery.isLoading && geoQuery.isSuccess
	});

	const sponsors = useMemo(() => {
		return PrayerTypes.reduce((a, e) => {
			a[e] = props[e];
			return a;
		}, {});
	}, []);
	return (
		<PrayerTimesContext.Provider value={[state, dispatch]}>
			<Helmet>
				<meta charSet="utf-8" />
			</Helmet>
			<ZManimDisplay />
			<WeekdayFilter />
			<Tab.Group>
				<Tab.List className="flex space-x-1 rounded-xl rounded-b-none border-b-0 bg-white p-1">
					<Tab
						className={({ selected }) =>
							classNames(
								'w-full  rounded-lg py-2.5 text-md leading-5 font-bold text-center text-darkBlue',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
								selected
									? 'bg-lightBlue shadow'
									: ' hover:bg-white/[0.12] hover:text-black'
							)
						}>
						Minyan
					</Tab>
					<Tab
						className={({ selected }) =>
							classNames(
								'w-full  rounded-lg py-2.5 text-md leading-5 font-bold text-center text-darkBlue',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
								selected
									? 'bg-lightBlue shadow'
									: ' hover:bg-white/[0.12] hover:text-black'
							)
						}>
						Daf Yomi
					</Tab>
				</Tab.List>
				<Tab.Panels>
					<Tab.Panel>
						<div className="flex-col font-sans flex w-full">
							<SearchFilters />
							<div className="hidden md:flex md:justify-between my-2 items-start">
								{PrayerTypes.map((type, i) => {
									return (
										<TimesCard key={type} type={type}>
											<span className=" my-2">{type}</span>

											{sponsors[type] && (
												<SponsorLogo sponsor={sponsors[type]} />
											)}
										</TimesCard>
									);
								})}
							</div>
							<div className="md:hidden">
								<Tab.Group>
									<Tab.List className="flex space-x-1 rounded-xl rounded-b-none border-b-0 bg-lightBlue p-1">
										{PrayerTypes.map((type, i) => {
											return (
												<Tab
													className={({ selected }) =>
														classNames(
															'w-full  rounded-lg py-2.5 text-md leading-5 font-bold text-center text-darkBlue',
															'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
															selected
																? 'bg-white shadow'
																: ' hover:bg-white/[0.12] hover:text-black'
														)
													}
													key={type + i}>
													{type}
												</Tab>
											);
										})}
									</Tab.List>
									<Tab.Panels>
										{PrayerTypes.map((type, i) => {
											return (
												<Tab.Panel
													className={classNames(
														'rounded-xl rounded-t-none bg-lightBlue py-2',
														'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
													)}
													key={type + i}>
													<TimesCard key={type} type={type}>
														{sponsors[type] && (
															<SponsorLogo sponsor={sponsors[type]} />
														)}
													</TimesCard>
												</Tab.Panel>
											);
										})}
									</Tab.Panels>
								</Tab.Group>
							</div>
						</div>
					</Tab.Panel>
					<Tab.Panel>
						<div className="font-sans">
							<DafYomiFilters />
							<div className="mt-2 rounded-xl bg-lightBlue md:bg-white md:items-center p-2 flex justify-center">
								<TimesCard type="Daf Yomi">
									<span className=" my-2">Daf Yomi</span>
									{sponsors['Daf Yomi'] && (
										<SponsorLogo sponsor={sponsors['Daf Yomi']} />
									)}
								</TimesCard>
							</div>
						</div>
					</Tab.Panel>
				</Tab.Panels>
			</Tab.Group>
		</PrayerTimesContext.Provider>
	);
}
