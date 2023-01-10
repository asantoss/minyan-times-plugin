import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../utils';

export default function Menu({ title, options = [] }) {
	return (
		<Popover
			className={classNames(
				'relative text-md font-bold p-2 text-left my-2 rounded-lg bg-white '
			)}>
			{({ open }) => (
				<>
					<Popover.Button className="flex justify-between w-full active:border-0">
						<span>{title}</span>
						<ChevronDownIcon
							className={classNames(
								open ? '' : 'text-opacity-70 bg-white text-white',
								'ml-2 h-8 w-8 text-darkBlue active:border-0 transition duration-150 ease-in-out'
							)}
							aria-hidden="true"
						/>
					</Popover.Button>
					<Popover.Panel className="absolute z-10 w-full left-0 max-h-64  border-b-2 rounded-b-lg border-gray-300 overflow-y-auto overscroll-y-contain">
						<div className="flex flex-col text-center bg-white w-full">
							{options.map((e, i) => {
								return (
									<button
										key={i}
										onClick={e.onClick}
										className="py-2 text-darkBlue  hover:bg-darkBlue hover:text-white">
										{e.label}
									</button>
								);
							})}
						</div>
					</Popover.Panel>
				</>
			)}
		</Popover>
	);
}
