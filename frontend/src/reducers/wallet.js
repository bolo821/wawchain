import {
    GET_USER_BALANCE,
} from '../actions/wallet';
  
  const defaultState = {
    balance: 0,
  }
  
  export default (state = defaultState, action) => {
    switch (action.type) {
      case GET_USER_BALANCE:
        return {
          ...state,
          balance: action.payload,
        }
      default:
        return state;
    }
  };
  