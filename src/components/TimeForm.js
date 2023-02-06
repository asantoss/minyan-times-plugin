import React, { useState, useMemo } from 'react';
import { useLocationQuery, useTimeMutation } from '../utils';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import Switch from './Switch';
import Checkboxes from './Checkboxes';
import { days, FormulaTypes, NusachOptions, PrayerTypes } from '../utils/enums';
export default function TimeForm({ time, onSuccess }) {
	const locationQuery = useLocationQuery();
	const { mutate } = useTimeMutation(time?.id);
	const [timeData, setTimeData] = useState({
		...(time || {
			isCustom: 0
		})
	});
	const handleChange = (e) => {
		const { name, value } = e.target;
		setTimeData({
			...timeData,
			[name]: value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const body = new FormData();
		for (const key in timeData) {
			body.append(key, timeData[key]);
		}

		await mutate(body);
		if (onSuccess) {
			onSuccess();
		}
	};

	function handleChangeDay(value) {
		const selectedDays = days.filter((e) => value.includes(e));
		setTimeData({
			...timeData,
			day: selectedDays.join(', ')
		});
	}

	const nusachOptions = ['Sefarhadi', 'Asheknaz', 'Ari', 'Sefard'];
	const isCustom = useMemo(
		() => (timeData.isCustom ? Number(timeData.isCustom) : false),
		[timeData]
	);
	return (
		<div>
			<form
				onSubmit={handleSubmit}
				className="grid gap-4 grid-cols-3 p-4 bg-wpBg">
				<div className="self-end">
					<Switch
						value={isCustom}
						onChange={(val) => {
							setTimeData({ ...timeData, isCustom: val ? 1 : 0 });
						}}
						name="isCustom"
						offText="Normal"
						onText="Custom"
						zIndex="z-1"
					/>
				</div>
				{isCustom ? (
					<>
						<Input
							onChange={handleChange}
							value={timeData.minutes}
							required
							name="minutes"
							type="number"
							label="Minutes"
							disabled={
								timeData.formula &&
								Number(timeData.formula) === FormulaTypes.Midday
							}
						/>
						<Select
							onChange={handleChange}
							value={timeData.formula}
							required
							name="formula"
							label="Formula">
							{Object.keys(FormulaTypes).map((e) => (
								<option value={FormulaTypes[e]}>{e}</option>
							))}
						</Select>
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
					value={timeData.type}
					required
					name="type"
					label="Type">
					{PrayerTypes.map((e) => (
						<option key={e} value={e}>
							{e}
						</option>
					))}
				</Select>

				<Select
					onChange={handleChange}
					value={timeData.nusach}
					required
					name="nusach"
					label="Nusach">
					{nusachOptions.map((e) => (
						<option value={e} key={e}>
							{e}
						</option>
					))}
				</Select>
				{/* 
				!! DEPRECATED TABLE
				<Select
					onChange={handleChange}
					value={timeData.locationId}
					required
					name="locationId"
					label="Location">
					{locationQuery.data.map((e) => (
						<option key={e.id} value={e.id}>
							{e.name}
						</option>
					))}
				</Select> */}

				<Select
					onChange={handleChange}
					value={timeData.post_id}
					required
					name="post_id"
					label="Location">
					{locationQuery.data.map((e) => (
						<option key={e.ID} value={e.ID}>
							{e.post_title}
						</option>
					))}
				</Select>
				<Checkboxes
					className="row-span-2 row-start-2 col-start-3"
					label="Day"
					onChange={handleChangeDay}
					value={timeData.day}
					options={days.map((e) => ({ label: e, value: e }))}
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
