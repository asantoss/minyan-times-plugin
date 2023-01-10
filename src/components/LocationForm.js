import React, { useState } from 'react';
import { useGeocodeApi, useLocationMutation } from '../utils';
import Input from './Input';
import Button from './Button';
export default function LocationForm({ location, onSuccess, googleKey }) {
	const { mutate } = useLocationMutation(location?.id);
	const [locationData, setLocationData] = useState({ ...(location || {}) });
	const geocodeQuery = useGeocodeApi({
		googleKey,
		location: locationData,
		enabled: false
	});
	const handleChange = (e) => {
		const { name, value } = e.target;
		setLocationData({
			...locationData,
			[name]: value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const body = new FormData(e.target);
		if (location?.id) {
			body.append('id', location.id);
		}
		const { data, isSuccess } = await geocodeQuery.refetch();
		if (isSuccess) {
			if (Array.isArray(data.results) && data.results?.length === 1) {
				const targetResult = data.results[0];
				if (targetResult?.geometry?.location) {
					const { lat, lng } = targetResult.geometry.location;
					body.append('lat', lat);
					body.append('lng', lng);
				}
				if (targetResult?.place_id) {
					body.append('place_id', targetResult.place_id);
				}
			}
		}
		await mutate(body);
		onSuccess && onSuccess();
	};

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="grid gap-4 grid-cols-4 p-4 bg-wpBg">
				<Input
					className="col-span-4"
					autoFocus
					onChange={handleChange}
					value={locationData.name}
					required
					name="name"
					label="Name"
				/>
				<Input
					onChange={handleChange}
					value={locationData.address}
					required
					className="col-span-2"
					name="address"
					label="Address"
				/>
				<Input
					onChange={handleChange}
					value={locationData.city}
					required
					name="city"
					label="City"
				/>
				<Input
					onChange={handleChange}
					value={locationData.state}
					required
					name="state"
					label="State"
				/>
				<Input
					onChange={handleChange}
					value={locationData.zipCode}
					required
					name="zipCode"
					label="Zip Code"
				/>

				<div className="col-span-4 flex justify-end mt-4">
					<Button type="submit" className=" bg-blue-600">
						Submit
					</Button>
				</div>
			</form>
		</div>
	);
}
