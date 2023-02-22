import React, { useState, useMemo } from 'react';
import { useLocationQuery, useTimeMutation } from '../utils';
import { TextareaControl } from '@wordpress/components';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import Checkboxes from './Checkboxes';
import {
	days,
	FormulaTypes,
	jewishHolidays,
	NusachOptions,
	PrayerTypes
} from '../utils/enums';
import { XMarkIcon } from '@heroicons/react/24/solid';
export default function TimeForm({ time, onSuccess, postId }) {
	const locationQuery = useLocationQuery();
	const { mutate } = useTimeMutation(time?.id);
	const [timeData, setTimeData] = useState({
		isCustom: 0,
		post_id: postId,
		IsAsaraBiteves: 0,
		IsCholHamoed: 0,
		IsErevPesach: 0,
		IsErevShabbos: 0,
		IsErevTishaBav: 0,
		IsErevYomKipper: 0,
		IsErevYomTov: 0,
		IsFastDay: 0,
		IsRoshChodesh: 0,
		IsShabbos: 0,
		IsShivaAsarBitammuz: 0,
		IsTaanisEsther: 0,
		IsTishaBav: 0,
		IsTuBeshvat: 0,
		IsTzomGedalia: 0,
		IsYomKipper: 0,
		IsYomTov: 0,
		notes: '',
		...(time || {})
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
		const body = new FormData(e.target);
		const payload = new FormData();
		for (const key in timeData) {
			if (body.has(key) && timeData[key]) {
				payload.set(key, timeData[key]);
			}
		}
		if (time && time?.id) {
			payload.set('id', time.id);
		}
		if (postId) {
			payload.set('post_id', postId);
		}
		await mutate(payload);
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
	function handleChangeHoliday(event) {
		const { name, value } = event.target;
		setTimeData({
			...timeData,
			[name]: value === 'true' ? 1 : 0
		});
	}

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
					<Select
						label="Controller"
						value={timeData.isCustom}
						onChange={handleChange}
						name="isCustom">
						<option value="0">Normal</option>
						<option value="1">Custom</option>
					</Select>
				</div>
				{isCustom ? (
					<>
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
					<option value="Daf Yomi">Daf Yomi</option>
				</Select>
				{!!timeData.type && timeData.type === 'Daf Yomi' && (
					<Input
						onChange={handleChange}
						value={timeData.teacher}
						name="teacher"
						label="Teacher"
						required
					/>
				)}
				<Select
					onChange={handleChange}
					value={timeData.nusach}
					required
					name="nusach"
					label="Nusach">
					<option value="all">All</option>
					{NusachOptions.map((e) => (
						<option value={e} key={e}>
							{e}
						</option>
					))}
				</Select>

				<Select
					onChange={handleChange}
					value={timeData.post_id}
					required
					disabled={!!postId}
					name="post_id"
					label="Location">
					{(locationQuery.data ?? []).map((e) => (
						<option key={e.ID} value={e.ID}>
							{e.post_title}
						</option>
					))}
				</Select>
				<Checkboxes
					className="col-span-3"
					label="Day"
					name="day"
					onChange={handleChangeDay}
					value={timeData.day}
					options={days.map((e) => ({ label: e, value: e }))}
				/>

				<div className="flex items-center">
					<Input
						name="effectiveOn"
						type="date"
						label="Effective On"
						onChange={handleChange}
						value={timeData.effectiveOn}
					/>
					<button
						type="button"
						className="p-2 mt-6"
						onClick={() =>
							handleChange({ target: { name: 'effectiveOn', value: '' } })
						}>
						<XMarkIcon className="h-6 w-6" />
					</button>
				</div>
				<div className="flex items-center">
					<Input
						name="expiresOn"
						type="date"
						label="Expires On"
						onChange={handleChange}
						value={timeData.expiresOn}
					/>
					<button
						type="button"
						className=" p-2 mt-6"
						onClick={() =>
							handleChange({ target: { name: 'expiresOn', value: '' } })
						}>
						<XMarkIcon className="h-6 w-6 font-bold" />
					</button>
				</div>
				<div className="col-span-3">
					<TextareaControl
						type="textarea"
						rows="5"
						name="notes"
						label="Notes"
						onChange={(value) =>
							handleChange({ target: { value, name: 'notes' } })
						}
						value={timeData.notes}
					/>
				</div>
				<div className="col-span-3 grid grid-cols-3 text-center">
					{jewishHolidays.map((e) => (
						<Input
							type="checkbox"
							key={e + timeData?.id}
							label={e}
							name={e}
							onChange={handleChangeHoliday}
							className="my-2 justify-between items-center"
							checked={Number(timeData[e]) !== 1}
							value={Number(timeData[e]) !== 1}></Input>
					))}
				</div>

				<div className="col-span-3 flex items-end">
					<Button type="submit" className=" mt-4 ml-auto   bg-blue-600">
						Submit
					</Button>
				</div>
			</form>
		</div>
	);
}
