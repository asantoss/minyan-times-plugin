import { createContext, useReducer } from 'react';
import { getWeekday, startDate } from '..';
import { ViewTypes } from '../enums';

const initialState = {
	city: 'Baltimore',
	zipCode: '21209',
	nusach: null,
	sortBy: ViewTypes.TIME,
	date: startDate,
	rabbi: '',
	shul: '',
	currentTimeRecord: {}
};

function reducer(state = initialState, action) {
	const { type, payload } = action;
	switch (type) {
		case 'SET_CITY':
			state = {
				...state,
				...payload
			};
			break;
		case 'SET_NUSACH':
			state = {
				...state,
				nusach: payload
			};
			break;
		case 'SET_SORT_BY':
			state = {
				...state,
				sortBy: payload
			};
			break;
		case 'SET_DATE':
			state = {
				...state,
				date: payload,
				day: getWeekday(payload)
			};
			break;
		case 'SET_RABBI':
			state = {
				...state,
				rabbi: payload
			};
			break;
		case 'SET_SHUL':
			state = {
				...state,
				shul: payload
			};
			break;
		case 'SET_TIME_RECORD':
			state = {
				...state,
				currentTimeRecord: payload
			};
			break;
	}
	return state;
}

export const PrayerTimesContext = createContext(initialState);

export default function () {
	const [state, dispatch] = useReducer(reducer, initialState);

	return [state, dispatch];
}
