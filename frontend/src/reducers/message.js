import {
  SET_MESSAGE,
} from '../actions/message';

const defaultState = {
  message: '',
  display: false,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_MESSAGE:
      return {
        ...state,
        message: action.payload.message,
        display: action.payload.display,
      }
    default:
      return state;
  }
};
