import { formatTime, queryClient } from './utils';
import LocationMetadata from './components/LocationMetadata';
import { QueryClientProvider } from '@tanstack/react-query';
import TimeSettings from './components/TimeSettings';
import Modal from './components/Modal';
import TimeForm from './components/TimeForm';
import Button from './components/Button';
const listFormatter = new Intl.ListFormat('lookup', {
	style: 'short',
	type: 'conjunction'
});

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('mtp-plugin-sidebar');
	if (root) {
		const dataEl = root.querySelector('pre');
		const columns = [
			{
				fieldName: 'nusach',
				label: 'Nusach'
			},
			{
				fieldName: 'day',
				label: 'Day',
				calculateDisplay({ day }) {
					return typeof day === 'string'
						? listFormatter.format(day.split(','))
						: day;
				}
			},
			{
				fieldName: 'time',
				label: 'Time',
				calculateDisplay: formatTime
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
				fieldName: 'type',
				label: 'Type'
			}
		];
		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<div className="mtp-block">
					<QueryClientProvider client={queryClient}>
						<div className="p-8 flex flex-col">
							<LocationMetadata googleKey={data.googleKey} />
							<div className="ml-auto mt-2 text-left">
								<Modal
									title="Add Time"
									button={({ setIsOpen }) => (
										<>
											<Button
												onClick={() => setIsOpen(true)}
												className="rounded-md bg-blue-700 ml-auto my-2 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
												Add Time
											</Button>
										</>
									)}>
									{({ setIsOpen }) => (
										<TimeForm
											postId={data.id}
											onSuccess={() => setIsOpen(false)}
										/>
									)}
								</Modal>
							</div>
							<TimeSettings columns={columns} postId={data.id} />
						</div>
					</QueryClientProvider>
				</div>,
				root
			);
		}
	}
});
