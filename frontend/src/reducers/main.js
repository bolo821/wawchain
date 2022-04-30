import {
  SET_AUTO_COMPLETE_OPENED,
  GET_LOGS,
  EMPTY_LOGS,
  SET_BLOCK,
  SET_BUSD_PRICE,
  SET_LIQUIDITY,
} from '../actions/main';

const defaultState = {
  autoCompleteOpened: false,
  trades: {
    all: [],
    buy: [],
    sell: [],
  },
  block: null,
  busdPrice: 0,
  liquidity: 0,
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case SET_AUTO_COMPLETE_OPENED:
      return {
        ...state,
        autoCompleteOpened: action.payload,
      }
    case GET_LOGS: {
      let logsV2 = action.payload;
      if(logsV2 && logsV2.length) {
        let startItem = logsV2[0];
        let index = -1;
        let trades = state.trades.all;
        for(let i=0; i<trades.length; i++) {
            if(trades[i].type === startItem.type && trades[i].current === startItem.current && trades[i].bnb === startItem.bnb && trades[i].block === startItem.block) {
                index = i;
                break;
            }
        }
        if(index >= 0) {
          logsV2 = logsV2.slice(index+1, trades.length);
        }
        logsV2 = logsV2.reverse();

        for(let i=0; i<logsV2.length; i++) {
          logsV2[i] = {
            ...logsV2[i],
            price: (logsV2[i].bnb/state.busdPrice/logsV2[i].current).toFixed(12)
          }
        }

        trades = [...logsV2, ...trades];

        let logBuy = [];
        let logSell = [];
        let logAll = [];
        for(let i=0; i<Math.min(trades.length, 25); i++) {
            logAll.push(trades[i]);
            if(trades[i].type === 'sell') {
                logSell.push(trades[i]);
            } else {
                logBuy.push(trades[i]);
            }
        }

        let searchBlock = state.block;
        if(logAll.length) {
          searchBlock = '0x' + (parseInt(logAll[0].block)).toString(16);
        }
        
        return {
          ...state,
          trades: {
            all: logAll,
            buy: logBuy,
            sell: logSell,
          },
          block: searchBlock,
        }
      }
      return state;
    }
    case EMPTY_LOGS: {
      return {
        ...state,
        trades: {
          all: [],
          buy: [],
          sell: [],
        }
      }
    }
    case SET_BLOCK: {
      return {
        ...state,
        block: action.payload,
      }
    }
    case SET_BUSD_PRICE: {
      return {
        ...state,
        busdPrice: action.payload,
      }
    }
    case SET_LIQUIDITY: {
      return {
        ...state,
        liquidity: action.payload,
      }
    }
    default:
      return state;
  }
};
