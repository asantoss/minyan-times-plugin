import { QueryClient, useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FilterTypes, formulaLabels } from './enums';

import { Client } from '@googlemaps/google-maps-services-js';

export function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}
const baseURL = wpApiSettings.root + 'minyan-times/v1';
export const axiosClient = axios.create({
	baseURL,
	timeout: 30000,
	headers: { 'X-WP-Nonce': wpApiSettings.nonce }
});

export const queryClient = new QueryClient();
export function useLocationQuery(props) {
	return useQuery(
		{
			queryKey: ['locations'],
			queryFn: async () => {
				try {
					const response = await axiosClient.get('/locations');
					return response.data;
				} catch (error) {
					throw new Error('Network response was not ok');
				}
			}
		},
		{
			...props
		}
	);
}

export function useDeleteTime(props) {
	return useMutation(
		{
			mutationFn: async (id) => {
				try {
					const response = await axiosClient.delete('/times/' + id);
					return response.data;
				} catch (error) {
					throw new Error('Network response was not ok');
				}
			},
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: 'times' });
			}
		},
		props
	);
}
export function useDeleteLocation() {
	return useMutation({
		mutationFn: async (id) => {
			try {
				const response = await axiosClient.delete('/locations/' + id);

				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'locations' });
		}
	});
}

export function useTimesQuery(props) {
	return useQuery(
		{
			queryKey: ['times'],
			queryFn: async () => {
				try {
					let url = '/times';
					const response = await axiosClient.get(url);
					return response.data;
				} catch (error) {
					throw new Error('Network response was not ok');
				}
			}
		},
		{}
	);
}
export function useFilteredTimesQuery({ city, day, nusach, sortBy }) {
	return useQuery({
		queryKey: [
			'times',
			city,
			day,
			nusach,
			sortBy === FilterTypes.TIME ? 'time' : 'location'
		],
		queryFn: async ({ queryKey }) => {
			try {
				let url = '/times';
				const [_, city, day, nusach, sortBy] = queryKey;
				const params = {
					city,
					day,
					nusach,
					sortBy
				};
				const response = await axiosClient.get(url, { params });
				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		}
	});
}

export function useTimeMutation(id) {
	return useMutation({
		mutationFn: async (body) => {
			try {
				if (id) {
					const response = await axiosClient.post('/times/' + id, body);
					return response.data;
				} else {
					const response = await axiosClient.post('/times', body);
					return response.data;
				}
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'times' });
		}
	});
}
export function useLocationMutation(id) {
	return useMutation({
		mutationFn: async (body) => {
			try {
				if (id) {
					const response = await axiosClient.post('/locations/' + id, body);
					return response.data;
				} else {
					const response = await axiosClient.post('/locations', body);
					return response.data;
				}
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'locations' });
		}
	});
}

export function useZmanimApi({ day, postalCode }) {
	return useQuery(['zManim', day, postalCode], async ({ queryKey }) => {
		try {
			const [_, day, postalCode] = queryKey;
			const dateObj = getDateFromDay(day);
			const date = `${dateObj.getFullYear()}-${
				dateObj.getMonth() + 1
			}-${dateObj.getDate()}`;
			if (postalCode) {
				const response = await axiosClient.get('/zManim', {
					params: { date, postalCode }
				});

				return response.data;
			}
			return {};
		} catch (error) {}
	});
}
function firstDayOfWeek(date) {
	const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
	return new Date(date.setDate(diff));
}

export function getDateFromDay(day) {
	const targetDate = new Date();
	const currentDay = targetDate.getDay();
	const startOfWeek = firstDayOfWeek(targetDate);
	if (currentDay !== 0 && day === 0) {
		day = startOfWeek.getDay() + 5;
	}
	const diff = startOfWeek.getDate() - startOfWeek.getDay() + day;
	targetDate.setDate(diff);
	return targetDate;
}

