import { useState } from 'react';
import { Switch } from '@headlessui/react';

export default function SwitchComponent({ offText, onText, onChange, value }) {
	const [enabled, setEnabled] = useState(value || false);

	return (
		<div className="flex items-start  font-bold relative">
			<Switch.Group>
				<Switch.Label
					className={`absolute text-white text-xl text-center z-10 top-3 ${
						enabled ? 'left-6' : 'right-10'
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
					} relative inline-flex h-14 w-36 items-center rounded-full z-0`}>
					<span
						className={`${
							enabled ? 'translate-x-22' : 'translate-x-1'
						} inline-block h-12 w-12  rounded-full bg-white transform transition ease-in-out duration-100`}
					/>
				</Switch>
			</Switch.Group>
		</div>
	);
}
