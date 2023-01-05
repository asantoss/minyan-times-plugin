import React, { useState } from 'react';
import { useLocationQuery, useTimeMutation } from '../utils';
import Input from './Input';
import Button from './Button';
import Select from './Select';
export default function TimeForm({ time, onSuccess }) {
	const { data } = useLocationQuery();
	const { mutate } = useTimeMutation(time?.id);
	const [timeData, setTimeData] = useState({ ...(time || {}) });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setTimeData({
			...timeData,
			[name]: value
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const body = new FormData(e.target);
		if (time?.id) {
			body.append('id', time.id);
		}
		mutate(body);
		onSuccess && onSuccess();
	};
	const days = [
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
		'Sunday'
	];
	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="grid gap-4 grid-cols-2 p-4 bg-white">
				<Input
					onChange={handleChange}
					value={timeData.time}
					required
					name="time"
					type="time"
					label="Time"
				/>
				<Select
					onChange={handleChange}
					value={timeData.nusach}
					required
					name="nusach"
					label="Nusach">
					<option value="Ashkenaz">Ashkenaz</option>
					<option value="Sefard">Sefard</option>
				</Select>
				<Select
					onChange={handleChange}
					value={timeData.locationId}
					className=" "
					required
					name="locationId"
					label="Location">
					{data.map((e) => (
						<option key={e.id} value={e.id}>
							{e.name}
						</option>
					))}
				</Select>
				<Select
					onChange={handleChange}
					value={timeData.day}
					className=" "
					required
					name="day"
					label="Day">
					{days.map((e) => (
						<option key={e} value={e}>
							{e}
						</option>
					))}
				</Select>
				<Button
					type="submit"
					className="col-start-2 mt-4 justify-self-center bg-blue-600">
					Submit
				</Button>
			</form>
		</div>
	);
}
