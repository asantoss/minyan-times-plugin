import React from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import Button from './Button';
import TimeForm from './TimeForm';
import { formatTime, useDeleteTime, useTimesQuery } from '../utils';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
const defaultCol = [
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
		fieldName: 'effectiveOn',
		label: 'Effective'
	},
	{
		fieldName: 'expiresOn',
		label: 'Expires'
	},
	{
		fieldName: 'time',
		label: 'Time',
		calculateDisplay: formatTime
	},
	{
		fieldName: 'type',
		label: 'Type'
	}
];
export default function TimeSettings({ postId, columns = defaultCol }) {
	const { mutate: deleteItem } = useDeleteTime();
	const { isLoading, isError, data, error } = useTimesQuery(postId);
	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (isError) {
		return <div>{JSON.stringify(error, null, 2)}</div>;
	}

	return (
		<DataTable data={data} columns={columns}>
			{({ item }) => (
				<>
					<Modal
						title="Edit Time"
						button={
							<button
								type="button"
								className="text-indigo-600 mr-2 hover:text-indigo-900 ">
								<PencilSquareIcon className="h-4 w-4" />
								<span className="sr-only">Edit</span>
							</button>
						}>
						{({ setIsOpen }) => (
							<TimeForm
								postId={postId}
								time={item}
								onSuccess={() => setIsOpen(false)}
							/>
						)}
					</Modal>
					<Modal
						title="Delete Confirmation"
						button={
							<button
								type="button"
								className="text-red-600 hover:text-red-900 ml-2">
								<TrashIcon className="h-4 w-4" />
								<span className="sr-only">Delete</span>
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
