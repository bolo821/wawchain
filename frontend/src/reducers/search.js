import { SET_AUTOCOMPLETE } from '../actions/search';

const defaultState = {
    autoComplete: [],
}

const search = (state = defaultState, action) => {
    switch (action.type) {
        case SET_AUTOCOMPLETE: {
            let newVal = [];
            for (let i in action.payload) {
                newVal.push(action.payload[i]);
            }

            return {
                ...state,
                autoComplete: newVal,
            }
        }
        default: {
            return state;
        }
    }
}

export default search;