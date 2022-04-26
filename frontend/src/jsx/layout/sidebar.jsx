import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Sidebar() {
    const location = useLocation();
    const user = useSelector(state => state.user.user);
    const [navNum, setNavNum] = useState(() => 0);

    useEffect(() => {
        switch(location.pathname.split('/')[1]) {
            case 'wallet': {
                setNavNum(1);
                break;
            }
            case 'room': {
                setNavNum(2);
                break;
            }
            case 'dice': {
                setNavNum(3);
                break;
            }
            default: {
                setNavNum(0);
                break;
            }
        }
    }, [location.pathname])

    return (
        <>
            <div className="sidebar">
                <div className="menu">
                    <ul>
                        <li>
                            <Link to="/" className={navNum === 0 ? "active" : ''} title="home">
                                <span><i className="mdi mdi-view-dashboard"></i></span>
                            </Link>
                        </li>
                        { user.rank <= 1 ?
                            <>    
                                <li>
                                    <Link to="/wallet" className={navNum === 1 ? "active" : ''} title="connect wallet">
                                        <span><i className="mdi mdi-tumblr-reblog"></i></span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/room" className={navNum === 2 ? "active" : ''} title="game room">
                                        <span><i className="mdi mdi-face-profile"></i></span>
                                    </Link>
                                </li>
                                {/*
                                    roomLink.map((ele, index) => {
                                        return (
                                            <li key={index}>
                                                <Link to={`/dice/${ele}`} className={navNum === 3 ? "active" : ''} title="dice room">
                                                    <span><i className="mdi mdi-face-profile"></i></span>
                                                </Link>  
                                            </li>
                                        )
                                    })
                                */}
                            </> : ''
                        }
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar;