import { useEffect, useState, useCallback } from 'react';
import loadScript from 'load-script';
import each from 'lodash/each';

var googleMapsApi;
var loading = false;
var callbacks = [];

const useGoogleMapsApi = (googleApiKey) => {
	const [, setApi] = useState();

	const callback = useCallback(() => {
		setApi(window.google.maps);
	}, []);

	useEffect(() => {
		if (loading) {
			callbacks.push(callback);
		} else {
			if (!googleMapsApi) {
				loading = true;
				loadScript(
					`https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`,
					{ async: true },
					() => {
						loading = false;
						googleMapsApi = window.google.maps;
						setApi(window.google.maps);
						each(callbacks, (init) => init());
						callbacks = [];
					}
				);
			}
		}
	}, []);

	return googleMapsApi;
};

export default useGoogleMapsApi;
