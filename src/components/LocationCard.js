import React from 'react';
import {
	EnvelopeIcon,
	PencilIcon,
	PhoneIcon,
	TrashIcon,
	EllipsisVerticalIcon
} from '@heroicons/react/20/solid';
import { classNames } from '../utils';

function getRandomItem(arr) {
	// get random index value
	const randomIndex = Math.floor(Math.random() * arr.length);

	// get random item
	const item = arr[randomIndex];

	return item;
}

const bgs = ['bg-pink-600', 'bg-purple-600', 'bg-yellow-500', 'bg-green-500'];
export default function LocationCard({ location }) {
	return (
		<li key={location.id} className="col-span-1 flex rounded-md shadow-sm">
			{/* {JSON.stringify(location)} */}
			<div
				className={classNames(
					getRandomItem(bgs),
					'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
				)}>
				{location.name[0]}
			</div>
			<div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
				<div className="flex-1 truncate px-4 py-2 text-sm">
					<button className="font-medium text-gray-900 hover:text-gray-600">
						{location.name}
					</button>
					<p className="text-gray-500">
						{location.address}, {location.city}
					</p>
				</div>
				<div className="flex-shrink-0 pr-2">
					<button
						type="button"
						className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
						<span className="sr-only">Open options</span>
						<EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>
			</div>
		</li>
	);
}
