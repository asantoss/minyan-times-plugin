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
export default function Input({ label, className, ...props }) {
	return (
		<div className={className}>
			<label className="font-bold block" htmlFor={props.id || props.name}>
				{label}
			</label>
			<input
				{...props}
				className="mt-1 w-full border-2 py-2 rounded-md border-gray-300 px-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			/>
		</div>
	);
}
