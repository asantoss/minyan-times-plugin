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
export default function Select({ label, children, className, ...props }) {
	return (
		<div className={className}>
			<label
				htmlFor={props.id || props.name}
				className="block text-sm font-medium text-gray-700">
				{label}
			</label>
			<select
				{...props}
				className={classNames(
					'mt-1 block w-full border-2 p-2 rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
				)}>
				<option>---</option>
				{children}
			</select>
		</div>
	);
}
