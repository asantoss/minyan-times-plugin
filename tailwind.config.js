module.exports = {
	content: ['./**/*.php', './src/**/*.js'],
	important: '.mtp-block',
	theme: {
		fontFamily: {
			sans: ['Open Sans', 'sans'],
			serif: ['Merriweather', 'serif']
		},
		extend: {
			colors: {
				lightBlue: '#D5F1FF',
				normalBlue: '#2D9ACF',
				darkBlue: '#185989',
				elementorPrimary: '#3499cd',
				orange: '#FF7108',
				wpBg: '#F0F0F1'
			},
			borderWidth: {
				1: '1px'
			},
			borderRadius: {
				lg: '0.5rem',
				xl: '0.75rem'
			},
			translate: {
				21: '5.25rem',
				22: '5.5rem',
				13: '50px'
			},
			fontSize: {
				xss: '0.5rem'
			}
		}
	}
};
