import React, { useState, useMemo } from 'react';
import { useLocationQuery, useTimeMutation } from '../utils';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import SwitchComponent from './Switch';
import Checkboxes from './Checkboxes';
export default function TimeForm({ time, onSuccess }) {
	const { data } = useLocationQuery();
	const { mutate } = useTimeMutation(time?.id);
	const [timeData, setTimeData] = useState({
		...(time || {
			isCustom: 1
		})
	});
	const handleChange = (e) => {
		const { name, value } = e.target;
		setTimeData({
			...timeData,
			[name]: value
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const body = new FormData();

		for (const key in timeData) {
			body.append(key, timeData[key]);
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
		'Sunday'
	];
	const isCustom = useMemo(
		() => (timeData.isCustom ? Number(timeData.isCustom) : false),
		[timeData]
	);
	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="grid gap-4 grid-cols-3 p-4 bg-white">
				<SwitchComponent
					value={isCustom}
					onChange={(val) => {
						setTimeData({ ...timeData, isCustom: val ? 1 : 0 });
					}}
					name="isCustom"
					offText="Normal"
					onText="Neitz"
				/>
				{isCustom ? (
					<>
						<Select
							onChange={handleChange}
							value={timeData.formula}
							required
							name="formula"
							label="Formula">
							<option value="before">Before</option>
							<option value="after">After</option>
						</Select>
						<Input
							onChange={handleChange}
							value={timeData.minutes}
							required
							name="minutes"
							type="number"
							label="Minutes"
						/>
					</>
				) : (
					<Input
						onChange={handleChange}
						value={timeData.time}
						required
						name="time"
						type="time"
						label="Time"
					/>
				)}
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

				{/* value={timeData.type} */}

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
					className="col-start-3 row-start-1"
					required
					name="locationId"
					label="Location">
					{data.map((e) => (
						<option key={e.id} value={e.id}>
							{e.name}
						</option>
					))}
				</Select>
				<Checkboxes
					className="row-span-2 row-start-2 col-start-3"
					label="Type"
					onChange={(value) =>
						handleChange({ target: { name: 'type', value } })
					}
					value={timeData.type}
					options={[
						{ label: 'Shacharis', value: 'Shacharis' },

						{ label: 'Mincha', value: 'Mincha' },
						{ label: 'Maariv', value: 'Maariv' }
					]}
				/>

				<div className="col-span-3 flex items-end">
					<Button type="submit" className=" mt-4 ml-auto   bg-blue-600">
						Submit
					</Button>
				</div>
			</form>
		</div>
	);
}
