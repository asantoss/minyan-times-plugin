import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import Modal from './components/Modal';
import Button from './components/Button';
import TimeSettings from './components/TimeSettings';
import TimeForm from './components/TimeForm';
import {
	axiosClient,
	exportToCsv,
	formatTime,
	queryClient,
	useTimesQuery
} from './utils';
import ErrorBoundary from './components/ErrorBoundary';

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('mtp-plugin');
	if (root) {
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<div className="mtp-block">
					<ErrorBoundary>
						<QueryClientProvider client={queryClient}>
							<SettingsPage {...data} />
						</QueryClientProvider>
					</ErrorBoundary>
				</div>,
				root
			);
		}
	}
});

function SettingsPage() {
	const timesQuery = useTimesQuery();
	function handleTimeExport() {
		const today = new Date();
		const fileName = `${today.getFullYear()}-${
			today.getMonth() + 1
		}-${today.getDate()}_times.csv`;
		const data = timesQuery.data.map((item) => {
			const { location, type, day, nusach } = item;
			return {
				location,
				time: formatTime(item),
				day: `"${day}"`,
				nusach,
				type
			};
		});
		exportToCsv(fileName, data);
	}
	function handleMigration() {
		axiosClient.post('/migrate');
	}

	return (
		<div className="px-4 sm:px-6 lg:px-8">
			<div className="sm:flex sm:items-center">
				<div className="sm:flex-auto">
					<div className="flex justify-between">
						<h1 className="text-2xl font-semibold text-gray-900">
							Minyan Times Plugin Settings
						</h1>
					</div>
					<p className="mt-2 text-sm text-gray-700">
						A list of all the times in your account including their location,
						time, and nusach.
					</p>
				</div>
			</div>
			<div className="w-full px-2 py-16 sm:px-0 mx-auto">
				<div className="flex flex-col">
					<span className="ml-auto mt-2 text-right pr-4">
						<Modal
							title="Add Time"
							button={({ setIsOpen }) => (
								<>
									<Button
										onClick={() => setIsOpen(true)}
										className="rounded-md bg-blue-700 ml-auto my-2 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
										Add Time
									</Button>
									{!timesQuery.isLoading && (
										<Button
											onClick={handleTimeExport}
											className="rounded-md bg-blue-700 my-2 ml-4 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
											Export To CSV
										</Button>
									)}
									<Button
										onClick={handleMigration}
										className="rounded-md bg-blue-700 my-2 ml-4 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
										Migrate
									</Button>
								</>
							)}>
							{({ setIsOpen }) => (
								<TimeForm onSuccess={() => setIsOpen(false)} />
							)}
						</Modal>
					</span>
					<TimeSettings />
				</div>
			</div>
		</div>
	);
}
