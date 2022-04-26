/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Tab, Nav } from 'react-bootstrap';
import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-rangeslider/lib/index.css'
import Datafeed from './api/';
import { 
	getSymbolFromId,
	get24hChangeRate,
    getBalance,
    getTokenPrice,
    get24hVolume,
    numberWithCommas,
    clearRequest,
    getTimeString,
} from './api/helpers';
import Autocomplete from './components/Autocomplete';
import { 
    setAutoComplete, 
    getTradingLogs,
    emptyLogs,
    getCurrentBlock,
    setBusdPriceAction,
} from '../../actions/main';
import { setMessage } from '../../actions/message';

const Web3 = require("web3");
const web3 = new Web3("https://bsc-dataseed.binance.org/");

var currentBlock = null;
var currentBPrice = null;
var headerTimer = null;
var footerTimer = null;
var unmountComponent = false;

function Dashboard() {
    const dispatch = useDispatch();
    const trades = useSelector(state => state.main.trades);
    const block = useSelector(state => state.main.block);
    currentBlock = block;

    const { tokenId } = useParams();
    const history = useHistory();
    const [searchText, setSearchText] = useState(() => '');
	const [token, setToken] = useState(() => null);
	const [icon, setIcon] = useState(() => '');
	const [price, setPrice] = useState(() => 0);
	const [rate, setRate] = useState(() => 0);
    const [supply, setSupply] = useState(() => 0);
    const [volume, setVolume] = useState(() => 0);
    const [liquidity, setLiquidity] = useState(() => 0);
    const [busdPrice, setBusdPrice] = useState(() => 0);

    const chartInitSuccess = localStorage.getItem('initSuccess');

    // if fail to load initial data of chart, this effect will be run.
    useEffect(() => {
        if(chartInitSuccess === 'false' && token) {
            localStorage.setItem('initSuccess', 'none');
            window.tvWidget = new window.TradingView.widget({
                symbol: `${token.symbol}`,
                interval: '15',
                fullscreen: true,
                container_id: 'tv_chart_container',
                datafeed: Datafeed,
                library_path: '../charting_library_clonned_data/',
                theme: 'dark',
            });
        }
    }, [chartInitSuccess]);

    // price sharing with chart real time callback
    useEffect(() => {
		if(price) {
			localStorage.setItem('price', price);
		}
	}, [price]);

    // handle for search inputbox string change
    const handleSearchChange = (val, flag=false) => {
		setSearchText(val);
        if(flag)
            history.push(`/token/${val}`);
	}

    // callback function which triggers when you click "Search" button
	const handleSearch = async () => {
		history.push(`/token/${searchText}`);
	}

    // effect functoin which triggers when the url changes - that is when token changes
    useEffect(() => {
        if(headerTimer) {
			clearInterval(headerTimer);
		}
		if(footerTimer) {
			clearInterval(footerTimer);
		}
        searchToken(tokenId);

        return function cleanup() {
            unmountComponent = true;
            if(headerTimer) {
                clearInterval(headerTimer);
            }
            if(footerTimer) {
                clearInterval(footerTimer);
            }

            dispatch(emptyLogs());

            setPrice(0);
            setRate(0);
            setVolume(0);
            setLiquidity(0);
            setSupply(0);
            setBusdPrice(0);

            clearRequest();
        }
	}, [tokenId]);

    // function that sets token icon
    const setTokenIcon = (tokenId) => {
        let lowerToken = web3.utils.toChecksumAddress(tokenId.toLowerCase());
        let tokenImg = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/assets/${lowerToken}/logo.png`;
        var request = new XMLHttpRequest();
        request.open("GET", tokenImg, true);
        request.send();
        request.onload = function() {
            status = request.status;
            if (request.status == 200)
            {
                setIcon(tokenImg);
            } else {
                setIcon('/unknown.webp');
            }
        }
    }

    // function that starts search token by calling initChart function. If the token is not valid, it will display alert
	const searchToken = async (id) => {
		const token = await getSymbolFromId(id);
		if(token === null) {
			dispatch(setMessage({
                display: true,
                message: "Can not find such token.",
            }));
            setToken(null);
            history.push('/token/0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590');
		} else {
            let data = {
				symbol: token.baseCurrency.symbol,
				name: token.baseCurrency.name,
				address: token.baseCurrency.address,
			}
			setToken(data);
			localStorage.setItem('token', JSON.stringify(data));
            setTokenIcon(id);

            dispatch(getCurrentBlock());
            dispatch(emptyLogs());

            localStorage.setItem('v1Pull', '');
            localStorage.setItem('v2Pull', '');

            setPrice(0);
            setRate(0);
            setVolume(0);
            setLiquidity(0);
            setSupply(0);

            unmountComponent = false;

			setTimeout(() => initChart(data));
		}
	}

    // function that initializes the chart and set timer so that we can get real time data of the token.
    const initChart = async (token) => {
        localStorage.setItem('initSuccess', 'none');
		window.tvWidget = new window.TradingView.widget({
			symbol: `${token.symbol}`,
			interval: '15',
			fullscreen: true,
			container_id: 'tv_chart_container',
			datafeed: Datafeed,
			library_path: '../charting_library_clonned_data/',
            theme: 'dark',
		});
		
        const timer1 = setInterval(headerTicker, 5000);
        headerTimer = timer1;
        headerTicker();
        setTimeout(() => {
            const timer2 = setInterval(footerTicker, 5000);
            footerTimer = timer2;
        }, 2000)
	}

    //. timer function that gets header part data - price, 24h change rate, marketcap, 24h volume, liquidity.
	const headerTicker = async () => {
        let id = JSON.parse(localStorage.getItem('token')).address;
        let bnbPrice = await getTokenPrice(id, '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c');
        let busdPrice = await getTokenPrice('0xe9e7cea3dedca5984780bafc599bd69add087d56', '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c');
        if(bnbPrice && busdPrice && !unmountComponent) {
            let price = bnbPrice.price / busdPrice.price;
            setPrice(price);
            setBusdPrice(busdPrice.price);
            currentBPrice = busdPrice.price;
            dispatch(setBusdPriceAction(busdPrice.price));

            setLiquidity(bnbPrice.liquidity * price);

            let rate = await get24hChangeRate(price);
            if(rate && !unmountComponent) {
                setRate(rate);
            }
        }

		let supply = await getBalance(id);
        if(supply && !unmountComponent) {
            setSupply(supply);
        }

        let volume = await get24hVolume();
        if(volume !== null && !unmountComponent) {
            setVolume(volume);
        }
	}

    // timer function that gets logs for footer part.
	const footerTicker = () => {
        let v2Pull = localStorage.getItem('v2Pull');
        if(currentBlock && v2Pull && currentBPrice > 0 && !unmountComponent) {
            dispatch(getTradingLogs(v2Pull, currentBlock));
        }
	}

    // when you click a row of log table, this function is triggered and open a new window which describes about that transaction.
    const handleRowClick = (e) => {
        window.open(
            `https://bscscan.com/tx/${e.target.parentElement.id}`,
            '_blank',
        );
    }

    // function for auto-complete
    const handleAutocompleteClose = () => {
        dispatch(setAutoComplete(false));
    }

    return (
        <div onClick={handleAutocompleteClose}>
            <Header2 />
            <Sidebar />

            <div className="content-body mb-0">
                <div className="container-fluid">
                    <div className="row mb-3">
                        <div className="col-10">
                            <Autocomplete onChange={handleSearchChange} />
                        </div>
                        <div className="col-2">
                            <button className="btn btn-success waves-effect p-0 w-100 h-100" onClick={handleSearch}>
                                <span className="icon"><i className="fa fa-search"></i></span>
                                <span className="search-string-rt pl-1">Search</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-xl-7 col-xxl-12 col-lg-12 col-xxl-7">
                            <div className="card" style={{height: 'calc(100% - 20px)'}}>
                                <div className="card-header">
                                    <h4 className="card-title">Find your tokens</h4>
                                </div>
                                <div className="card-body">
                                    <div className="row" style={{margin: '0'}}>
                                        <div className="col-xl col-lg col-md-4 col-sm-4 col-6 row">
                                            <div style={{width: '40%', display: 'inline-block'}}>
                                                <img src={icon} style={{width: '80%'}} alt="Icon"/>
                                            </div>
                                            <div style={{width: '60%', display: 'inline-block'}}>
                                                <p className="mb-0">Token</p>
                                                <h6>{token ? token.symbol : ''}</h6>
                                            </div>
                                        </div>
                                        <div className="col-xl col-lg col-md-4 col-sm-4 col-6">
                                            <p className="mb-0">24h Change</p>
                                            <h6 className={rate>=0 ? "text-success" : "text-danger"}>
                                                {rate>=0 ? '+' : ''}{rate.toFixed(2)}%
                                            </h6>
                                        </div>
                                        <div className="col-xl col-lg col-md-4 col-sm-4 col-6">
                                            <p className="mb-0">24h Volume</p>
                                            <h6>${numberWithCommas(parseInt(volume))}</h6>
                                        </div>
                                        <div className="col-xl col-lg col-md-4 col-sm-4 col-6">
                                            <p className="mb-0">Liquidity</p>
                                            <h6>${numberWithCommas(parseInt(liquidity))}</h6>
                                        </div>
                                        <div className="col-xl col-lg col-md-4 col-sm-4 col-6">
                                            <p className="mb-0">Marketcap</p>
                                            <h6>${price ? numberWithCommas(parseInt(price*supply)) : 0}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5 col-xxl-12 col-lg-12 col-xxl-5">
                            <div className="card" style={{height: 'calc(100% - 20px)'}}>
                                <div className="card-header">
                                    <h4 className="card-title">Sponsor: Chris Token</h4>
                                </div>
                                <div className="card-body">
                                    <div className="row" style={{margin: '0'}}>
                                        <div>
                                            <p className="mb-0">
                                                Chris is less than a day old! - NFT GENERATOR | Ownership renounced | LP locked. 700+ holders in only 1 hour !
                                            </p>
                                            <div className="row" style={{paddingTop: '10px'}}>
                                                <div className="col-sm-auto col-6">
                                                    <a href="#">Contract</a>
                                                </div>
                                                <div className="col-sm-auto col-6">
                                                    <a href="#">Website</a>
                                                </div>
                                                <div className="col-sm-auto col-6">
                                                    <a href="#">Telegram</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="tradingview-widget-container card" id="tv_chart_container" style={{ "height": "460px" }}>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <Tab.Container defaultActiveKey="all">
                                <div className="card">
                                    <div className="card-header">
                                        <Nav variant="pills">
                                            <Nav.Link eventKey="all">All</Nav.Link>
                                            <Nav.Link eventKey="buy">Buy</Nav.Link>
                                            <Nav.Link eventKey="sell">Sell</Nav.Link>
                                        </Nav>
                                    </div>
                                    {trades.all.length > 0 ? 
                                    <div className="card-body">
                                        <Tab.Content>
                                            <Tab.Pane eventKey="all">
                                                <div className="card card-scroll-rt">
                                                    <div className="card-body order-book p-0">
                                                        <table className="table table-hover transaction-table">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col" className="transaction-col-1">Traded({token.symbol})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(USD)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(USD)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.all.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{ele.price}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb/busdPrice).toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{getTimeString(ele.time*1000)}</td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="buy">
                                                <div className="card card-scroll-rt">
                                                    <div className="card-body order-book p-0">
                                                        <table className="table transaction-table">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col" className="transaction-col-1">Traded({token.name})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(USD)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(USD)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.buy.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{ele.price}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb/busdPrice).toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{getTimeString(ele.time*1000)}</td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey="sell">
                                                <div className="card card-scroll-rt">
                                                    <div className="card-body order-book p-0">
                                                        <table className="table transaction-table">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col" className="transaction-col-1">Traded({token.name})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(USD)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(USD)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.sell.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{ele.price}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb/busdPrice).toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{getTimeString(ele.time*1000)}</td>
                                                                        </tr>
                                                                    )
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </div>
                                    : ''}
                                </div>
                            </Tab.Container>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;