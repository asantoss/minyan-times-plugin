import React from 'react';
import { useLocationQuery, useTimeMutation } from '../utils';
import Input from './Input';
import Button from './Button';
import Select from './Select';
export default function AddTimeForm() {
	const { data } = useLocationQuery();
	const { mutate } = useTimeMutation();
	const handleSubmit = (e) => {
		e.preventDefault();
		const body = new FormData(e.target);
		mutate(body);
		window.alert('Success!');
		e.target.reset();
	};
	return (
		<div>
			<form onSubmit={handleSubmit} className="grid grid-cols-2 p-4 bg-white">
				<Input required name="time" type="time" label="Time" />
				<Select required name="nusach" label="Nusach">
					<option value="Ashkenaz">Ashkenaz</option>
					<option value="Sefard">Sefard</option>
				</Select>
				<Select
					className="col-span-2 my-4"
					required
					name="locationId"
					label="Location">
					{data.map((e) => (
						<option key={e.id} value={e.id}>
							{e.name}
						</option>
					))}
				</Select>
				<Button type="submit" className="col-start-2 mt-4 justify-self-center">
					Submit
				</Button>
			</form>
		</div>
	);
}
