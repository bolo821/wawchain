import axios from 'axios';

export const SET_FROM_AUTOCOMPLETE = 'EXCHANGE ACTION SET FROM AUTO COMPLETE';
export const SET_TO_AUTOCOMPLETE = 'EXCHANGE ACTION SET TO AUTO COMPLETE';

export const searchFromAutocomplete = searchTerm => dispatch => {
	axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/search`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			searchTerm,
		}
	}).then(res => {
		if (res && res.data) {
			dispatch({
                type: SET_FROM_AUTOCOMPLETE,
                payload: res.data,
            });
		}
	}).catch(err => {
		console.log('error: ', err);
	});
}

export const searchToAutocomplete = searchTerm => dispatch => {
	axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/search`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			searchTerm,
		}
	}).then(res => {
		if (res && res.data) {
			dispatch({
                type: SET_TO_AUTOCOMPLETE,
                payload: res.data,
            });
		}
	}).catch(err => {
		console.log('error: ', err);
	});
}