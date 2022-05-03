import { 
    getLogs,
    getCurrentBlockNumber,
    getHistoryData,
} from '../jsx/pages/api/helpers';
import axios from 'axios';

export const SET_AUTO_COMPLETE_OPENED = 'MAIN REDUCER SET AUTO-COMPLETE OPENED';
export const GET_LOGS = 'MAIN REDUCER GET LOGS';
export const EMPTY_LOGS = 'MAIN REDUCER SET LOGS';
export const SET_BLOCK = 'MAIN REDUCER SET BLOCK';
export const SET_BUSD_PRICE = 'MAIN REDUCER SET BUSD PRICE';
export const SET_LIQUIDITY = 'MAIN ACTION SET LIQUIDITY';
export const SET_VOLUME = 'MAIN ACTION SET VOLUME';
export const SET_PROCESSING = 'MANI ACTION SET PROCESSING';

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

export const getLiquidity = address => dispatch => {
    axios.request(`https://api.dexscreener.io/latest/dex/tokens/${address}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res && res.data) {
            let liquidity = 0;
            let pairs = res.data.pairs;
            for (let i=0; i<pairs.length; i++) {
                liquidity += pairs[i].liquidity.usd;
            }

            dispatch({
                type: SET_LIQUIDITY,
                payload: liquidity,
            });
        }
    }).catch(err => {
        console.log('error: ', err);
    });
}

export const getVolume = () => async dispatch => {
    const historyData = await getHistoryData({ interval: '1h', from: '0' });
    let vol1 = 0;
    let vol6 = 0;
    let vol24 = 0;

    for (let i=historyData.length-1; i>=Math.max(0, historyData.length-24); i--) {
        if (i === historyData.length-1) {
            vol1 += historyData[i].volume;
            vol6 += historyData[i].volume;
            vol24 += historyData[i].volume;
        } else if (i >= historyData.length-6) {
            vol6 += historyData[i].volume;
            vol24 += historyData[i].volume;
        } else {
            vol24 += historyData[i].volume;
        }
    }

    dispatch({
        type: SET_VOLUME,
        payload: {
            vol1: parseInt(vol1),
            vol6: parseInt(vol6),
            vol24: parseInt(vol24),
        }
    });
}

export const setProcessing = flag => {
    return {
        type: SET_PROCESSING,
        payload: flag,
    }
}