export function convertTime(timeString) {
	const splitString = timeString.split(':');
	const today = new Date();
	today.setHours(...splitString);
	let hours = today.getHours();
	const minutes = today.getMinutes().toString().padStart(2, '0');
	const suffix = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12 || 12;
	return hours + ':' + minutes + ' ' + suffix;
}
export function getHours(timeString) {
	const splitString = timeString.split(':');
	const today = new Date();
	today.setHours(...splitString);
	return today.getHours();
}

export function formatzManimData(day) {
	const output = {
		...day,
		Zman: {
			CurrentTime: formatZman(day.Zman.CurrentTime),
			Dawn72: formatZman(day.Zman.Dawn72),
			YakirDefault: formatZman(day.Zman.YakirDefault),
			SunriseDefault: formatZman(day.Zman.SunriseDefault),
			ShemaMA72: formatZman(day.Zman.ShemaMA72),
			ShemaGra: formatZman(day.Zman.ShemaGra),
			ShachrisGra: formatZman(day.Zman.ShachrisGra),
			Midday: formatZman(day.Zman.Midday),
			MinchaStrict: formatZman(day.Zman.MinchaStrict),
			PlagGra: formatZman(day.Zman.PlagGra),
			Candles: formatZman(day.Zman.Candles),
			SunsetDefault: formatZman(day.Zman.SunsetDefault),
			NightShabbos: formatZman(day.Zman.NightShabbos),
			Night72fix: formatZman(day.Zman.Night72fix),
			sunsetDefault: formatZman(addMinutes(day.Zman.SunsetDefault, -20)),
			Dawn90: formatZman(day.Zman.Dawn90),
			Dawn72: formatZman(day.Zman.Dawn72),
			Dawn72fix: formatZman(day.Zman.Dawn72fix),
			DawnRMF: formatZman(day.Zman.DawnRMF),
			Yakir115: formatZman(day.Zman.Yakir115),
			Yakir110: formatZman(day.Zman.Yakir110),
			Yakir102: formatZman(day.Zman.Yakir102),
			YakirDefault: formatZman(day.Zman.YakirDefault),
			SunriseLevel: formatZman(day.Zman.SunriseLevel),
			SunriseElevated: formatZman(day.Zman.SunriseElevated),
			SunriseDefault: formatZman(day.Zman.SunriseDefault),
			ShemaBenIsh90ToFastTuc: formatZman(day.Zman.ShemaBenIsh90ToFastTuc),
			ShemaBenIsh72ToFastTuc: formatZman(day.Zman.ShemaBenIsh72ToFastTuc),
			ShemaBenIsh72ToShabbos: formatZman(day.Zman.ShemaBenIsh72ToShabbos),
			ShemaMA90: formatZman(day.Zman.ShemaMA90),
			ShemaMA72: formatZman(day.Zman.ShemaMA72),
			ShemaMA72fix: formatZman(day.Zman.ShemaMA72fix),
			ShemaGra: formatZman(day.Zman.ShemaGra),
			ShemaRMF: formatZman(day.Zman.ShemaRMF),
			ShachrisMA90: formatZman(day.Zman.ShachrisMA90),
			ShachrisMA72: formatZman(day.Zman.ShachrisMA72),
			ShachrisMA72fix: formatZman(day.Zman.ShachrisMA72fix),
			ShachrisGra: formatZman(day.Zman.ShachrisGra),
			ShachrisRMF: formatZman(day.Zman.ShachrisRMF),
			Midday: formatZman(day.Zman.Midday),
			MiddayRMF: formatZman(day.Zman.MiddayRMF),
			MinchaGra: formatZman(day.Zman.MinchaGra),
			Mincha30fix: formatZman(day.Zman.Mincha30fix),
			MinchaMA72fix: formatZman(day.Zman.MinchaMA72fix),
			MinchaStrict: formatZman(day.Zman.MinchaStrict),
			KetanaGra: formatZman(day.Zman.KetanaGra),
			KetanaMA72fix: formatZman(day.Zman.KetanaMA72fix),
			PlagGra: formatZman(day.Zman.PlagGra),
			PlagMA72fix: formatZman(day.Zman.PlagMA72fix),
			PlagBenIsh90ToFastTuc: formatZman(day.Zman.PlagBenIsh90ToFastTuc),
			PlagBenIsh72ToFastTuc: formatZman(day.Zman.PlagBenIsh72ToFastTuc),
			PlagBenIsh72ToShabbos: formatZman(day.Zman.PlagBenIsh72ToShabbos),
			SunsetLevel: formatZman(day.Zman.SunsetLevel),
			SunsetElevated: formatZman(day.Zman.SunsetElevated),
			SunsetDefault: formatZman(day.Zman.SunsetDefault),
			NightGra180: formatZman(day.Zman.NightGra180),
			NightGra225: formatZman(day.Zman.NightGra225),
			NightGra240: formatZman(day.Zman.NightGra240),
			NightZalman: formatZman(day.Zman.NightZalman),
			NightFastTuc: formatZman(day.Zman.NightFastTuc),
			NightFastRMF: formatZman(day.Zman.NightFastRMF),
			NightMoed: formatZman(day.Zman.NightMoed),
			NightShabbos: formatZman(day.Zman.NightShabbos),
			NightChazonIsh: formatZman(day.Zman.NightChazonIsh),
			Night50fix: formatZman(day.Zman.Night50fix),
			Night60fix: formatZman(day.Zman.Night60fix),
			Night72: formatZman(day.Zman.Night72),
			Night72fix: formatZman(day.Zman.Night72fix),
			Night72fixLevel: formatZman(day.Zman.Night72fixLevel),
			Night90: formatZman(day.Zman.Night90),
			Midnight: formatZman(day.Zman.Midnight),
			ChametzEatGra: formatZman(day.Zman.ChametzEatGra),
			ChametzEatMA72: formatZman(day.Zman.ChametzEatMA72),
			ChametzEatMA72fix: formatZman(day.Zman.ChametzEatMA72fix),
			ChametzEatRMF: formatZman(day.Zman.ChametzEatRMF),
			ChametzBurnGra: formatZman(day.Zman.ChametzBurnGra),
			ChametzBurnMA72: formatZman(day.Zman.ChametzBurnMA72),
			ChametzBurnMA72fix: formatZman(day.Zman.ChametzBurnMA72fix),
			ChametzBurnRMF: formatZman(day.Zman.ChametzBurnRMF),
			TomorrowNightShabbos: formatZman(day.Zman.TomorrowNightShabbos),
			TomorrowSunriseLevel: formatZman(day.Zman.TomorrowSunriseLevel),
			TomorrowSunriseElevated: formatZman(day.Zman.TomorrowSunriseElevated),
			TomorrowSunriseDefault: formatZman(day.Zman.TomorrowSunriseDefault),
			TomorrowSunsetLevel: formatZman(day.Zman.TomorrowSunsetLevel),
			TomorrowSunsetElevated: formatZman(day.Zman.TomorrowSunsetElevated),
			TomorrowSunsetDefault: formatZman(day.Zman.TomorrowSunsetDefault),
			TomorrowNight72fix: formatZman(day.Zman.TomorrowNight72fix),
			TomorrowNightChazonIsh: formatZman(day.Zman.TomorrowNightChazonIsh),
			Tomorrow2NightShabbos: formatZman(day.Zman.Tomorrow2NightShabbos),
			Tomorrow2SunsetLevel: formatZman(day.Zman.Tomorrow2SunsetLevel),
			Tomorrow2SunsetElevated: formatZman(day.Zman.Tomorrow2SunsetElevated),
			Tomorrow2SunsetDefault: formatZman(day.Zman.Tomorrow2SunsetDefault),
			Tomorrow2Night72fix: formatZman(day.Zman.Tomorrow2Night72fix),
			Tomorrow2NightChazonIsh: formatZman(day.Zman.Tomorrow2NightChazonIsh),
			PropGra: ticksToMinutes(day.Zman.PropGra),
			PropMA72: ticksToMinutes(day.Zman.PropMA72),
			PropMA72fix: ticksToMinutes(day.Zman.PropMA72fix),
			PropMA90: ticksToMinutes(day.Zman.PropMA90),
			PropRmfMorning: ticksToMinutes(day.Zman.PropRmfMorning),
			PropBenIsh90ToFastTuc: ticksToMinutes(day.Zman.PropBenIsh90ToFastTuc),
			PropBenIsh72ToFastTuc: ticksToMinutes(day.Zman.PropBenIsh72ToFastTuc),
			PropBenIsh72ToShabbos: ticksToMinutes(day.Zman.PropBenIsh72ToShabbos)
		}
	};
	return output;
}

