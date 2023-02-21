import { QueryClientProvider } from '@tanstack/react-query';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
	classNames,
	getNextSetOfDays,
	queryClient,
	startDate,
	useZmanimPostalCodeApi
} from './utils';
import { Helmet } from 'react-helmet';
import { PrayerTypes, days } from './utils/enums';
import usePrayerTimesReducer, {
	PrayerTimesContext
} from './utils/hooks/usePrayerTimesReducer';
import TimeElement from './components/TimeElement';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, MinusIcon } from '@heroicons/react/24/solid';
import { Transition } from '@headlessui/react';
import ErrorBoundary from './components/ErrorBoundary';

if (window.elementorFrontend) {
	window.addEventListener('elementor/frontend/init', () => {
		elementorFrontend.hooks.addAction(
			'frontend/element_ready/minyan-times-post-block.default',
			renderApp
		);
		elementorFrontend.hooks.addAction(
			'panel/open_editor/minyan-times-post-block.default',
			renderApp
		);
	});
} else {
	document.addEventListener('DOMContentLoaded', renderApp, { once: true });
}

async function renderApp() {
	let root = document.getElementById('mtp-post-block');
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
						<TimesPostBlock {...data} />
					</QueryClientProvider>
				</ErrorBoundary>
			</div>,
			root
		);
	}
}
function TimesPostBlock(props) {
	const weekDates = getNextSetOfDays(startDate, 6);
	const { postId, zipCode, city, title } = props;

	const [state, dispatch] = usePrayerTimesReducer({
		postId: postId,
		zipCode,
		city
	});

	useZmanimPostalCodeApi({
		dates: weekDates,
		postalCode: zipCode
	});
	return (
		<PrayerTimesContext.Provider value={[state, dispatch]}>
			<div className="flex-col text-orange  font-serif flex w-full text-xl text-center font-bold">
				<Helmet>
					<meta charSet="utf-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1.0"></meta>
				</Helmet>
				<div className="hidden md:grid grid-rows-7 grid-cols-7 ">
					<span style={{ backgroundColor: '#0A2C44' }}></span>
					<span
						style={{ backgroundColor: '#0A2C44' }}
						className="p-2 col-start-2">
						Day
					</span>
					{PrayerTypes.map((type, i) => {
						return (
							<>
								<span style={{ backgroundColor: '#0A2C44' }} className="p-2">
									{type}
								</span>
								{[...days, 'Shabos'].map((day, j) => {
									return (
										<span
											className="border-b-1 bg-white border-blue-600"
											style={{
												gridColumnStart: i + 3,
												gridRowStart: j + 2
											}}
											key={`${i + 2}${j + 2}`}>
											<TimeElement
												day={day}
												type={type}
												className="text-sm border-b-1 w-full"></TimeElement>
										</span>
									);
								})}
							</>
						);
					})}
					{[...days, 'Shabos'].map((e, i) => (
						<>
							<span
								className={classNames(
									'col-start-2 border-b-1 p-2 border-elementorPrimary flex bg-white'
								)}
								style={{ gridRowStart: i + 2, gridColumnStart: 1 }}></span>
							<span
								className={classNames(
									'col-start-2 border-b-1 p-2 border-elementorPrimary flex bg-white'
								)}
								style={{ gridRowStart: i + 2 }}>
								{e}
							</span>
							<span
								className={classNames(
									'col-start-2 border-b-1 p-2 border-elementorPrimary flex bg-white'
								)}
								style={{
									gridRowStart: i + 2,
									gridColumnStart: 7
								}}></span>
						</>
					))}
					<span style={{ backgroundColor: '#0A2C44' }}></span>
				</div>
				<div className="md:hidden flex flex-col">
					{PrayerTypes.map((type) => (
						<Disclosure
							as="div"
							style={{ marginBottom: '2px' }}
							className={classNames(
								'md:relative text-sm font-bold text-left  border-0'
							)}>
							{({ open }) => (
								<>
									<Disclosure.Button
										style={{ backgroundColor: '#0A2C44' }}
										as="span"
										className="flex cursor-pointer p-3 focus-visible:outline-none  w-full text-orange font-sans text-md font-bold focus:bg-white focus:text-orange hover:text-orange active:border-0 focus:border-0">
										<ChevronDownIcon
											className={classNames(
												open ? 'hidden' : 'inline',
												'mx-2 h-4 w-4 active:border-0 transition duration-200 ease-out'
											)}
											aria-hidden="true"
										/>
										<MinusIcon
											className={classNames(
												!open ? 'hidden' : 'inline',
												'mx-2 h-4 w-4 active:border-0 transition duration-200 ease-out'
											)}
											aria-hidden="true"
										/>
										{type}
									</Disclosure.Button>
									<Transition
										as={Fragment}
										show={open}
										enter="transition ease-out duration-500 transform"
										enterFrom="opacity-0  "
										enterTo="opacity-100"
										leave="transition duration-500 transform"
										leaveFrom="opacity-100 "
										leaveTo="opacity-0  ">
										<Disclosure.Panel className="md:left-0 ">
											<div className="flex flex-col text-left text-black px-4 bg-white w-full">
												{days.map((day) => (
													<div className="grid grid-cols-2 items-center content-center justify-between">
														<span className="mr-2">{day}: </span>
														<div className="flex w-full justify-between">
															<TimeElement
																list={true}
																day={day}
																type={type}></TimeElement>
														</div>
													</div>
												))}
											</div>
										</Disclosure.Panel>
									</Transition>
								</>
							)}
						</Disclosure>
					))}
				</div>
			</div>
		</PrayerTimesContext.Provider>
	);
}
