import { React } from 'react';
import { classNames, formatzManimData, useZmanimApi } from '../utils';
import Spinner from './Spinner';

export default function ZManimDisplay({ Zmanim }) {
	if (!Zmanim) {
		return null;
	}
	const { Zman, Time } = formatzManimData(Zmanim);
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
