import { Transition } from '@headlessui/react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { classNames } from '../utils';

export default function Accordion({ title, children }) {
	return (
		<Disclosure>
			{({ open }) => (
				<>
					<Disclosure.Button className="py-1 rounded-xl flex text-center min-h-fit text-xs my-2">
						<span>{title}</span>
						<ChevronDownIcon
							className={classNames(
								open ? 'rotate-180' : '  text-white',
								' h-6 w-6 ml-auto text-darkBlue active:border-0 transition duration-500 ease-out'
							)}
							aria-hidden="true"
						/>
					</Disclosure.Button>
					<Transition
						enter="transition duration-100 ease-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0">
						<Disclosure.Panel className="text-gray-500">
							{children}
						</Disclosure.Panel>
					</Transition>
				</>
			)}
		</Disclosure>
	);
}
