import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import settings from '../block.json';

registerBlockType('llc/minyan-times', {
	...settings,

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
				<TextControl
					className="mr-3 p-2"
					type="text"
					value={props.attributes.Shacharis}
					onChange={(value) =>
						updateAttribute({ target: { name: 'Shacharis', value } })
					}
					name="Shacharis"
					label="Shacharis Sponsor"
					placeholder="Shacharis ..."
				/>
				<TextControl
					className="p-2"
					type="text"
					value={props.attributes.Mincha}
					onChange={(value) =>
						updateAttribute({ target: { name: 'Mincha', value } })
					}
					name="Mincha"
					label="Mincha Sponsor"
					placeholder="Mincha ..."
				/>
				<TextControl
					className="p-2"
					type="text"
					value={props.attributes.Maariv}
					onChange={(value) =>
						updateAttribute({ target: { name: 'Maariv', value } })
					}
					name="Maariv"
					label="Maariv Sponsor"
					placeholder="Maariv ..."
				/>
			</div>
		</div>
	);
}
