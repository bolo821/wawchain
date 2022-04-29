import axios from 'axios';

export const SET_AUTOCOMPLETE = 'SEARCH ACTION SET AUTO COMPLETE';

export const searchTokens = searchTerm => dispatch => {
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
                type: SET_AUTOCOMPLETE,
                payload: res.data,
            });
		}
	}).catch(err => {
		console.log('error: ', err);
	});
}