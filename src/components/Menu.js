import { Transition } from '@headlessui/react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { classNames } from '../utils';

export default function Menu({ title, options = [] }) {
	return (
		<Popover
			as="div"
			className={classNames(
				'md:relative text-sm font-bold p-1 text-left my-1 rounded-lg border-0 bg-white '
			)}>
			{({ open }) => (
				<>
					<Popover.Button
						as="span"
						className="flex cursor-pointer  focus-visible:outline-none justify-between w-full text-darkBlue font-sans text-md font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue hover:bg-white active:border-0 focus:border-0">
						<span>{title}</span>
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : ' bg-white text-white',
								'ml-2 h-4 w-4 text-darkBlue active:border-0 transition duration-500 ease-out'
							)}
							aria-hidden="true"
						/>
					</Popover.Button>
					<Transition
						as={Fragment}
						enter="transition duration-500 ease-out"
						enterFrom="transform h-0 opacity-0"
						enterTo="transform opacity-100"
						leave="transition duration-500 ease-out"
						leaveFrom="transform  opacity-100"
						leaveTo="transform  h-0 opacity-0">
						<Popover.Panel className="relative z-20 w-full  md:left-0   md:rounded-b-lg">
							<div className="flex flex-col text-left bg-white w-full">
								{options.map((e, i) => {
									return (
										<span
											data-id={e.id}
											key={i}
											onClick={() => {
												if (e.onClick) {
													e.onClick();
												}
											}}
											className="hover:text-orange py-2 cursor-pointer px-1 focus-visible:border-0 text-left text-darkBlue font-sans text-md font-bold focus:bg-white focus:text-darkBlue  bg-white hover:bg-white border-0 ">
											{e.label}
										</span>
									);
								})}
							</div>
						</Popover.Panel>
					</Transition>
				</>
			)}
		</Popover>
	);
}
