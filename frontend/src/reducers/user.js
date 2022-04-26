import {
  SET_USER,
} from '../actions/user';

const defaultState = {
  user: {
    _id: -1,
    name: '',
    email: '',
    verified: false,
  },
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state;
  }
};
