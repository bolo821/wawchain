import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Auth from './pages/auth';
import Dashboard from './pages/dashboard';
import Exchange from './pages/exchange';
import Room from './pages/room';
import Dice from './pages/dice';
import Signin from './pages/signin';
import Signup from './pages/signup';
import Verify from './pages/verify';
import ForgotPassword from './pages/forgotpass';
import ResetPassword from './pages/resetpass';
import Toast from 'react-bootstrap/Toast';
import { useDispatch, useSelector } from 'react-redux';
import { setMessage } from '../actions/message';

function Index() {
    const dispatch = useDispatch();
    const msg = useSelector(state => state.message.message);
    const showMsg = useSelector(state => state.message.display);
    const userRank = useSelector(state => state.user.user.rank);

    const toastClose = () => {
        dispatch(setMessage({
            display: false,
            message: '',
        }));
    }

    return (
        <>
            <BrowserRouter basename='/platform'>
                <div id="main-wrapper">
                    <Toast onClose={toastClose} show={showMsg} delay={5000} autohide className="toast">
                        <Toast.Header />
                        <Toast.Body>
                            {msg}
                        </Toast.Body>
                    </Toast>
                    <Auth>
                        <Switch>
                            <Route exact path='/' render={() => (<Redirect to="/token/0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590" />)} />
                            <Route path='/token/:tokenId' component={Dashboard} />
                            <Route path='/signin' component={Signin} />
                            <Route path='/signup' component={Signup} />
                            <Route path='/verify/:userId' component={Verify} />
                            <Route path='/forgotpass' component={ForgotPassword} />
                            <Route path='/resetpass/:userId' component={ResetPassword} />
                            
                            {userRank <= 1 ?
                                <>
                                    <Route path='/wallet' component={Exchange} />
                                    <Route path='/room' component={Room} />
                                    <Route path='/dice/:roomName' component={Dice} />
                                </> : ''
                            }
                            <Route>
                                <Redirect to="/token/0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590" />
                            </Route>
                        </Switch>
                    </Auth>
                </div>
            </BrowserRouter>
        </>
    );
}

export default Index;