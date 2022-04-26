import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { useSelector, useDispatch } from 'react-redux';
import { signout } from '../../actions/user';

function Header2() {
    const user = useSelector(state => state.user.user);
    const dispatch = useDispatch();

    const handleSignout = (e) => {
        e.preventDefault();
        dispatch(signout());
    }
    return (
        <>
            <div className="header dashboard">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xl-12">
                            <nav className="navbar navbar-expand-lg navbar-light px-0 justify-content-between">
                                WaWChain
                                <div className="signin-btn">
                                    { user._id < 0 ?
                                    <Link className="btn btn-primary" to={'/signin'}>Sign in</Link> :
                                    <>
                                        <h5 className="mr-3 d-inline-block mb-0 header-username">{user.name}</h5>
                                        <Button className="btn btn-primary" onClick={handleSignout}>Sign out</Button>
                                    </>
                                    }
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header2;