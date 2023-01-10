import { React } from 'react';
import { formatzManimData } from '../utils';

export default function ZManimDisplay({ thirdPartyData }) {
	const { Zman } = formatzManimData(JSON.parse(thirdPartyData ?? '{}')) ?? {};
	return (
		<span className="inline-flex justify-between text-sm">
			<span>
				<b>Sunset: </b>
				{Zman.SunsetDefault}
			</span>
			<span className="mx-2">
				<b>Sunrise: </b>
				{Zman.SunriseDefault}
			</span>
		</span>
	);
}
