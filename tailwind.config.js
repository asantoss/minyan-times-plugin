module.exports = {
	content: ['./**/*.php', './src/**/*.js'],
	theme: {
		fontFamily: {
			sans: ['Open-Sans', 'sans'],
			serif: ['Merriweather', 'serif']
		},
		extend: {
			colors: {
				lightBlue: '#D5F1FF',
				normalBlue: '#2D9ACF',
				darkBlue: '#185989',
				orange: '#FF7108',
				wpBg: '#F0F0F1'
			},
			borderRadius: {
				lg: '0.5rem',
				xl: '0.75rem'
			},
			translate: {
				22: '5.5rem'
			}
		}
	}
};
