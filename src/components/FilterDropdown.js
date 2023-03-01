import { Menu } from '@headlessui/react';
import { Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { classNames } from '../utils';

export default function FilterDropdown({ title, options = [], className }) {
	const availableOptions = options.filter((e) => e?.label !== title);
	return (
		<Menu>
			{({ open, close }) => (
				<div
					className={classNames(
						' relative  p-2 font-sans  font-normal text-sm text-left rounded-xl border-0',
						open ? 'bg-darkBlue' : 'bg-orange',
						className
					)}>
					<Menu.Button
						as="span"
						className={classNames(
							'text-white cursor-pointer  focus-visible:outline-none  flex items-center justify-between'
						)}>
						{title}
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : '',
								'ml-2 h-4 w-4 text-white active:border-0 transition duration-500 ease-out'
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
								'absolute z-20 focus-visible:outline-none bg-darkBlue w-full left-0 max-h-64 rounded-b-lg border-gray-300 overflow-y-auto overscroll-y-contain',
								open ? ' text-white' : ''
							)}>
							{availableOptions.length ? (
								availableOptions.map(
									(e, i) =>
										e.label !== title && (
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
														{e.label ?? 'All'}
													</button>
												)}
											</Menu.Item>
										)
								)
							) : (
								<Menu.Item>
									{({ active }) => (
										<button
											className={classNames(
												'py-2 px-1 w-full focus-visible:border-0 text-left bg-darkBlue text-white font-sans  focus:bg-darkBlue hover:opacity-60 focus:text-white hover:text-white hover:bg-darkBlue border-0 '
											)}>
											No Options
										</button>
									)}
								</Menu.Item>
							)}
						</Menu.Items>
					</Transition>
				</div>
			)}
		</Menu>
	);
}
