import React, { useCallback, useContext } from 'react';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import FilterDropdown from './FilterDropdown';
import Input from './Input';
import { debounce } from 'underscore';
import { NusachOptions } from '../utils/enums';
import { useCitiesQuery } from '../utils';
import SwitchComponent from './Switch';
export default function SearchFilters({}) {
	const [state, dispatch] = useContext(PrayerTimesContext);
	const citiesQuery = useCitiesQuery();

	const debouncedCall = useCallback(
		debounce((e) => {
			const { name, value } = e.target;
			if (name === 'rabbi') {
				dispatch({ type: 'SET_RABBI', payload: value });
			}
			if (name === 'shul') {
				dispatch({ type: 'SET_SHUL', payload: value });
			}
		}),
		300
	);

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
			<fieldset className="flex flex-wrap md:flex-row ml-auto ">
				<Input
					onChange={debouncedCall}
					id="shul"
					name="shul"
					className="mr-2"
					label="Shul"
				/>
				<Input
					className="mr-2"
					onChange={debouncedCall}
					id="rabbi"
					name="rabbi"
					label="Rabbi"
				/>
				{!citiesQuery.isLoading && citiesQuery.isSuccess && (
					<div className="mr-2">
						<label htmlFor="city">City:</label>
						<FilterDropdown
							id="city"
							name="city"
							title={state.city}
							options={citiesQuery.data.map((city) => ({
								label: city,
								onClick() {
									dispatch({
										type: 'SET_CITY',
										payload: city
									});
								}
							}))}
							className="w-32 "
						/>
					</div>
				)}
				<div className="">
					<label htmlFor="nusach">Nusach:</label>
					<FilterDropdown
						id="Nusach"
						name="Nusach"
						title={state.nusach ?? 'All'}
						options={[
							{
								label: 'All',
								onClick: () => dispatch({ type: 'SET_NUSACH', payload: null })
							},
							...NusachOptions.map((e) => ({
								label: e,
								onClick() {
									dispatch({ type: 'SET_NUSACH', payload: e });
								}
							}))
						]}
						className="w-32"
					/>
				</div>
			</fieldset>
		</div>
	);
}
