import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';
import { classNames } from '../utils';

export default function TimesCard({ title, children, isOpen = false }) {
	const [open, setOpen] = useState(isOpen);
	return (
		<div
			className={classNames(
				'w-full md:w-1/4',
				'md:relative mb-2 md:min-h-full flex font-extrabold  text-darkBlue flex-col  text-center mx-2 rounded-xl bg-lightBlue p-2'
			)}>
			<span
				onClick={() => setOpen(!open)}
				className="md:hidden inline-flex text-xs">
				{title}
				<ChevronDownIcon
					className={classNames(
						open ? 'rotate-180' : '  text-white',
						' h-4 w-4 ml-auto text-darkBlue active:border-0 transition duration-500 ease-out'
					)}
					aria-hidden="true"
				/>
			</span>
			<span className="hidden md:inline-block my-2">{title}</span>
			<div className={classNames(open ? '' : 'hidden md:block')}>
				{children}
			</div>
		</div>
	);
}
