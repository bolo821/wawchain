import axios from 'axios';
import { SERVER_URL } from '../apiConfig';

export const GET_USER_BALANCE = 'WALLET REDUCER GET USER BALANCE';

export const getUserBalance = (address) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/wallet/getUserBalance`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: {address},
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res.data && res.data.success) {
        dispatch({
            type: GET_USER_BALANCE,
            payload: res.data.balance,
        })
    }
}