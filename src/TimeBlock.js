import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
	getNextSetOfDays,
	queryClient,
	startDate,
	useZmanimPostalCodeApi
} from './utils';
import usePrayerTimesReducer, {
	PrayerTimesContext
} from './utils/hooks/usePrayerTimesReducer';
import TimeElement from './components/TimeElement';
import dayjs from 'dayjs';

if (window.elementorFrontend) {
	window.addEventListener('elementor/frontend/init', () => {
		elementorFrontend.hooks.addAction(
			'frontend/element_ready/time-block.default',
			renderApp
		);
		elementorFrontend.hooks.addAction(
			'panel/open_editor/time-block.default',
			renderApp
		);
	});
} else {
	document.addEventListener('DOMContentLoaded', renderApp, { once: true });
}

async function renderApp(props) {
	let root = props[0].querySelector('.mtp-time-block');
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
					<TimesPostBlock {...data} />
				</QueryClientProvider>
			</div>,
			root
		);
	}
}
const weekDates = getNextSetOfDays(startDate, 6);
function TimesPostBlock(props) {
	const { postId, zipCode, day, type, list } = props;
	const targetDate = weekDates.find((e) => {
		const dateDay = dayjs(e).format('dddd');
		return dateDay === day;
	});
	const [state, dispatch] = usePrayerTimesReducer({
		postId: postId,
		zipCode
	});
	useZmanimPostalCodeApi({
		dates: [targetDate],
		postalCode: zipCode
	});
	return (
		<PrayerTimesContext.Provider value={[state, dispatch]}>
			<div className="text-center">
				<TimeElement list={list === 'yes'} day={day} type={type} />
			</div>
		</PrayerTimesContext.Provider>
	);
}
