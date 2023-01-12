import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Fragment } from 'react';
import { classNames } from '../utils';

export default function FilterDropdown({ title, options = [], className }) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<Menu>
			{({ open, close }) => (
				<div
					className={classNames(
						' relative  p-2 font-sans font-normal text-sm text-left rounded-xl border-0',
						open ? 'bg-darkBlue' : 'bg-orange',
						className
					)}>
					<Menu.Button className={classNames('text-white flex items-center')}>
						{title}
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : '',
								'ml-2 h-8 w-8 text-white active:border-0 transition duration-500 ease-out'
							)}
							aria-hidden="true"
						/>
					</Menu.Button>
					<Transition
						show={open}
						as={Fragment}
						enter="transition duration-200 ease-in"
						enterFrom="transform h-0 opacity-50"
						enterTo="transform  opacity-100"
						leave="transition duration-200 ease-in"
						leaveFrom="transform   opacity-100"
						leaveTo="transform  h-0 opacity-50">
						<Menu.Items
							className={classNames(
								'absolute z-10 bg-darkBlue w-full left-0 max-h-64 rounded-b-lg border-gray-300 overflow-y-auto overscroll-y-contain',
								open ? ' text-white' : ''
							)}>
							{options.map((e, i) => (
								<Menu.Item>
									{({ active }) => (
										<button
											className={classNames(
												'py-2 px-1 w-full focus-visible:border-0 text-left bg-darkBlue text-white font-sans  focus:bg-darkBlue hover:opacity-60 focus:text-white hover:text-white hover:bg-darkBlue border-0 ',
												active ? 'opacity-50' : ''
											)}
											key={e.label}
											onClick={() => {
												if (e.onClick) {
													e.onClick();
												}
												close();
											}}>
											{e.label}
										</button>
									)}
								</Menu.Item>
							))}
						</Menu.Items>
						{/* <Menu.Items static>
								<Menu.Item></Menu.Item>
								
							</Menu.Items> */}
					</Transition>
				</div>
			)}
		</Menu>

		// <Popover
		// 	className={classNames(
		// 		'relative text-md font-bold p-2 text-left my-2 rounded-lg border-0'
		// 	)}>
		// 	{({ open, close }) => (
		// 		<>
		// 			<Popover.Button className="flex focus-visible:outline-none justify-between  w-full text-darkBlue font-sans text-lg font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue hover:bg-white active:border-0 focus:border-0">
		// 				<span>{title}</span>
		// 				<ChevronDownIcon
		// 					className={classNames(
		// 						open ? 'rotate-180' : ' text-white',
		// 						'ml-2 h-8 w-8 text-darkBlue active:border-0 transition duration-500 ease-out'
		// 					)}
		// 					aria-hidden="true"
		// 				/>
		// 			</Popover.Button>
		// 			<Transition
		// 				as={Fragment}
		// 				enter="transition duration-500 ease-out"
		// 				enterFrom="transform h-0 opacity-0"
		// 				enterTo="transform  border-b-2 opacity-100"
		// 				leave="transition duration-500 ease-out"
		// 				leaveFrom="transform  border-b-2  opacity-100"
		// 				leaveTo="transform  h-0 opacity-0">
		// 				<Popover.Panel className="absolute z-10  w-full left-0 max-h-64   rounded-b-lg border-gray-300 overflow-y-auto overscroll-y-contain">
		// 					<div className="flex flex-col text-left bg-white w-full">
		// 						{options.map((e, i) => {
		// 							return (
		// 								<button
		// 									key={i}
		// 									onClick={() => {
		// 										if (e.onClick) {
		// 											e.onClick();
		// 										}
		// 										close();
		// 									}}
		// 									className="py-2 px-1 w-full focus-visible:border-0 text-left text-darkBlue font-sans text-lg font-bold focus:bg-white focus:text-darkBlue hover:text-darkBlue bg-white hover:bg-white border-0 ">
		// 									{e.label}
		// 								</button>
		// 							);
		// 						})}
		// 					</div>
		// 				</Popover.Panel>
		// 			</Transition>
		// 		</>
		// 	)}
		// </Popover>
	);
}
