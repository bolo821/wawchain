import { combineReducers } from 'redux';
import main from './reducers/main';
import message from './reducers/message';

export default combineReducers({
  main,
  message,
});
