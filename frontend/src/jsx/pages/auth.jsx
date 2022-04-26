import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { signinWithSavedData } from '../../actions/user';

const Auth = (props) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        const autoLogin = async () => {
            if(localStorage.getItem('user')) {
                let res = await dispatch(signinWithSavedData(JSON.parse(localStorage.getItem('user'))));
                if(!res) {
                    localStorage.removeItem('user');
                }
                setFlag(true);
            } else {
                setFlag(true);
            }
        }
        autoLogin();
    }, [history, dispatch]);

    if(flag) {
        return (
            <>
                { props.children }
            </>
        )
    } else {
        return (
            <></>
        )
    }
}

export default Auth;