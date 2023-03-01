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
			<label htmlFor={props.id || props.name} className="font-bold block">
				{label}
			</label>
			<select
				{...props}
				className="w-full mt-1 border-2 py-2 rounded-md border-gray-300 px-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
				{children}
			</select>
		</div>
	);
}
