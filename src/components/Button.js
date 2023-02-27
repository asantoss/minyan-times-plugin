import { classNames } from '../utils';
export default function Example({
	variant,
	color = 'indigo',
	className,
	children,
	...props
}) {
	switch (variant) {
		case 'xs':
			return (
				<button
					{...props}
					type="button"
					className={classNames(
						`inline-flex items-center rounded border border-transparent bg-${color}-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`,
						className
					)}>
					{children}
				</button>
			);
		case 'small':
			return (
				<button
					type="button"
					{...props}
					className={classNames(
						`inline-flex items-center rounded-md border border-transparent bg-${color}-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`,
						className
					)}>
					{children}
				</button>
			);

		case 'large':
			return (
				<button
					type="button"
					{...props}
					className={classNames(
						`inline-flex items-center rounded-md border border-transparent bg-${color}-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`,
						className
					)}>
					{children}
				</button>
			);
		case 'xl':
			<button
				type="button"
				{...props}
				className={classNames(
					`inline-flex items-center rounded-md border border-transparent bg-${color}-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`,
					className
				)}>
				{children}
			</button>;

		default:
			return (
				<button
					type="button"
					{...props}
					className={classNames(
						`inline-flex items-center rounded-md border border-transparent bg-${color}-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-${color}-500 focus:ring-offset-2`,
						className
					)}>
					{children}
				</button>
			);
	}
}
