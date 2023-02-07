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
			<label htmlFor={props.id || props.name}>{label}</label>
			<div className="mt-1">
				<input
					{...props}
					className="mt-1 block w-full border-2 p-2 rounded-md border-gray-300 py-2 pl-3 pr-3 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
				/>
			</div>
		</div>
	);
}
