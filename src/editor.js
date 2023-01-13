import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import settings from '../block.json';
import { PrayerTypes } from './utils/enums';

registerBlockType('llc/minyan-times', {
	...settings,
	attributes: PrayerTypes.reduce((acc, curr) => {
		return {
			...acc,
			[curr]: {
				type: 'string'
			}
		};
	}, {}),
	edit: EditComponent,
	save: function () {
		return null;
	}
});

function EditComponent(props) {
	const blockProps = useBlockProps({
		className: 'shul-wrapper'
	});
	function updateAttribute(e) {
		const { name, value } = e.target;
		props.setAttributes({ [name]: value });
	}

	return (
		<div {...blockProps}>
			<div className="bg-blue-200 border border-blue-300 rounded-md p-5">
				{PrayerTypes.map((e) => (
					<TextControl
						className="mr-3 p-2"
						type="text"
						value={props.attributes[e]}
						onChange={(value) =>
							updateAttribute({ target: { name: e, value } })
						}
						name={e}
						label={`${e} Sponsor`}
						placeholder="Sponsor..."
					/>
				))}
			</div>
		</div>
	);
}
