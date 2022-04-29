import { combineReducers } from 'redux';
import main from './reducers/main';
import search from './reducers/search';
import exchange from './reducers/exchange';

export default combineReducers({
  main,
  search,
  exchange,
});
