import { Dialog, Transition } from '@headlessui/react';
import { useEffect } from 'react';
import { Fragment, useState } from 'react';

export default function Modal({
	title,
	children,
	button,
	state = false,
	onClose
}) {
	let [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		setIsOpen(state);
	}, [state]);

	function closeModal() {
		setIsOpen(false);
		if (onClose) {
			onClose();
		}
	}

	function openModal() {
		setIsOpen(true);
	}

	return (
		<>
			{typeof button === 'function' ? (
				button({ setIsOpen, closeModal })
			) : (
				<button type="button" onClick={openModal}>
					{button}
				</button>
			)}

			<Transition appear show={isOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-20 mtp-block"
					open={isOpen}
					onClose={closeModal}>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0">
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95">
								<Dialog.Panel className="z-20 max-w-2xl transform overflow-hidden rounded-2xl bg-wpBg p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-lg font-medium leading-6 text-gray-900">
										{title}
									</Dialog.Title>
									<div className="mt-2">
										{typeof children == 'function'
											? children({ isOpen, setIsOpen })
											: children}
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
