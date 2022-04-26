import { 
    getLogs,
    getCurrentBlockNumber,
} from '../jsx/pages/api/helpers';

export const SET_AUTO_COMPLETE_OPENED = 'MAIN REDUCER SET AUTO-COMPLETE OPENED';
export const GET_LOGS = 'MAIN REDUCER GET LOGS';
export const EMPTY_LOGS = 'MAIN REDUCER SET LOGS';
export const SET_BLOCK = 'MAIN REDUCER SET BLOCK';
export const SET_BUSD_PRICE = 'MAIN REDUCER SET BUSD PRICE';

export function setAutoComplete(flag) {
    return {
        type: SET_AUTO_COMPLETE_OPENED,
        payload: flag,
    }
}

export const getTradingLogs = (pullAddr, fromBlock) => async dispatch => {
    let logsV2 = await getLogs(pullAddr, fromBlock);
    dispatch({
        type: GET_LOGS,
        payload: logsV2,
    })
}

export const emptyLogs = () => {
    return {
        type: EMPTY_LOGS,
    }
}

export const getCurrentBlock = () => async dispatch => {
    let currentBlock = await getCurrentBlockNumber();
    if (currentBlock) {
        let searchBlock = '0x' + (parseInt(currentBlock)-1000).toString(16);
        dispatch(setBlock(searchBlock));
    }
}

export const setBlock = (block) => {
    return {
        type: SET_BLOCK,
        payload: block,
    }
}

export const setBusdPriceAction = (price) => {
    return {
        type: SET_BUSD_PRICE,
        payload: price,
    }
}