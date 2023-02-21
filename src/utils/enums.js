export const ViewTypes = {
	TIME: true,
	SHUL: false
};

export const FormulaTypes = {
	'Before Sunset': 1,
	'After Sunset': 2,
	'Before Sunrise': 3,
	'After Sunrise': 4,
	'Midday': 5
};

export const formulaLabels = Object.keys(FormulaTypes).reduce(
	(acc, e) => ({ ...acc, [[FormulaTypes[e]]]: e }),
	{}
);

export const days = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday'
];

export const PrayerTypes = ['Shacharis', 'Mincha', 'Mincha/Maariv', 'Maariv'];

export const NusachOptions = ['Ari', 'Asheknaz', 'Sefarhadi', 'Sefard'];
export const SKIP_DAYS = [6]; //Skip Saturday
export const jewishHolidays = [
	'IsAsaraBiteves',
	'IsCholHamoed',
	'IsErevPesach',
	'IsErevShabbos',
	'IsErevTishaBav',
	'IsErevYomKipper',
	'IsErevYomTov',
	'IsFastDay',
	'IsRoshChodesh',
	'IsShabbos',
	'IsShivaAsarBitammuz',
	'IsTaanisEsther',
	'IsTishaBav',
	'IsTuBeshvat',
	'IsTzomGedalia',
	'IsYomKipper',
	'IsYomTov'
];
