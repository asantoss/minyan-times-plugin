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
					const addressData = {};
					const full_address = '';
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
					editPost({
						meta: {
							...addressData,
							placeId: place.place_id,
							full_address: Object.values(addressData).join(', ')
						}
					});
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
		<div className="w-3/5 grid grid-cols-4 gap-2">
			<Input
				className="col-span-2"
				onChange={handleChange}
				value={meta?.rabbi}
				required
				name="rabbi"
				label="Rabbi"
			/>

			<div className="col-span-4">
				<label
					htmlFor="Address"
					className="block text-sm font-medium text-gray-700">
					Address
				</label>
				<input
					onChange={handleChange}
					ref={inputRef}
					value={meta?.address}
					name="address"
					className="mt-1 block w-full border-2 p-2 rounded-md border-gray-300 py-2 pl-3 pr-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
				/>
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
			<div className="col-span-4"></div>
			<Input
				onChange={handleChange}
				value={meta?.website}
				name="website"
				label="Website"
			/>
			<Input
				onChange={handleChange}
				value={meta?.email}
				name="email"
				label="Email"
			/>
			<Input
				onChange={handleChange}
				value={meta?.phone}
				name="phone"
				label="Phone"
			/>
		</div>
	);
}
