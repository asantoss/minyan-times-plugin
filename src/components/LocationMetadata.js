import React, { useRef } from 'react';
import Input from './Input';
import { useSelect, useDispatch } from '@wordpress/data';

import useGoogleMapsApi from '../utils/hooks/useGoogleMapsApi';
import { useEffect } from 'react';

export default function LocationMetadata({ googleKey }) {
	const googleMapsApi = useGoogleMapsApi(googleKey);
	const autocompleteRef = useRef();
	const inputRef = useRef();
	const { editPost } = useDispatch('core/editor');
	const meta = useSelect(
		(select) => select('core/editor').getEditedPostAttribute('meta'),
		{}
	);
	useEffect(() => {
		if (googleMapsApi) {
			autocompleteRef.current = new googleMapsApi.places.Autocomplete(
				inputRef.current,
				{
					fields: ['address_components', 'geometry', 'place_id', 'name'],
					componentRestrictions: { country: 'us' }
				}
			);
			autocompleteRef.current.addListener('place_changed', () => {
				const place = autocompleteRef.current.getPlace();
				if (place.address_components?.length) {
					const addressData = { placeId: place.place_id };
					for (const component of place.address_components) {
						if (component.types?.length) {
							const componentType = component.types[0];
							const value = component.short_name;
							switch (componentType) {
								case 'street_number':
									addressData.address = value;
									break;
								case 'route': {
									addressData.address = `${addressData.address || ''} ${
										component.long_name
									}`;
									break;
								}
								case 'locality':
									addressData.city = value;
									break;
								case 'administrative_area_level_1':
									addressData.state = value;
								case 'postal_code':
									addressData.zipCode = value;
									break;
								default:
									break;
							}
						}
					}
					editPost({ meta: { ...addressData } });
				}
				if (place.geometry) {
					editPost({ meta: { geometry: JSON.stringify(place.geometry) } });
				}
			});
		}
	}, [googleMapsApi]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		editPost({
			meta: { [name]: value }
		});
	};

	return (
		<div className=" grid grid-cols-2 gap-1">
			<Input
				onChange={handleChange}
				value={meta?.rabbi}
				className="col-span-2"
				required
				name="rabbi"
				label="Rabbi"
			/>
			<div className="col-span-2">
				<label
					htmlFor="Address"
					className="block text-sm font-medium text-gray-700">
					Address
				</label>
				<div className="mt-1">
					<input
						onChange={handleChange}
						ref={inputRef}
						value={meta?.address}
						name="address"
						className="mt-1 block w-full border-2 p-2 rounded-md border-gray-300 py-2 pl-3 pr-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
					/>
				</div>
			</div>
			<Input
				onChange={handleChange}
				value={meta?.city}
				required
				name="city"
				label="City"
			/>
			<Input
				onChange={handleChange}
				value={meta?.state}
				name="state"
				label="State"
			/>
			<Input
				onChange={handleChange}
				value={meta?.zipCode}
				name="zipCode"
				label="Zip Code"
			/>
		</div>
	);
}
