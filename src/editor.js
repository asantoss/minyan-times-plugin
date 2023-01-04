import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import settings from '../block.json';

registerBlockType('llc/minyan-times', {
	...settings,
	attributes: {
		ShacharisSponsor: { type: 'string' },
		MinchaSponsor: { type: 'string' },
		MaaricSponsor: { type: 'string' }
	},
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
					value={props.attributes.ShacharisSponsor}
					onChange={(value) =>
						updateAttribute({ target: { name: 'ShacharisSponsor', value } })
					}
					name="ShacharisSponsor"
					label="Shacharis Sponsor"
					placeholder="Shacharis Sponsor..."
				/>
				<TextControl
					className="p-2"
					type="text"
					value={props.attributes.MinchaSponsor}
					onChange={(value) =>
						updateAttribute({ target: { name: 'MinchaSponsor', value } })
					}
					name="MinchaSponsor"
					label="Mincha Sponsor"
					placeholder="Mincha Sponsor..."
				/>
				<TextControl
					className="p-2"
					type="text"
					value={props.attributes.MaaricSponsor}
					onChange={(value) =>
						updateAttribute({ target: { name: 'MaaricSponsor', value } })
					}
					name="MaaricSponsor"
					label="Maaric Sponsor"
					placeholder="Maaric Sponsor..."
				/>
			</div>
		</div>
	);
}
