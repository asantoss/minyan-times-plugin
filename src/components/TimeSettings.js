import React from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import Button from './Button';
import TimeForm from './TimeForm';
import { convertTime, useDeleteTime, useTimesQuery } from '../utils';

export default function TimeSettings() {
	const { mutate: deleteItem } = useDeleteTime();
	const { isLoading, isError, data, error } = useTimesQuery();
	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (isError) {
		return <div>{JSON.stringify(error, null, 2)}</div>;
	}

	const columns = [
		{
			fieldName: 'location',
			label: 'Location'
		},
		{
			fieldName: 'nusach',
			label: 'Nusach'
		},
		{
			fieldName: 'day',
			label: 'Day'
		},
		{
			fieldName: 'time',
			label: 'Time',
			calculateDisplay(data) {
				return convertTime(data.time);
			}
		}
	];
	return (
		<DataTable data={data} columns={columns}>
			{({ item }) => (
				<>
					<Modal
						title="Edit Time"
						button={
							<button className="text-indigo-600 hover:text-indigo-900 ">
								Edit
								<span className="sr-only">,{item.location}</span>
							</button>
						}>
						{({ setIsOpen }) => (
							<TimeForm time={item} onSuccess={() => setIsOpen(false)} />
						)}
					</Modal>
					<Modal
						title="Delete Confirmation"
						button={
							<button className="text-red-600 hover:text-red-900 ml-2">
								Delete
								<span className="sr-only">,{item.location}</span>
							</button>
						}>
						{({ setIsOpen }) => (
							<div className="text-center w-full">
								<h1 className="text-xl">Removing this item is irreversible.</h1>
								<div className="flex justify-center  mt-4">
									<Button
										onClick={() => deleteItem(item.id)}
										className="bg-red-600 mr-2 text-white">
										Confirm
									</Button>
									<Button
										onClick={() => setIsOpen(false)}
										className="bg-green-600 text-white">
										Cancel
									</Button>
								</div>
							</div>
						)}
					</Modal>
				</>
			)}
		</DataTable>
	);
}
