import { classNames } from '../utils';

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function Checkboxes({
	label,
	onChange,
	options,
	value = '',
	className
}) {
	function handleChange(e) {
		const { name, checked } = e.target;
		let currentValue = (value || '').split(', ');

		if (checked) {
			currentValue = [...currentValue, name];
		} else {
			currentValue = currentValue.filter((e) => e !== name);
		}
		const dataSet = new Set(currentValue.filter((e) => e && e !== 'null'));
		onChange(Array.from(dataSet).join(', '));
	}
	const inputVal = (val) => {
		if (!value) {
			return false;
		}
		if (typeof value === 'string') {
			return value.includes(val);
		}
	};
	return (
		<fieldset className={classNames('space-y-5 flex', className)}>
			<legend className="font-bold">{label}</legend>
			{options.map((e, i) => (
				<div className="relative border-r-2 items-start">
					<div className="border-b-2 px-2 text-center font-bold text-sm">
						<label htmlFor={e.value} className="font-medium text-gray-900">
							{e.label}
						</label>
						{e.description && (
							<p id={`${e.label}-description`} className="text-gray-900">
								{e.description}
							</p>
						)}
					</div>
					<div className="flex justify-center p-4  items-center">
						<input
							id={e.value}
							aria-describedby={`${e.label}-description`}
							checked={inputVal(e.value)}
							value={inputVal(e.value)}
							onChange={handleChange}
							name={e.value}
							type="checkbox"
							className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
						/>
					</div>
				</div>
			))}
		</fieldset>
	);
}
