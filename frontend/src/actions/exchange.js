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
			let term = searchTerm.toLowerCase();
			if ('cronos'.includes(term) || process.env.REACT_APP_NATIVE_COIN_ADDRESS.toLowerCase().includes(term)) {
				dispatch({
					type: SET_FROM_AUTOCOMPLETE,
					payload: { ...res.data, '-1': { token_id: process.env.REACT_APP_NATIVE_COIN_ADDRESS, content: { name: 'Cronos', symbol: 'CRO' } } },
				});
				return;
			}
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
			let term = searchTerm.toLowerCase();
			if ('cronos'.includes(term) || process.env.REACT_APP_NATIVE_COIN_ADDRESS.toLowerCase().includes(term)) {
				dispatch({
					type: SET_TO_AUTOCOMPLETE,
					payload: { ...res.data, '-1': { token_id: process.env.REACT_APP_NATIVE_COIN_ADDRESS, content: { name: 'Cronos', symbol: 'CRO' } } },
				});
				return;
			}

			dispatch({
                type: SET_TO_AUTOCOMPLETE,
                payload: res.data,
            });
		}
	}).catch(err => {
		console.log('error: ', err);
	});
}

export const getTokensInWallet = walletAddress => dispatch => {
	axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/search/${walletAddress}`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(res => {
	}).catch(err => {
		console.log('error: ', err);
	});
}