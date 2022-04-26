import axios from 'axios';
import { SERVER_URL } from '../apiConfig';
import jwt_decode from 'jwt-decode';
import { SET_MESSAGE } from './message';

export const SET_USER = 'USER REDUCER SET USER';

export const signup = (data, history) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/signup`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'You have successfully registered. Please verify your email.',
                },
            });
            history.push('/signin');
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const signin = (data, history) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/signin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            const decoded = jwt_decode(res.data.token);
            dispatch({
                type: SET_USER,
                payload: {
                    _id: decoded._id,
                    name: decoded.name,
                    email: decoded.email,
                    verified: decoded.verified,
                    credits: decoded.credits,
                    rank: decoded.rank,
                },
            });
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'Login Success.',
                },
            });
            history.push('/');
            localStorage.setItem('user', JSON.stringify({
                _id: decoded._id,
                name: decoded.name,
                email: decoded.email,
                verified: decoded.verified,
                credits: decoded.credits,
                rank: decoded.rank,
            }));
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const signinWithSavedData = (data) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/signinWithSavedData`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            dispatch({
                type: SET_USER,
                payload: {
                    ...data,
                    credits: res.data.credits,
                },
            });
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'Logged in with saved data',
                },
            });
            return true;
        } else {
            return false;
        }
    }
    return false;
}

export const verifyEmail = (data, history) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/verifyEmail`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'Email verification succeded. Please sign in.',
                },
            });
            history.push('/signin');
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const signout = () => {
    localStorage.setItem('user', null);
    return {
        type: SET_USER,
        payload: {
            _id: -1,
            name: '',
            email: '',
            verified: false,
        }
    }
}

export const forgotPassword = (data, history) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/forgotPassword`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'Please confirm your email to reset the password.',
                },
            });
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const resetPassword = (data, history) => async dispatch => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/resetPassword`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: 'Your password has been reset. Please sign in.',
                },
            });
            history.push('/signin');
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const withdrawCreditForGame = (data) => async (dispatch, getState) => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/withdrawCreditForGame`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
        return false;
    });

    if(res && res.data) {
        if(res.data.success) {
            let user = getState().user.user;
            dispatch({
                type: SET_USER,
                payload: {
                    ...user,
                    credits: user.credits - 10,
                },
            });
            return true;
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
            return false;
        }
    }
}

export const depositeFromWin = (data) => async (dispatch, getState) => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/depositeFromWin`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
    });

    if(res && res.data) {
        if(res.data.success) {
            let user = getState().user.user;
            dispatch({
                type: SET_USER,
                payload: {
                    ...user,
                    credits: user.credits + 20,
                },
            });
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
        }
    }
}

export const depositeFromCancel = (data) => async (dispatch, getState) => {
    const res = await axios.request(
        `${SERVER_URL}/api/user/depositeFromCancel`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: data,
        }
    ).catch(err => {
        console.log('error: ', err);
        return false;
    });

    if(res && res.data) {
        if(res.data.success) {
            let user = getState().user.user;
            dispatch({
                type: SET_USER,
                payload: {
                    ...user,
                    credits: user.credits + 10,
                },
            });
            return true;
        } else {
            dispatch({
                type: SET_MESSAGE,
                payload: {
                    display: true,
                    message: res.data.msg,
                },
            });
            return false;
        }
    }
}