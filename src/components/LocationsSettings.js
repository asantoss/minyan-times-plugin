import React from 'react';
import { useDeleteLocation, useLocationQuery } from '../utils';
import DateTable from './DataTable';
import Modal from './Modal';
import Button from './Button';
import LocationForm from './LocationForm';
import ZManimDisplay from './ZManimDisplay';
import Spinner from './Spinner';

export default function LocationsSettings({ googleKey }) {
	const { isLoading, isError, data, error } = useLocationQuery();
	const { mutate: deleteItem } = useDeleteLocation();

	if (isError) {
		return <div>{JSON.stringify(error, null, 2)}</div>;
	}
	const columns = [
		{
			label: 'Name',
			fieldName: 'name'
		},
		{
			label: 'Address',
			fieldName: 'address'
		},
		{
			label: 'City',
			fieldName: 'city'
		},
		{
			label: 'State',
			fieldName: 'state'
		}
	];
	return (
		<div className="relative flex h-full items-center justify-center">
			<div
				className={
					'absolute w-full h-full bg-black/25 ' + isLoading ? '' : 'hidden'
				}>
				<Spinner isLoading={isLoading} className="m-auto" />
			</div>
			<div className="w-full">
				<DateTable data={data ?? []} columns={columns}>
					{({ item }) => (
						<>
							<Modal
								title="Edit Location"
								button={
									<button className="text-indigo-600 mr-4 hover:text-indigo-900 ">
										Edit
										<span className="sr-only">,{item.name}</span>
									</button>
								}>
								{({ setIsOpen }) => (
									<LocationForm
										googleKey={googleKey}
										location={item}
										onSuccess={() => setIsOpen(false)}
									/>
								)}
							</Modal>
							<Modal
								title="Delete Confirmation"
								button={
									<button className="text-red-600 hover:text-red-900 ml-2">
										Delete
										<span className="sr-only">,{item.name}</span>
									</button>
								}>
								{({ setIsOpen }) => (
									<div className="text-center w-full">
										<h1 className="text-xl">
											Removing this location is irreversible and will remove any
											times associated to it. <br /> Are you sure?
										</h1>

										<div className="flex justify-center mt-4">
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
				</DateTable>
			</div>
		</div>
	);
}
