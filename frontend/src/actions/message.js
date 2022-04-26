export const SET_MESSAGE = 'MESSAGE REDUCER SET MESSAGE';

export const setMessage = data => {
    return {
        type: SET_MESSAGE,
        payload: data,
    }
}