export function addMinutes(date, minutes) {
	let newdate = new Date(date);
	return new Date(newdate.getTime() + minutes * 60000);
}

function ticksToMinutes(ticks) {
	const sec = (ticks * 1) / 10000000;
	let min = sec / 60;
	min = round(min);
	return min;
}
function formatDate(date) {
	let newdate = new Date(date);
	let theday = ('0' + newdate.getDate()).slice(-2);
	let themonth = ('0' + (newdate.getMonth() + 1)).slice(-2);
	let theyear = newdate.getFullYear();
	let strdate = theyear + '-' + themonth + '-' + theday; //Note: Do not replace with .toISOString()
	strdate = strdate.substring(0, 10);
	return strdate;
}

export function formatZman(zman) {
	const d = new Date(zman);
	let hr = d.getUTCHours();
	let min = d.getUTCMinutes();
	let sec = d.getUTCSeconds();
	if (min < 10) {
		min = '0' + min;
	}
	if (sec < 10) {
		sec = '0' + sec;
	}
	let ampm = hr < 12 ? ' AM' : ' PM';
	if (hr == 0) hr = 12;
	if (hr > 12) hr -= 12;
	let result = hr + ':' + min;
	// if (sec > 0) result += ':' + sec;
	result += ampm;
	return result;
}

