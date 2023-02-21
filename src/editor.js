import { TextControl } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import settings from '../block.json';
import { PrayerTypes } from './utils/enums';
import ErrorBoundary from './components/ErrorBoundary';

registerBlockType('llc/minyan-times', {
	...settings,
	attributes: PrayerTypes.reduce((acc, curr) => {
		return {
			...acc,
			[curr]: {
				type: 'object',
				default: {
					url: 'https://www.amfcreative.com/',
					img: 'https://www.amfcreative.com/wp-content/uploads/2020/10/icon.png'
				}
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
	function updateAttribute(attribute, update) {
		const { name, value } = update;
		props.setAttributes({
			...props.attributes,
			[attribute]: { ...props.attributes[attribute], [name]: value }
		});
	}

	return (
		<div {...blockProps}>
			<ErrorBoundary>
				<div className="bg-blue-200 border border-blue-300 rounded-md p-5">
					{PrayerTypes.map((e) => (
						<fieldset>
							<legend>{e} Sponsor</legend>
							<TextControl
								className="p-2"
								type="text"
								value={props.attributes[e].img}
								onChange={(value) => updateAttribute(e, { name: 'img', value })}
								name="img"
								label="Logo"
								placeholder="Image url..."
							/>
							<TextControl
								className="p-2"
								type="text"
								value={props.attributes[e].url}
								onChange={(value) => updateAttribute(e, { name: 'url', value })}
								name="url"
								label="URL"
								placeholder="Url..."
							/>
						</fieldset>
					))}
				</div>
			</ErrorBoundary>
		</div>
	);
}
