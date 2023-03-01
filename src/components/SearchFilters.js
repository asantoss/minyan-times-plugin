import React, { useCallback, useContext, useState } from 'react';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import { debounce } from 'underscore';
import { NusachOptions } from '../utils/enums';
import { useCitiesQuery, useRabbiQuery, useShulQuery } from '../utils';
import SwitchComponent from './Switch';
import Select from './Select';
export default function SearchFilters({}) {
	const [state, dispatch] = useContext(PrayerTimesContext);
	const citiesQuery = useCitiesQuery();
	const shulsQuery = useShulQuery({ city: state.city });
	const rabbisQuery = useRabbiQuery({ city: state.city });
	const [formValue, setFormValue] = useState({
		shul: state.shul,
		city: state.city,
		teacher: state.teacher
	});
	const debouncedCall = useCallback(
		debounce((e) => {
			const { name, value } = e.target;
			if (name === 'rabbi') {
				dispatch({ type: 'SET_RABBI', payload: value });
			}
			if (name === 'shul') {
				dispatch({ type: 'SET_SHUL', payload: value });
			}

			if (name === 'city') {
				dispatch({ type: 'SET_TEACHER', payload: '' });
				dispatch({ type: 'SET_SHUL', payload: '' });
				dispatch({ type: 'SET_CITY', payload: value });
			}
			if (name === 'nusach') {
				dispatch({ type: 'SET_NUSACH', payload: value });
			}
		}),
		300
	);

	function handleChange(e) {
		const { name, value } = e.target;
		setFormValue({
			[name]: value
		});
		debouncedCall(e);
	}

	return (
		<div className="md:self-center md:w-full sm:items-center items-start flex flex-col sm:flex-row text-sm text-darkBlue mt-4 mb-8 font-bold md:justify-center">
			<div className="mr-auto">
				<div>
					<label htmlFor="sort" className="mx-4 hidden md:block">
						Sort By:
					</label>
					<SwitchComponent
						offText="Shul"
						value={state.sortBy ? true : false}
						onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e })}
						onText="Times"
						className="mx-2"
					/>
				</div>
			</div>
			<fieldset className="flex items-start flex-wrap md:flex-row ml-auto ">
				{!rabbisQuery.isLoading &&
					rabbisQuery.isSuccess &&
					rabbisQuery.data?.length > 0 && (
						<Select
							onChange={handleChange}
							className="w-full md:w-auto my-2  md:mr-2"
							label="Rabbi"
							value={formValue.rabbi}
							name="rabbi"
							id="rabbi">
							<option value="">All</option>
							{rabbisQuery.data.map((rabbi) => (
								<option value={rabbi}>{rabbi}</option>
							))}
						</Select>
					)}
				{!shulsQuery.isLoading && shulsQuery.isSuccess && (
					<Select
						onChange={handleChange}
						className="w-full md:w-auto my-2  md:mr-2"
						label="Shul"
						value={formValue.shul}
						name="shul"
						id="shul">
						<option value="">All</option>
						{shulsQuery.data.map((shul) => (
							<option value={shul}>{shul}</option>
						))}
					</Select>
				)}
				{!citiesQuery.isLoading && citiesQuery.isSuccess && (
					<Select
						onChange={handleChange}
						className="w-full md:w-auto my-2  md:mr-2"
						label="City"
						value={formValue.city}
						name="city"
						id="city">
						{citiesQuery.data.map((city) => (
							<option value={city}>{city}</option>
						))}
					</Select>
				)}
				<Select
					onChange={handleChange}
					value={formValue.nusach}
					className="w-full md:w-auto my-2  "
					label="Nusach"
					id="nusach"
					name="nusach">
					<option value="">All</option>
					{NusachOptions.map((e) => (
						<option value={e}>{e}</option>
					))}
				</Select>
			</fieldset>
		</div>
	);
}
