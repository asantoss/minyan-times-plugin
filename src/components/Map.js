import React from 'react';
import { MapPinIcon } from '@heroicons/react/20/solid';
import GoogleMapReact from 'google-map-react';
export default function Map({ locations = [], zoomLevel = 15, apiKey }) {
	const url = new URL(`https://www.google.com/maps/dir/?api=1`);
	if (locations[0]) {
		url.searchParams.append(
			'destination',
			`${locations[0].lat},${locations[0].lng}`
		);
	}
	return (
		<div className="map">
			<div className="flex justify-end">
				<a href={url.href} target="_blank">
					Get Directions
				</a>
			</div>
			<div className="h-60 w-96">
				<GoogleMapReact
					bootstrapURLKeys={{ key: apiKey }}
					defaultCenter={locations[0]}
					defaultZoom={zoomLevel}>
					{locations.map((location) => (
						<LocationPin {...location} />
					))}
				</GoogleMapReact>
			</div>
		</div>
	);
}

const LocationPin = ({ text }) => (
	<div className="pin h-16 w-16">
		<MapPinIcon className="text-darkBlue w-8 h-12" />
		<p className="pin-text  w-full  font-bold text-lg text-darkBlue">{text}</p>
	</div>
);
