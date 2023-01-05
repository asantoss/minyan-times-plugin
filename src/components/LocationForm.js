import React, { useState } from 'react';
import { useLocationMutation } from '../utils';
import Input from './Input';
import Button from './Button';
export default function LocationForm({ location, onSuccess }) {
	const { mutate } = useLocationMutation(location?.id);
	const [locationData, setLocationData] = useState({ ...(location || {}) });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setLocationData({
			...locationData,
			[name]: value
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const body = new FormData(e.target);
		if (location?.id) {
			body.append('id', location.id);
		}
		mutate(body);
		onSuccess && onSuccess();
	};

	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="grid gap-4 grid-cols-2 p-4 bg-white">
				<Input
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

				<Button
					type="submit"
					className="col-start-2 mt-4 justify-self-center bg-blue-600">
					Submit
				</Button>
			</form>
		</div>
	);
}
