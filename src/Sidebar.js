import { queryClient } from './utils';
import LocationMetadata from './components/LocationMetadata';
import { QueryClientProvider } from '@tanstack/react-query';

document.addEventListener('DOMContentLoaded', () => {
	const root = document.getElementById('mtp-plugin-sidebar');
	if (root) {
		const dataEl = root.querySelector('pre');

		if (dataEl) {
			const data = JSON.parse(root.querySelector('pre').innerText);
			ReactDOM.render(
				<div className="mtp-block">
					<QueryClientProvider client={queryClient}>
						<LocationMetadata
							googleKey={data.googleKey}
							// onSuccess={() => setIsOpen(false)}
						/>
					</QueryClientProvider>
				</div>,
				root
			);
		}
	}
});
