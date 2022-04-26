import {
    TOGGLE_CREATE_ROOM_MODAL,
    TOGGLE_APPROVE_MODAL,
    ADD_ROOM_LINK,
} from '../actions/room';
  
  const defaultState = {
    createModalShow: false,
    approveModalShow: false,
    roomLinks: [],
  }
  
  export default (state = defaultState, action) => {
    switch (action.type) {
      case TOGGLE_CREATE_ROOM_MODAL: {
        return {
          ...state,
          createModalShow: action.payload,
        }
      }
      case TOGGLE_APPROVE_MODAL: {
        return {
          ...state,
          approveModalShow: action.payload,
        }
      }
      case ADD_ROOM_LINK: {
        if(state.roomLinks.includes(action.payload)) {
          return state;
        } else {
          return {
            ...state,
            roomLinks: [...state.roomLinks, ...[action.payload]],
          }
        }
      }
      default:
        return state;
    }
  };
  