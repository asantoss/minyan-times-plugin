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
	formatzManimData,
	queryClient,
	useFilteredTimesQuery,
	useGeocodeApi,
	useLocationQuery,
	useZmanimApi
} from './utils';
import { FilterTypes, formulaLabels, FormulaTypes } from './utils/enums';
import Spinner from './components/Spinner';
import Menu from './components/Menu';
import Map from './components/Map';

document.addEventListener(
	'DOMContentLoaded',
	() => {
		const root = document.getElementById('minyan-times');
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<QueryClientProvider client={queryClient}>
					<ReactQueryDevtools />
					<MinyanTimes {...data} />
				</QueryClientProvider>,
				root
			);
		}
	},
	{ once: true }
);
const today = new Date();

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const types = ['Shacharis', 'Mincha', 'Maariv'];
let currentDay = today.getDay() === 6 ? 0 : today.getDay(); // Remove saturday.

function MinyanTimes(props) {
	const { googleKey } = props;
	const [selectedTimeOption, setSelectedTimeOption] = useState(null);
	const [city, setCity] = useState('Baltimore');
	const [nusach, setNusach] = useState(null);
	const [sortBy, setSortBy] = useState(FilterTypes.TIME);
	const [day, setDay] = useState(days[currentDay]);
	const timesQuery = useFilteredTimesQuery({
		city,
		nusach,
		day,
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
	const zManimQuery = useZmanimApi({ day: days.indexOf(day), postalCode });

	const sponsors = useMemo(() => {
		return types.reduce((a, e) => {
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
			zManimQuery.isLoading
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
		return types.reduce((acc, sect) => {
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
						if ('Zman' in zManimQuery.data) {
							const { SunriseDefault, SunsetDefault } = zManimQuery.data.Zman;
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
	}, [sortBy, day, timesQuery.data, zManimQuery]);

	const handleChangeLocation = (e) => {
		setCity(e.target.value);
	};
	const handleChangeNusach = (e) => {
		setNusach(e.target.value);
	};
	const { Zman, Time } = useMemo(() => {
		const output = { Zman: {}, Time: {} };
		if (!zManimQuery.isLoading && 'Zman' in zManimQuery.data) {
			const { Zman, Time } = formatzManimData(zManimQuery.data);
			output.Time = Time;
			output.Zman = Zman;
		}

		return output;
	}, [zManimQuery]);

	const pinLocations = useMemo(() => {
		const output = [];
		if (selectedTimeOption) {
			const pin = {
				lat: Number(selectedTimeOption.lat),
				lng: Number(selectedTimeOption.lng),
				text: selectedTimeOption.location
			};
			output.push(pin);
		}
		return output;
	}, [selectedTimeOption]);

	function handleChangeDay(value) {
		setDay(value);
	}
	return (
		<div className="flex-col flex w-fit">
			<div className="my-2 mx-auto">
				{googleKey && pinLocations.length > 0 && (
					<Map apiKey={googleKey} locations={pinLocations} />
				)}
			</div>
			<div className="relative my-2 text-sm font-bold text-darkBlue flex py-4 justify-between">
				{city && (
					<>
						<Spinner className="mx-auto " isLoading={zManimQuery.isLoading} />
						<h3>Sunrise: {Zman.SunriseDefault} </h3>
						<h3>Sunset: {Zman.SunsetDefault} </h3>
						<h3>Hebrew Date: {Time.DateJewishShort} </h3>
						{Time.Parsha && <h3>Parsha: {Time.Parsha} </h3>}
						<h3>Daf Yomi: {Time.DafYomi}</h3>
					</>
				)}
			</div>
			<div className="flex my-3 justify-between">
				{days.map((e) => (
					<button
						className={classNames(
							'px-4 py-2 mx-2 text-bold  rounded-full text-white text-md',
							day === e ? 'bg-darkBlue text-bold' : 'bg-normalBlue',
							e === 'Sunday' ? 'order-last' : ''
						)}
						onClick={() => handleChangeDay(e)}>
						{e}
					</button>
				))}
			</div>
			<div className="self-center items-center flex text-xl text-darkBlue mt-4 mb-8 font-extrabold justify-center">
				<label htmlFor="filter">Filter:</label>
				<select
					id="location"
					name="location"
					onChange={handleChangeLocation}
					value={city}
					className="bg-orange rounded-xl active:bg-darkBlue text-sm pl-2 py-2 text-white mx-2">
					<option value="">Location</option>
					{(Object.keys(cityOptions) ?? []).map((e) => (
						<option key={cityOptions[e].id} value={cityOptions[e].city}>
							{cityOptions[e].city}
						</option>
					))}
				</select>
				<select
					id="Nusach"
					name="Nusach"
					onChange={handleChangeNusach}
					className="bg-orange rounded-xl active:bg-darkBlue text-sm pl-2 py-2 text-white mx-2">
					<option value="">Nusach</option>
					<option value="Ashkenaz">Ashkenaz</option>
					<option value="Sefard">Sefard</option>
				</select>
				<label htmlFor="sort" className="mx-4">
					Sort By:
				</label>
				<Switch
					offText="Shul"
					value={sortBy ? true : false}
					onChange={setSortBy}
					onText="Times"
				/>
			</div>

			<div className="flex justify-between h-96  body_wrapper my-2">
				{types.map((type, i) => {
					const targetSection = formalizedData[type] ?? [];
					return (
						<div className="relative w-1/3 min-h-full   flex font-extrabold  text-darkBlue flex-col  text-center mx-2 rounded-xl bg-lightBlue p-2">
							<h3 className=" my-2  text-2xl">{type}</h3>
							<button className="px-4 py-2 mx-2 text-bold  rounded-full text-md bg-normalBlue my-2  text-white text-2xl font-extrabold">
								{sponsors[type]}
							</button>
							<div
								className={classNames(
									'absolute transition-all duration-1000 w-full z-30 h-full bg-black/25 ',
									timesQuery.isLoading ? '' : 'hidden'
								)}>
								<Spinner isLoading={timesQuery.isLoading} />
							</div>
							{!timesQuery.isLoading &&
								timesQuery.data &&
								Object.keys(targetSection ?? {}).map((j) => (
									<Menu title={j} options={targetSection[j]} />
								))}
						</div>
					);
				})}
			</div>
		</div>
	);
}
