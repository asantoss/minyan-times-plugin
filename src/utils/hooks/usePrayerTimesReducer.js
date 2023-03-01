import { createContext, useReducer } from 'react';
import { getNextSetOfDays, getWeekday, startDate } from '..';
import { ViewTypes } from '../enums';

const initialState = {
	city: 'Baltimore',
	zipCode: '21209',
	nusach: null,
	sortBy: ViewTypes.TIME,
	date: startDate,
	rabbi: '',
	shul: '',
	teacher: '',
	currentTimeRecord: {},
	postId: null,
	week: getNextSetOfDays(startDate, 6)
};

function reducer(state = initialState, action) {
	const { type, payload } = action;
	switch (type) {
		case 'SET_CITY':
			state = {
				...state,
				city: payload
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
		case 'SET_WEEK':
			state = {
				...state,
				week: payload
			};
			break;
		case 'SET_RABBI':
			state = {
				...state,
				rabbi: payload
			};
			break;
		case 'SET_TEACHER':
			state = {
				...state,
				teacher: payload
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

export const PrayerTimesContext = createContext([initialState]);

export default function (props) {
	const [state, dispatch] = useReducer(reducer, { ...initialState, ...props });

	return [state, dispatch];
}
