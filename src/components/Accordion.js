import { Transition } from '@headlessui/react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment, useContext } from 'react';
import {
	addMinutes,
	classNames,
	convertTime,
	formatTime,
	formatZman,
	useCityGeocodeData,
	useFilteredTimesQuery,
	useZmanimGPSData
} from '../utils';
import { jewishHolidays } from '../utils/enums';
import { PrayerTimesContext } from '../utils/hooks/usePrayerTimesReducer';

export default function Accordion({ title, options = [] }) {
	return (
		<Disclosure
			as="div"
			className={classNames(
				'md:relative text-sm font-bold px-1 py-2 text-left my-1 rounded-lg border-0 bg-white '
			)}>
			{({ open }) => (
				<>
					<Disclosure.Button
						as="span"
						className="flex cursor-pointer focus-visible:outline-none justify-between w-full text-darkBlue font-sans text-md font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue hover:bg-white active:border-0 focus:border-0">
						{title}
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : '  text-white',
								'ml-2 h-4 w-4 text-darkBlue active:border-0 transition duration-500 ease-out'
							)}
							aria-hidden="true"
						/>
					</Disclosure.Button>
					<Transition
						as={Fragment}
						show={open}
						enter="transition duration-500 ease-out"
						enterFrom="transform h-0 opacity-0"
						enterTo="transform opacity-100"
						leave="transition duration-500 ease-out"
						leaveFrom="transform  opacity-100"
						leaveTo="transform  h-0 opacity-0">
						<Disclosure.Panel className=" z-20 w-full  md:left-0   md:rounded-b-lg">
							<div className="flex flex-col text-left bg-white w-full">
								{options.map((e, i, arr) => {
									return (
										<a
											data-id={e.id}
											key={i}
											href={e.url}
											className={classNames(
												i > 0 && i < arr.length - 1 && 'border-b-2',
												i == 1 && 'border-t-2',
												'no-underline border-0 hover:text-orange py-2 cursor-pointer focus-visible:border-0 text-left text-darkBlue font-sans text-xs font-bold focus:bg-white focus:text-darkBlue bg-white hover:bg-white '
											)}>
											{e.label}
										</a>
									);
								})}
							</div>
						</Disclosure.Panel>
					</Transition>
				</>
			)}
		</Disclosure>
	);
}
