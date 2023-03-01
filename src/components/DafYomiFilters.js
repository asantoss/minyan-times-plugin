import React, { useCallback, useContext, useState } from 'react';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import Input from './Input';
import { debounce } from 'underscore';
import { useCitiesQuery, useShulQuery, useTeachersQuery } from '../utils';
import SwitchComponent from './Switch';
import Select from './Select';
export default function DafYomiFilters({}) {
	const [state, dispatch] = useContext(PrayerTimesContext);
	const citiesQuery = useCitiesQuery();
	const teacherQuery = useTeachersQuery({ city: state.city });
	const shulQuery = useShulQuery({ city: state.city });
	const [formValue, setFormValue] = useState({
		shul: state.shul,
		city: state.city,
		teacher: state.teacher,
		sortBy: state.sortBy
	});

	const debouncedCall = useCallback(
		debounce((e) => {
			const { name, value } = e.target;
			if (name === 'teacher') {
				dispatch({ type: 'SET_TEACHER', payload: value });
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
		500
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
			<fieldset className=" flex flex-wrap md:flex-row ml-auto ">
				{!teacherQuery.isLoading && teacherQuery.isSuccess && (
					<Select
						onChange={handleChange}
						className="w-full md:w-auto my-2 md:mr-2"
						label="Teacher"
						value={formValue.teacher}
						name="teacher"
						id="teacher">
						<option value="">All</option>
						{teacherQuery.data.map((teacher) => (
							<option value={teacher}>{teacher}</option>
						))}
					</Select>
				)}
				{!shulQuery.isLoading && shulQuery.isSuccess && (
					<Select
						onChange={handleChange}
						className="w-full md:w-auto my-2 md:mr-2"
						label="Shul"
						value={formValue.shul}
						name="shul"
						id="shul">
						<option value="">All</option>
						{shulQuery.data.map((shul) => (
							<option value={shul}>{shul}</option>
						))}
					</Select>
				)}

				{!citiesQuery.isLoading && citiesQuery.isSuccess && (
					<Select
						onChange={handleChange}
						className="w-full md:w-auto my-2 md:mr-2"
						label="City"
						value={formValue.city}
						name="city"
						id="city">
						{citiesQuery.data.map((city) => (
							<option value={city}>{city}</option>
						))}
					</Select>
				)}
			</fieldset>
		</div>
	);
}
