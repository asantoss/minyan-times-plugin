import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export function useLocationQuery() {
	return useQuery({
		queryKey: ['locations'],
		queryFn: async () => {
			const response = await fetch('/wp-json/minyan-times/v1/locations');
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		}
	});
}

export function useTimesQuery() {
	return useQuery({
		queryKey: ['times'],
		queryFn: async () => {
			const response = await fetch('/wp-json/minyan-times/v1/times');
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		}
	});
}
export function useTimeMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (body) => {
			const response = await fetch('/wp-json/minyan-times/v1/times', {
				method: 'POST',
				body
			});
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: 'times' });
		}
	});
}
