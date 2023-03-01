import _ from 'lodash';
import { React, useContext } from 'react';
import {
	classNames,
	formatzManimData,
	getCityGeocode,
	useCityGeocodeData,
	useZmanimData,
	useZmanimGPSApi,
	useZmanimGPSData
} from '../utils';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';

export default function ZManimDisplay() {
	const [state] = useContext(PrayerTimesContext);
	const geocodeQuery = useCityGeocodeData(state.city);

	let Zmanim = useZmanimGPSData(
		state.date,
		geocodeQuery?.lat,
		geocodeQuery?.lng
	);
	if (!Zmanim) {
		return null;
	}
	const { Zman, Time } = formatzManimData(Zmanim);
	if (!Zman || !Time) {
		return null;
	}
	return (
		<div
			className={classNames(
				'relative grid grid-cols-2 gap-2 my-2 text-sm font-bold text-darkBlue md:flex py-4 justify-evenly font-sans'
			)}>
			{/* <pre>{JSON.stringify(zManimQueries)}</pre> */}
			<span>Sunrise: {Zman.SunriseDefault} </span>
			<span>Sunset: {Zman.SunsetDefault} </span>
			<span>Hebrew Date: {Time.DateJewishShort} </span>
			{Time.Parsha && <span>Parsha: {Time.Parsha} </span>}
			<span>Daf Yomi: {Time.DafYomi}</span>
		</div>
	);
}
