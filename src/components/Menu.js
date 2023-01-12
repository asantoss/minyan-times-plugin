import { Transition } from '@headlessui/react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { classNames } from '../utils';
import { List, AutoSizer } from 'react-virtualized';

export default function Menu({ title, options = [], className }) {
	const _rowRenderer = ({ index, key, close }) => {
		const row = options[index];

		return (
			<button
				key={key}
				onClick={() => {
					if (row.onClick) {
						row.onClick();
					}
					close();
				}}
				className="py-2 px-1 w-full focus-visible:border-0 text-left text-darkBlue font-sans text-lg font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue bg-white hover:bg-white border-0 ">
				{row.label}
			</button>
		);
	};
	return (
		<Popover
			className={classNames(
				' text-md font-bold p-2 text-left my-2 rounded-lg border-0 bg-white '
			)}>
			{({ open }) => (
				<>
					<Popover.Button className="flex focus-visible:outline-none justify-between w-full text-darkBlue font-sans text-lg font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue hover:bg-white active:border-0 focus:border-0">
						<span>{title}</span>
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : ' bg-white text-white',
								'ml-2 h-8 w-8 text-darkBlue active:border-0 transition duration-500 ease-out'
							)}
							aria-hidden="true"
						/>
					</Popover.Button>
					<Transition
						as={Fragment}
						enter="transition duration-500 ease-out"
						enterFrom="transform h-0 opacity-0"
						enterTo="transform  md:border-b-2 opacity-100"
						leave="transition duration-500 ease-out"
						leaveFrom="transform  md:border-b-2  opacity-100"
						leaveTo="transform  h-0 opacity-0">
						<Popover.Panel className="md:absolute relative z-20 w-full  md:left-0 max-h-64   md:rounded-b-lg m:dborder-gray-300 overflow-y-auto overscroll-y-contain">
							<div className="flex flex-col text-left bg-white w-full">
								{options.map((e, i) => {
									return (
										<button
											key={i}
											onClick={() => {
												if (e.onClick) {
													e.onClick();
												}
												close();
											}}
											className="py-2 px-1 focus-visible:border-0 text-left text-darkBlue font-sans text-lg font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue bg-white hover:bg-white border-0 ">
											{e.label}
										</button>
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
