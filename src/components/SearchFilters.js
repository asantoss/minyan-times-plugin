import React, { useCallback, useContext, useMemo } from 'react';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';
import FilterDropdown from './FilterDropdown';
import Input from './Input';
import { debounce } from 'lodash';
import { NusachOptions } from '../utils/enums';
import { useLocationQuery } from '../utils';
import SwitchComponent from './Switch';
export default function SearchFilters() {
	const [state, dispatch] = useContext(PrayerTimesContext);
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
						onChange={(e) => dispatch({ type: 'SET_SORTBY', payload: e })}
						onText="Times"
						className="m-2"
					/>
				</div>
			</div>
			<fieldset className=" grid grid-cols-2 gap-2 ml-auto ">
				<Input
					onChange={debouncedCall}
					id="shul"
					name="shul"
					className="md:mx-2"
					label="Shul"
				/>
				<Input onChange={debouncedCall} id="rabbi" name="rabbi" label="Rabbi" />
				<div className="md:mx-2">
					<label htmlFor="location">Location:</label>
					<FilterDropdown
						id="location"
						name="location"
						title={state.city}
						options={(Object.keys(cityOptions) ?? []).map((e) => ({
							label: cityOptions[e].city,
							onClick() {
								const { city, zipCode } = cityOptions[e];
								dispatch({
									type: 'SET_CITY',
									payload: { city, zipCode }
								});
							}
						}))}
						className=""
					/>
				</div>
				<div className="md:mx-2">
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
						className=""
					/>
				</div>
			</fieldset>
		</div>
	);
}
