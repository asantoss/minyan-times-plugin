import React from 'react';
import {
	QueryClient,
	QueryClientProvider,
	useMutation
} from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import Modal from './components/Modal';
import Button from './components/Button';
import LocationsSettings from './components/LocationsSettings';
import TimeSettings from './components/TimeSettings';
import TimeForm from './components/TimeForm';
import {
	classNames,
	queryClient,
	useLocationQuery,
	useTimesQuery
} from './utils';
import LocationForm from './components/LocationForm';

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

function SettingsPage() {
	return (
		<QueryClientProvider client={queryClient}>
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<h1 className="text-2xl font-semibold text-gray-900">
							Minyan Times Plugin Settings
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							A list of all the times in your account including their location,
							time, and nusach.
						</p>
					</div>
				</div>
				<div className="w-full px-2 py-16 sm:px-0 mx-auto">
					<Tab.Group>
						<Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
							<Tab
								className={({ selected }) =>
									classNames(
										'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
										'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
										selected
											? 'bg-white shadow'
											: 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
									)
								}>
								Locations
							</Tab>
							<Tab
								className={({ selected }) =>
									classNames(
										'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
										'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
										selected
											? 'bg-white shadow'
											: 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
									)
								}>
								Times
							</Tab>
						</Tab.List>
						<Tab.Panels>
							<Tab.Panel
								className={classNames(
									'rounded-xl bg-white p-3',
									'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
								)}>
								<div className="flex flex-col">
									<span className="ml-auto mt-2 text-right pr-4">
										<Modal
											title="Add Location"
											button={
												<Button className="rounded-md bg-blue-700 ml-auto my-2 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
													Add Location
												</Button>
											}>
											{({ setIsOpen }) => (
												<LocationForm onSuccess={() => setIsOpen(false)} />
											)}
										</Modal>
									</span>
									<LocationsSettings />
								</div>
							</Tab.Panel>
							<Tab.Panel
								className={classNames(
									'rounded-xl bg-white p-3',
									'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
								)}>
								<div className="flex flex-col">
									<span className="ml-auto mt-2 text-right pr-4">
										<Modal
											title="Add Time"
											button={
												<Button className="rounded-md bg-blue-700 ml-auto my-2 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
													Add Time
												</Button>
											}>
											{({ setIsOpen }) => (
												<TimeForm onSuccess={() => setIsOpen(false)} />
											)}
										</Modal>
									</span>
									<TimeSettings />
								</div>
							</Tab.Panel>
						</Tab.Panels>
					</Tab.Group>
				</div>
			</div>
		</QueryClientProvider>
	);
}
