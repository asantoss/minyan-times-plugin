import React from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import GoogleMapReact from 'google-map-react';
export default function Map({ pins = [], zoomLevel = 12, apiKey, bounds }) {
	const url = new URL(`https://www.google.com/maps/dir/?api=1`);
	if (pins[0]) {
		url.searchParams.append('destination', `${pins[0].lat},${pins[0].lng}`);
	}
	function PinLink({ pin }) {
		const url = new URL(`https://www.google.com/maps/dir/?api=1`);
		url.searchParams.append('destination', `${pin.lat},${pin.lng}`);
		return (
			<a href={url.href} target="_blank">
				{pin.text}
			</a>
		);
	}
	return (
		<div className="map z-20">
			{pins.length === 1 && (
				<div className="text-left mb-2">
					<PinLink pin={pins[0]} />
				</div>
			)}
			<div className="h-80 w-96 max-w-screen-sm">
				<GoogleMapReact
					onGoogleApiLoaded={({ map, maps }) => {
						map.fitBounds(bounds);
					}}
					bootstrapURLKeys={{ key: apiKey }}
					defaultCenter={pins[0]}
					defaultZoom={zoomLevel}>
					{pins.map((pin) => (
						<Pin {...pin} />
					))}
				</GoogleMapReact>
			</div>
		</div>
	);
}

const Pin = () => (
	<div className="pin h-16 ">
		<MapPinIcon className="text-red-600 w-8 h-12" />
	</div>
);
