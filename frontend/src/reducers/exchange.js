import { SET_FROM_AUTOCOMPLETE, SET_TO_AUTOCOMPLETE } from '../actions/exchange';

const defaultState = {
    autoCompleteFrom: [],
    autoCompleteTo: [],
}

const search = (state = defaultState, action) => {
    switch (action.type) {
        case SET_FROM_AUTOCOMPLETE: {
            let newVal = [];
            for (let i in action.payload) {
                newVal.push(action.payload[i]);
            }

            return {
                ...state,
                autoCompleteFrom: newVal,
            }
        }
        case SET_TO_AUTOCOMPLETE: {
            let newVal = [];
            for (let i in action.payload) {
                newVal.push(action.payload[i]);
            }

            return {
                ...state,
                autoCompleteTo: newVal,
            }
        }
        default: {
            return state;
        }
    }
}

export default search;