import { combineReducers } from 'redux';
import main from './reducers/main';
import user from './reducers/user';
import message from './reducers/message';
import wallet from './reducers/wallet';
import room from './reducers/room';
import counter from './reducers/counter';

export default combineReducers({
  main,
  user,
  message,
  wallet,
  room,
  counter,
});
