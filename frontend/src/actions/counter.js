export const SET_COUNT = 'COUNTER REDUCER SET COUNT';
export const DECREASE_COUNT = 'COUNTER REDUCER DECREASE COUNT';

export const setCount = (count) => {
	return {
		type: SET_COUNT,
		payload: count,
	}
}

export const decreaseCount = () => {
	return {
		type: DECREASE_COUNT,
	}
}