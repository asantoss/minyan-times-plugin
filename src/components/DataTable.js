import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';

export default function DateTable({ data = [], columns = [], children }) {
	const getValue = (column, data) => {
		if (typeof column.calculateDisplay === 'function') {
			return column.calculateDisplay(data);
		}
		return data[column.fieldName];
	};

	return (
		<div className=" flex flex-col">
			<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
					<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
						<table className="min-w-full divide-y divide-gray-300">
							<thead className="bg-gray-50">
								<tr>
									{columns.map((column, i) => (
										<th
											key={column.label + i}
											scope="col"
											className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6">
											{column.label}
										</th>
									))}

									<th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
										<span className="sr-only">Action</span>
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200 bg-white">
								{data.map((item) => (
									<tr key={item.id}>
										{columns.map((column, i) => {
											if (i === 0) {
												return (
													<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
														{getValue(column, item)}
													</td>
												);
											}
											return (
												<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
													{getValue(column, item)}
												</td>
											);
										})}

										<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
											{typeof children === 'function'
												? children({ item })
												: children}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
