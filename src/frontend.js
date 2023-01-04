import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Options from './components/Popover';
import Switch from './components/Switch';
import { FilterTypes } from './utils/enums';
import shacharisData from './data.json';

document.addEventListener(
	'DOMContentLoaded',
	() => {
		const root = document.getElementById('minyan-times');
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(<MinyanTimes {...data} />, root);
		}
	},
	{ once: true }
);

function PillButton({ className, children, ...props }) {
	return (
		<button
			{...props}
			className={
				className +
				' px-4 py-2 mx-2 text-bold bg-blue rounded-full text-white text-md '
			}>
			{children}
		</button>
	);
}

function MinyanTimes(props) {
	const [selectedOption, setSelectedOption] = useState(null);
	const [filterType, setFilterType] = useState(FilterTypes.TIME);
	const [day, setDay] = useState(null);
	const sections = ['Shacharis', 'Mincha', 'Maariv'];

	const formalizedData = useMemo(() => {
		let output = {};
		// const sectioned = sections.reduce((e) => {});
		if (filterType === FilterTypes.TIME) {
			output = shacharisData.reduce((acc, curr) => {
				const item = acc[curr.Time];
				const option = {
					...curr,
					label: curr.Shul
				};
				if (item) {
					item.push(option);
				} else {
					acc[curr.Time] = [option];
				}
				return acc;
			}, {});
		} else {
			output = shacharisData.reduce((acc, curr) => {
				const item = acc[curr.Shul];
				const option = {
					...curr,
					label: curr.Time
				};
				if (item) {
					item.push(option);
				} else {
					acc[curr.Shul] = [option];
				}
				return acc;
			}, {});
		}
		if (day) {
			for (const item in output) {
				const options = output[item];
				if (options?.length) {
					output[item] = output[item].filter((e) => e.Day === day);
				}
			}
		}
		return output;
	}, [filterType, day]);
	const days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];
	//{ ShacharisSponsor, MinchaSponsor, MaaricSponsor }
	return (
		<div className="flex-col w-fit">
			{/* <h1 className="text-xl font-bold">Hello World</h1> */}
			<pre className="overflow-auto w-96">{JSON.stringify(formalizedData)}</pre>
			<div className="flex my-3 justify-between">
				{days.map((e) => (
					<PillButton
						className={`${day === e ? 'bg-darkBlue text-bold' : ''}`}
						onClick={() => (day === e ? setDay(null) : setDay(e))}>
						{e}
					</PillButton>
				))}
			</div>
			<div className="self-center items-center flex text-xl text-darkBlue mt-4 mb-8 font-extrabold justify-center">
				<label htmlFor="filter">Filter:</label>
				<select
					id="location"
					name="location"
					className="bg-orange rounded-xl text-md px-6 py-4 text-white mx-2">
					<option value="first">Location</option>
				</select>
				<select
					id="Nusach"
					name="Nusach"
					className="bg-orange rounded-xl px-6 py-4 text-md text-white mx-2">
					<option value="first">Nusach</option>
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
				{sections.map((e, i) => (
					<div className=" w-1/3 flex font-extrabold  text-darkBlue flex-col  text-center mx-2 rounded-xl bg-lightBlue p-4">
						<h3 className=" my-2  text-2xl">{e}</h3>
						<PillButton className="my-2 px-8 text-white text-2xl font-extrabold">
							Sponsor
						</PillButton>
						{Object.keys(formalizedData).map((e) => (
							<Options
								value={selectedOption}
								onChange={setSelectedOption}
								options={formalizedData[e]}
								title={e}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}
