import { QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Tab } from '@headlessui/react';
import {
	classNames,
	getCityGeocode,
	getNextSetOfDays,
	queryClient,
	startDate,
	useZmanimGPSApi
} from './utils';
import { Helmet } from 'react-helmet';
import { PrayerTypes } from './utils/enums';
import ZManimDisplay from './components/ZManimDisplay';
import SponsorLogo from './components/SponsorLogo';
import TimesCard from './components/TimesCard';
import WeekdayFilter from './components/WeekdaysFilter';
import DafYomiWeekdayFilter, {
	getDafYomiSetOfDays
} from './components/DafYomiWeekdayFilter';
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
			() => renderApp('mtp-plugin')
		);
		elementorFrontend.hooks.addAction(
			'panel/open_editor/minyan-times-block.default',
			() => renderApp('mtp-plugin')
		);
	});
	window.addEventListener('elementor/frontend/init', () => {
		elementorFrontend.hooks.addAction(
			'frontend/element_ready/daf-yomi-times-block.default',
			() => renderApp('mtp-plugin-daf-yomi')
		);
		elementorFrontend.hooks.addAction(
			'panel/open_editor/daf-yomi-times-block.default',
			() => renderApp('mtp-plugin-daf-yomi')
		);
	});
} else {
	document.addEventListener('DOMContentLoaded', renderApp, { once: true });
}

async function renderApp(id = 'mtp-plugin') {
	let root = document.getElementById(id);
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
	const { city, googleKey, isDafYomi } = props;

	const [state, dispatch] = usePrayerTimesReducer({
		city,
		googleKey,
		date: isDafYomi ? new Date() : startDate,
		week: isDafYomi
			? getDafYomiSetOfDays(new Date(), 6)
			: getNextSetOfDays(startDate, 6)
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

			{isDafYomi ? <DafYomiWeekdayFilter /> : <WeekdayFilter />}
			<div className="flex-col font-sans flex w-full">
				{isDafYomi ? <DafYomiFilters /> : <SearchFilters />}
				<div className="hidden md:flex md:justify-center my-2 items-start">
					{isDafYomi ? (
						<TimesCard type="Daf Yomi">
							<span className=" my-2">Daf Yomi</span>

							{sponsors['Daf Yomi'] && (
								<SponsorLogo sponsor={sponsors['Daf Yomi']} />
							)}
						</TimesCard>
					) : (
						PrayerTypes.map((type, i) => {
							return (
								<TimesCard key={type} type={type}>
									<span className=" my-2">{type}</span>

									{sponsors[type] && <SponsorLogo sponsor={sponsors[type]} />}
								</TimesCard>
							);
						})
					)}
				</div>
				<div className="md:hidden">
					<Tab.Group>
						<Tab.List className="flex space-x-1 rounded-xl rounded-b-none border-b-0 bg-lightBlue p-1">
							{isDafYomi ? (
								<Tab
									as="span"
									role="tab"
									className={({ selected }) =>
										classNames(
											'w-full cursor-pointer rounded-lg py-2.5 text-md leading-5 font-bold text-center text-darkBlue',
											'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
											selected
												? 'bg-white shadow'
												: ' hover:bg-white/[0.12] hover:text-black'
										)
									}>
									Daf Yomi
								</Tab>
							) : (
								PrayerTypes.map((type, i) => {
									return (
										<Tab
											as="span"
											role="tab"
											className={({ selected }) =>
												classNames(
													'w-full cursor-pointer rounded-lg py-2.5 text-md leading-5 font-bold text-center text-darkBlue',
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
								})
							)}
						</Tab.List>
						<Tab.Panels>
							{isDafYomi ? (
								<Tab.Panel
									className={classNames(
										'rounded-xl rounded-t-none bg-lightBlue py-2',
										'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
									)}>
									<TimesCard type="Daf Yomi">
										{sponsors['Daf Yomi'] && (
											<SponsorLogo sponsor={sponsors['Daf Yomi']} />
										)}
									</TimesCard>
								</Tab.Panel>
							) : (
								PrayerTypes.map((type, i) => {
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
								})
							)}
						</Tab.Panels>
					</Tab.Group>
				</div>
			</div>
		</PrayerTimesContext.Provider>
	);
}
