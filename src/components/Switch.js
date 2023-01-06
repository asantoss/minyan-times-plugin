import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { classNames } from '../utils';

export default function SwitchComponent({
	offText,
	onText,
	onChange,
	value,
	className = 'items-center'
}) {
	const [enabled, setEnabled] = useState(value || false);

	return (
		<div className={classNames('flex font-bold relative', className)}>
			<Switch.Group>
				<Switch.Label
					className={`absolute text-white text-sm text-center z-10  ${
						enabled ? 'left-6' : 'left-10'
					}`}>
					{enabled ? onText : offText}
				</Switch.Label>
				<Switch
					checked={enabled}
					onChange={(value) => {
						setEnabled(value);
						onChange && onChange(value);
					}}
					className={`${
						enabled ? 'bg-orange' : 'bg-darkBlue'
					} relative inline-flex h-10 w-28 items-center rounded-full z-0`}>
					<span
						className={`${
							enabled ? 'translate-x-20' : 'translate-x-1'
						} inline-block h-6 w-6  rounded-full bg-white transform transition ease-in-out duration-100`}
					/>
				</Switch>
			</Switch.Group>
		</div>
	);
}
