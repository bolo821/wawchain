import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Toast from 'react-bootstrap/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../actions/message';

function Index() {
    const dispatch = useDispatch();
    const msg = useSelector(state => state.message.message);
    const showMsg = useSelector(state => state.message.display);

    const toastClose = () => {
        dispatch(setMessage({
            display: false,
            message: '',
        }));
    }

    return (
        <>
            <BrowserRouter>
                <div id="main-wrapper">
                    <Toast onClose={toastClose} show={showMsg} delay={5000} autohide className="toast">
                        <Toast.Header />
                        <Toast.Body>
                            {msg}
                        </Toast.Body>
                    </Toast>
                    <Switch>
                        <Route exact path='/' render={() => (<Redirect to="/token/0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590" />)} />
                        <Route path='/token/:tokenId' component={Dashboard} />
                        <Route>
                            <Redirect to="/token/0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590" />
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        </>
    );
}

export default Index;