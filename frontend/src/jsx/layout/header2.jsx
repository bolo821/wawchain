import React from 'react';
import { Link, useHistory } from 'react-router-dom';

function Header2() {
    const history = useHistory();
    const pathname = history.location.pathname;

    return (
        <div className="header dashboard navbar-rt">
            <div className="container-fluid h-100">
                <div className="row h-100">
                    <div className="col-xl-12 d-flex justify-content-between align-items-center">
                        <h2 className="m-0">Apecron</h2>
                        <div className="menu m-0">
                            <ul>
                                <li className='m-0'>
                                    <Link to="/" className={`m-0 ${pathname.includes('token') ? 'active' : ''}`} title="home">
                                        <span><i className="mdi mdi-view-dashboard"></i></span>
                                    </Link>
                                    <Link to={`/exchange/buy/${JSON.stringify({ name: "ApeCron", symbol: "APECRON", address: "0x09aae6c66bc670016801e34d19b1775b038b6c43", decimal: 9 })}`} className={`m-0 ${pathname.includes('exchange') ? 'active' : ''}`} title="Exchange">
                                        <span><i className="mdi mdi-tumblr-reblog"></i></span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header2;