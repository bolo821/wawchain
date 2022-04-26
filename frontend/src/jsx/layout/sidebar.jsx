import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="menu">
                <ul>
                    <li>
                        <Link to="/" className="active" title="home">
                            <span><i className="mdi mdi-view-dashboard"></i></span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Sidebar;