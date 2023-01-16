import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { classNames } from '../utils';

export default function SwitchComponent({
	offText,
	onText,
	onChange,
	value,
	className,
	zIndex
}) {
	const [enabled, setEnabled] = useState(value || false);

	return (
		<div className={classNames(className)}>
			<div className="relative max-w-max min-w-fit qcursor-pointer  flex items-center ">
				<Switch.Group>
					<Switch.Label
						className={classNames(
							`absolute text-white cursor-pointer w-full text-sm text-center z-10`
						)}>
						{enabled ? onText : offText}
					</Switch.Label>
					<Switch
						as="span"
						checked={enabled}
						onChange={(value) => {
							setEnabled(value);
							onChange && onChange(value);
						}}
						className={classNames(
							enabled ? 'bg-orange' : 'bg-darkBlue',
							'relative inline-flex cursor-pointer  h-8 w-28 items-center rounded-full',
							zIndex || '-z-10'
						)}>
						<span
							className={`${
								enabled ? 'translate-x-21' : 'translate-x-1'
							} inline-block focus-visible:outline-none h-6 w-6  rounded-full bg-white transform transition ease-in-out duration-100`}
						/>
					</Switch>
				</Switch.Group>
			</div>
		</div>
	);
}
