import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export default function MyPopover({ title, options = [] }) {
	return (
		<Popover className="relative text-lg font-bold bg-white px-2 py-4 text-left my-2 rounded-lg">
			<Popover.Button className="flex justify-between w-full">
				<span>{title}</span>
				<ChevronDownIcon
					className={`${open ? '' : 'text-opacity-70'}
                  ml-2 h-8 w-8 text-darkBlue transition duration-150 ease-in-out`}
					aria-hidden="true"
				/>
			</Popover.Button>

			<Popover.Panel className="absolute z-10 w-full left-0 max-h-64 overflow-y-auto overscroll-y-contain">
				<div className="flex flex-col text-center bg-white pr-4 py-4 pl-2">
					{options.map((e, i) => {
						return (
							<button
								key={i}
								className="my-4 hover:bg-darkBlue hover:text-white">
								{e.label}
							</button>
						);
					})}
				</div>

				<img src="/solutions.jpg" alt="" />
			</Popover.Panel>
		</Popover>
	);
}
