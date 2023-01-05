import { Transition } from '@headlessui/react';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Options from './components/Popover';
import Switch from './components/Switch';
import {
	convertTime,
	getHours,
	queryClient,
	useFilteredTimesQuery,
	useLocationQuery,
	useTimesQuery
} from './utils';
import { FilterTypes } from './utils/enums';

document.addEventListener(
	'DOMContentLoaded',
	() => {
		const root = document.getElementById('minyan-times');
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<QueryClientProvider client={queryClient}>
					<MinyanTimes {...data} />
				</QueryClientProvider>,
				root
			);
		}
	},
	{ once: true }
);
const today = new Date();

function MinyanTimes(props) {
	const days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday'
	];
	const [selectedOption, setSelectedOption] = useState(null);
	const [location, setLocation] = useState(null);
	const [nusach, setNusach] = useState(null);
	const [filterType, setFilterType] = useState(FilterTypes.TIME);
	const [day, setDay] = useState(days[today.getDay()]);
	const { data } = useFilteredTimesQuery({ location, nusach, day });

	const { data: locations } = useLocationQuery();

	const sections = {
		Shacharis: { max: 12, min: 0 },
		Mincha: { max: 18, min: 13 },
		Maariv: { min: 19, max: 23 }
	};

	const formalizedData = useMemo(() => {
		if (!data || !locations) {
			return {};
		}
		const sectionKeys = Object.keys(sections).reduce((acc, sect) => {
			const { min, max } = sections[sect];
			const options = data
				.filter((e) => {
					return getHours(e.time) <= max && getHours(e.time) >= min;
				})
				.reduce((acc, curr) => {
					const menuLabel =
						filterType === FilterTypes.TIME
							? convertTime(curr.time)
							: curr.location;
					const optionLabel =
						filterType === FilterTypes.TIME
							? curr.location
							: convertTime(curr.time);
					if (acc[menuLabel]) {
						acc[menuLabel] = [
							...acc[menuLabel],
							{ ...curr, label: optionLabel }
						];
					} else {
						acc[menuLabel] = [{ ...curr, label: optionLabel }];
					}
					return acc;
				}, {});
			acc[sect] = { sponsor: props[sect], options: options ?? [] };
			return acc;
		}, {});
		return sectionKeys;
	}, [filterType, day, data]);

	const handleChangeLocation = (e) => {
		setLocation(e.target.value);
	};
	const handleChangeNusach = (e) => {
		setNusach(e.target.value);
	};
	return (
		<div className="flex-col w-fit">
			<div className="flex my-3 justify-between">
				{days.map((e) => (
					<button
						className={`${
							day === e ? 'bg-darkBlue text-bold' : 'bg-normalBlue'
						} px-4 py-2 mx-2 text-bold  rounded-full text-white text-md`}
						onClick={() => (day === e ? setDay(null) : setDay(e))}>
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
					className="bg-orange rounded-xl text-md px-6 py-4 text-white mx-2">
					<option value="">Location</option>
					{(locations ?? []).map((e) => (
						<option key={e.id} value={e.id}>
							{e.name}
						</option>
					))}
				</select>
				<select
					id="Nusach"
					name="Nusach"
					onChange={handleChangeNusach}
					className="bg-orange rounded-xl px-6 py-4 text-md text-white mx-2">
					<option value="">Nusach</option>
					<option value="Ashkenaz">Ashkenaz</option>
					<option value="Sefard">Sefard</option>
				</select>
				<label htmlFor="sort" className="mx-4">
					Sort By:
				</label>
				<Switch
					offText="Shul"
					value={FilterTypes}
					onChange={setFilterType}
					onText="Times"
					className="bg-orange"
				/>
			</div>

			<div className="flex justify-between body_wrapper my-2">
				{Object.keys(formalizedData).map((e, i) => (
					<div className=" w-1/3 flex font-extrabold  text-darkBlue flex-col  text-center mx-2 rounded-xl bg-lightBlue p-4">
						<h3 className=" my-2  text-2xl">{e}</h3>
						<button className="px-4 py-2 mx-2 text-bold  rounded-full text-white text-md bg-normalBlue my-2 px-8 text-white text-2xl font-extrabold">
							{formalizedData[e]['sponsor']}
						</button>
						{Object.keys(formalizedData[e]['options'] ?? {}).map((j) => (
							<Options
								value={selectedOption}
								onChange={setSelectedOption}
								title={j}
								options={formalizedData[e]['options'][j]}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
