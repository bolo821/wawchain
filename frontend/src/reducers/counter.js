import {
	SET_COUNT,
	DECREASE_COUNT,
} from '../actions/counter';

const defaultState = {
	count: 0,
}

export default (state = defaultState, action) => {
	switch (action.type) {
		case SET_COUNT:
			return {
				...state,
				count: action.payload,
			}
		case DECREASE_COUNT:
			return {
				...state,
				count: state.count-1
			}
		default:
			return state;
	}
};
  