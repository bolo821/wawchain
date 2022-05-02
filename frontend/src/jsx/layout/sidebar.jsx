import React from 'react';
import { Link, useHistory } from 'react-router-dom';

function Sidebar() {
    const history = useHistory();
    const pathname = history.location.pathname;
    
    return (
        <div className="sidebar">
            <div className="menu">
                <ul>
                    <li>
                        <Link to="/" className={`${pathname.includes('token') ? 'active' : ''}`} title="home">
                            <span><i className="mdi mdi-view-dashboard"></i></span>
                        </Link>
                        <Link to={`/exchange/buy/${JSON.stringify({ name: "ApeCron", symbol: "APECRON", address: "0x09aae6c66bc670016801e34d19b1775b038b6c43", decimal: 18 })}`} className={`${pathname.includes('exchange') ? 'active' : ''}`} title="Exchange">
                            <span><i className="mdi mdi-tumblr-reblog"></i></span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar;