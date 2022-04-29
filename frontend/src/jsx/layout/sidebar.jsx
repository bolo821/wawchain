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
                        <Link to="/exchange" className={`${pathname.includes('exchange') ? 'active' : ''}`} title="Exchange">
                            <span><i className="mdi mdi-tumblr-reblog"></i></span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar;