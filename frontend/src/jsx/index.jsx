import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Exchange from './pages/Exchange';
import LoadingOverlay from 'react-loading-overlay';

function Index() {
    const processing = useSelector(state => state.main.processing);

    return (
        <Router>
            <LoadingOverlay active={processing} spinner>
                <div id="main-wrapper">
                    <Switch>
                        <Route exact path='/' render={() => <Redirect to="/token/0x09Aae6c66BC670016801e34d19B1775b038B6C43" />} />
                        <Route path='/token/:tokenId' component={Dashboard} />
                        <Route path='/exchange/:type/:token' component={Exchange} />
                        <Route>
                            <Redirect to="/token/0x09Aae6c66BC670016801e34d19B1775b038B6C43" />
                        </Route>
                    </Switch>
                </div>
            </LoadingOverlay>
        </Router>
    );
}

export default Index;