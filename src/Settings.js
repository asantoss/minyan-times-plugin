import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Tab } from '@headlessui/react';
import Modal from './components/Modal';
import Button from './components/Button';
import LocationsSettings from './components/LocationsSettings';
import TimeSettings from './components/TimeSettings';
import TimeForm from './components/TimeForm';
import {
	classNames,
	exportToCsv,
	formatTime,
	queryClient,
	useTimesQuery
} from './utils';
import LocationForm from './components/LocationForm';

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('mtp-plugin');
	if (root) {
		const dataEl = root.querySelector('pre');
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<div className="mtp-block">
					<QueryClientProvider client={queryClient}>
						<SettingsPage {...data} />
					</QueryClientProvider>
				</div>,
				root
			);
		}
	}
});

function SettingsPage({ googleKey }) {
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
				<Tab.Group>
					<Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
						<Tab
							className={({ selected }) =>
								classNames(
									'w-full rounded-lg py-2.5 text-md font-bold text-black  ',
									'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
									selected
										? 'bg-wpBg shadow text-blue-700'
										: 'text-blue-100 hover:bg-white/[0.12] hover:text-black'
								)
							}>
							Locations
						</Tab>
						<Tab
							className={({ selected }) =>
								classNames(
									'w-full rounded-lg py-2.5 text-md text-black  font-bold  ',
									'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
									selected
										? 'bg-wpBg shadow text-blue-700'
										: 'text-blue-100 hover:bg-white/[0.12] hover:text-black'
								)
							}>
							Times
						</Tab>
					</Tab.List>
					<Tab.Panels>
						<Tab.Panel
							className={classNames(
								'rounded-xl bg-wpBg p-3',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
							)}>
							<div className="flex flex-col">
								<div className="ml-auto mt-2 text-right pr-4">
									<Modal
										title="Add Location"
										button={({ setIsOpen }) => (
											<div className="py-2 px-3 ">
												<Button
													onClick={() => setIsOpen(true)}
													className="rounded-lg bg-blue-700   px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
													Add Location
												</Button>
											</div>
										)}>
										{({ setIsOpen }) => (
											<LocationForm
												googleKey={googleKey}
												onSuccess={() => setIsOpen(false)}
											/>
										)}
									</Modal>
								</div>
								<LocationsSettings googleKey={googleKey} />
							</div>
						</Tab.Panel>
						<Tab.Panel
							className={classNames(
								'rounded-xl bg-wpBg p-3',
								'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
							)}>
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
												{!timesQuery.isLoadn && (
													<Button
														onClick={handleTimeExport}
														className="rounded-md bg-blue-700 my-2 ml-4 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
														Export To CSV
													</Button>
												)}
											</>
										)}>
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
	);
}