function getClientTimeZone() {
	let d = new Date();
	let tz = d.getTimezoneOffset() / 60;
	return tz;
}

function round(num) {
	return parseFloat(num).toFixed(1);
}
function zmanIsNull(zman) {
	return formatDate(zman) == '0001-01-01';
}

export function getTimeFromTs(timestamp) {
	const locale = 'en-US';
	const date = new Date(timestamp * 1000);
	if (!isNaN(date.getTime())) {
		const dateString = date.toLocaleDateString(locale, {
			weekday: 'long',
			year: '2-digit',
			day: 'numeric',
			month: '2-digit'
		});
		const timeString = date.toLocaleTimeString(locale, {
			hour12: true,
			minute: '2-digit',
			hour: '2-digit',
			timeZoneName: 'short'
		});
		return `${dateString} @ ${timeString}`;
	}
	return '';
}

export function exportToCsv(filename, rows) {
	function convertToCSV(arr) {
		const array = [Object.keys(arr[0]).map(capitalize)].concat(arr);

		return array
			.map((it) => {
				return Object.values(it).toString();
			})
			.join('\n');
	}

	var csvFile = convertToCSV(rows);

	var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) {
		// IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement('a');
		if (link.download !== undefined) {
			// feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}

export function formatTime(data) {
	return data.isCustom && Number(data.isCustom)
		? `Neitz (${data.minutes}m ${formulaLabels[data.formula]})`
		: convertTime(data.time);
}

export function capitalize(str) {
	const lower = str.toLowerCase();
	return str.charAt(0).toUpperCase() + lower.slice(1);
}

let client = new Client({});

export function useGeocodeApi({ googleKey, location, enabled }) {
	const address = location
		? `${location.address || ''} ${location.city || ''} ${
				location.state || ''
		  } ${location.zipCode || ''}`
		: null;
	return useQuery(
		['gMap', address],
		async ({ queryKey }) => {
			const [_, address] = queryKey;
			if (address.trim()) {
				const response = await client.geocode({
					params: {
						address: address.trim(),
						key: googleKey,
						components: { country: 'us' }
					}
				});
				return response.data;
			}
			return {};
		},
		{
			staleTime: Infinity,
			cacheTime: Infinity,
			enabled
		}
	);
}
