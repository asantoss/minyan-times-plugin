import {
	QueryClient,
	useMutation,
	useQuery,
	useQueryClient
} from '@tanstack/react-query';
import axios from 'axios';

export function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}
const baseURL = wpApiSettings.root + 'minyan-times/v1';
const axiosClient = axios.create({
	baseURL,
	timeout: 30000,
	headers: { 'X-WP-Nonce': wpApiSettings.nonce }
});

export const queryClient = new QueryClient();
export function useLocationQuery() {
	return useQuery({
		queryKey: ['locations'],
		queryFn: async () => {
			try {
				const response = await axiosClient.get('/locations');
				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		}
	});
}

export function useDeleteTime() {
	return useMutation({
		mutationFn: async (id) => {
			try {
				const response = await axiosClient.delete('/times/' + id);
				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'times' });
		}
	});
}
export function useDeleteLocation() {
	return useMutation({
		mutationFn: async (id) => {
			try {
				const response = await axiosClient.delete('/locations/' + id);

				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'locations' });
		}
	});
}

export function useTimesQuery() {
	return useQuery({
		queryKey: ['times'],
		queryFn: async ({ queryKey }) => {
			try {
				let url = '/times';

				const response = await axiosClient.get(url);
				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		}
	});
}
export function useFilteredTimesQuery({ location, day, nusach, sortBy }) {
	return useQuery({
		queryKey: ['times', location, day, nusach, sortBy],
		queryFn: async ({ queryKey }) => {
			try {
				let url = '/times';
				const params = {
					locationId: location,
					day,
					nusach,
					sortBy
				};
				const response = await axiosClient.get(url, { params });
				return response.data;
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		}
	});
}
export function useTimeMutation(id) {
	return useMutation({
		mutationFn: async (body) => {
			try {
				if (id) {
					const response = await axiosClient.post('/times/' + id, body);
					return response.data;
				} else {
					const response = await axiosClient.post('/times', body);
					return response.data;
				}
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'times' });
		}
	});
}
export function useLocationMutation(id) {
	return useMutation({
		mutationFn: async (body) => {
			try {
				if (id) {
					const response = await axiosClient.post('/locations/' + id, body);
					return response.data;
				} else {
					const response = await axiosClient.post('/locations', body);
					return response.data;
				}
			} catch (error) {
				throw new Error('Network response was not ok');
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'locations' });
		}
	});
}

export function convertTime(timeString) {
	const splitString = timeString.split(':');
	const today = new Date();
	today.setHours(...splitString);
	let hours = today.getHours();
	const minutes = today.getMinutes();
	const suffix = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12 || 12;
	return hours + ':' + minutes + ' ' + suffix;
}
export function getHours(timeString) {
	const splitString = timeString.split(':');
	const today = new Date();
	today.setHours(...splitString);
	return today.getHours();
}
