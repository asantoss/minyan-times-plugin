import React, { useState } from 'react';
import {
	useQuery,
	useMutation,
	useQueryClient,
	QueryClient,
	QueryClientProvider
} from '@tanstack/react-query';
import LocationCard from './components/LocationCard';
import TimesTable from './components/TimesTable';
import Modal from './components/Modal';

import AddTimeForm from './components/AddTimeForm';
import { useLocationQuery, useTimesQuery } from './utils';

document.addEventListener('DOMContentLoaded', () => {
	const locationRoot = document.getElementById('minyan-location-settings');
	if (locationRoot) {
		ReactDOM.render(<SettingsPage />, locationRoot);
	} else {
		const timeRoot = document.getElementById('minyan-time-settings');
		if (timeRoot) {
			ReactDOM.render(<TimeSettings />, timeRoot);
		}
	}
});

const queryClient = new QueryClient();

function SettingsPage() {
	const handleCreateLocation = async (e) => {
		e.preventDefault();
		const response = await fetch('/wp-json/minyan-times/v1/locations', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				hello: 'world'
			})
		});
		const data = await response.json();

		console.log(data);
	};

	return (
		<QueryClientProvider client={queryClient}>
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<h1 className="text-2xl font-semibold text-gray-900">
							Minyan Times
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							A list of all the times in your account including their location,
							time, and nusach .
						</p>
					</div>
					<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
						<Modal title="Add Time" buttonColor="bg-darkBlue">
							<AddTimeForm />
						</Modal>
					</div>
				</div>

				<div className="flex items-start justify-center">
					<TimeSettings />
					<LocationsSettings />
				</div>
			</div>
		</QueryClientProvider>
	);
}
function TimeSettings() {
	const { isLoading, isError, data, error } = useTimesQuery();
	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (isError) {
		return <div>{JSON.stringify(error, null, 2)}</div>;
	}
	return <TimesTable times={data} />;
}
function LocationsSettings() {
	const { isLoading, isError, data, error } = useLocationQuery();
	if (isLoading) {
		return <div>Loading...</div>;
	}
	if (isError) {
		return <div>{JSON.stringify(error, null, 2)}</div>;
	}
	return (
		<ul
			role="list"
			className=" grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
			{data.map((e) => (
				<LocationCard location={e} />
			))}
		</ul>
	);
}
