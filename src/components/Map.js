import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import GoogleMapReact from 'google-map-react';
export default function Map({ locations = [], zoomLevel = 16, apiKey }) {
	const url = new URL(`https://www.google.com/maps/dir/?api=1`);
	if (locations[0]) {
		url.searchParams.append(
			'destination',
			`${locations[0].lat},${locations[0].lng}`
		);
	}
	function LocationLink({ location }) {
		const url = new URL(`https://www.google.com/maps/dir/?api=1`);
		url.searchParams.append('destination', `${location.lat},${location.lng}`);
		return (
			<a href={url.href} target="_blank">
				{location.text}
			</a>
		);
	}
	return (
		<div className="map z-20">
			{locations.length === 1 && (
				<div className="text-left mb-2">
					<LocationLink location={locations[0]} />
				</div>
			)}
			<div className="h-80 w-96 max-w-screen-sm">
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
	<div className="pin h-16 ">
		<MapPinIcon className="text-red-600 w-8 h-12" />
	</div>
);
