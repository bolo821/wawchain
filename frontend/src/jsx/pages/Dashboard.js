/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Tab, Nav } from 'react-bootstrap';
import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';
import Footer2 from '../layout/footer2';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-rangeslider/lib/index.css'
import Datafeed from './api';
import { 
	getSymbolFromId,
    numberWithCommas,
    clearRequest,
    getTimeString,
    getMarketInformation,
    getParameters,
    getPairs,
} from './api/helpers';
import { 
    setAutoComplete, 
    getTradingLogs,
    emptyLogs,
    getCurrentBlock,
    getLiquidity,
    getVolume,
} from '../../actions/main';
import { toast } from 'react-toastify';
import { searchTokens, SET_AUTOCOMPLETE } from '../../actions/search';
import Autocomplete from './components/Autocomplete';

var currentBlock = null;
var footerTimer = null;
var unmountComponent = false;

const COMMON_TOKENS = [
    '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23',
    '0xe44fd7fcb2b1581822d0c862b68222998a0c299a',
    '0x062e66477faf219f25d27dced647bf57c3107d52',
    '0xc21223249ca28397b4b6541dffaecc539bff0c59',
    '0x66e428c3f67a68878562e79a0234c1f83c208770',
];

function Dashboard() {
    const dispatch = useDispatch();

    const trades = useSelector(state => state.main.trades);
    const block = useSelector(state => state.main.block);
    const autoComplete = useSelector(state => state.search.autoComplete);
    const liquidity = useSelector(state => state.main.liquidity);
    const volume = useSelector(state => state.main.volume);
    currentBlock = block;

    const { tokenId } = useParams();
    const history = useHistory();
    const [ searchText, setSearchText ] = useState(() => '');
	const [ token, setToken ] = useState(() => null);
	const [ price, setPrice ] = useState(() => 0);
	const [ rate, setRate ] = useState(() => 0);
    const [ marketCap, setMarketCap ] = useState(() => 0);

    const chartInitSuccess = localStorage.getItem('initSuccess');

    // if fail to load initial data of chart, this effect will be run.
    useEffect(() => {
        if (chartInitSuccess === 'false' && token) {
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
    }, [ chartInitSuccess ]);

    // Get current block number
    useEffect(() => {
        dispatch(getCurrentBlock());
    }, [ dispatch ]);

    // price sharing with chart real time callback
    useEffect(() => {
		if (price) {
			localStorage.setItem('price', price);
		}
	}, [ price ]);

    // callback function which triggers when you click "Search" button
	const handleSearch = () => {
		history.push(`/token/${searchText}`);
	}

    // effect functoin which triggers when the url changes - that is when token changes
    useEffect(() => {
		if (footerTimer) {
			clearInterval(footerTimer);
		}
        searchToken(tokenId);
        dispatch(getLiquidity(tokenId));

        return function cleanup() {
            unmountComponent = true;
            if(footerTimer) {
                clearInterval(footerTimer);
            }

            dispatch(emptyLogs());

            setPrice(0);
            setRate(0);
            setMarketCap(0);

            clearRequest();
        }
	}, [ tokenId ]);

    // function that gets the pull and pair counts and usd prices for common tokens
    const getMarketInfo = async index => {
        let prices = await getMarketInformation();
        if (prices && index >= 0) {
            localStorage.setItem('wcroPrice', prices[index].value);
        } else {
            return 1;
        }
    }

    // function that starts search token by calling initChart function. If the token is not valid, it will display alert
	const searchToken = async (id) => {
		const token = await getSymbolFromId(id);
		if (token === null) {
            toast.error('Can not find such token.');
            setToken(null);
            setSearchText('');
            history.push('/token/0x09Aae6c66BC670016801e34d19B1775b038B6C43');
		} else {
            let data = {
				symbol: token.symbol,
				name: token.name,
				address: token.address,
                decimal: token.decimals,
			}
            localStorage.setItem('token', JSON.stringify(data));
            dispatch(getVolume());
            setMarketCap(token.market_cap);
			setToken(data);
            setPrice(parseFloat(token.usd_price));

            getParameters(token.address).then(res => {
                if (res) {
                    setRate(res.changes[4].value);
                }
            }).catch(err => {

            });

            unmountComponent = false;

            let pairs = await getPairs(token.address);
            if (pairs && pairs.length) {
                localStorage.setItem('pool', JSON.stringify(pairs[0]));
                await getMarketInfo(Math.max(COMMON_TOKENS.indexOf(pairs[0].token0), COMMON_TOKENS.indexOf(pairs[0].token1)));
                setTimeout(() => initChart(data));
            }
		}
	}

    // function that initializes the chart and set timer so that we can get real time data of the token.
    const initChart = async (token) => {
        localStorage.setItem('initSuccess', 'none');
        localStorage.setItem('from', 0);
        localStorage.setItem('resolution', 15);
		window.tvWidget = new window.TradingView.widget({
			symbol: `${token.symbol}`,
			interval: '15',
			fullscreen: true,
			container_id: 'tv_chart_container',
			datafeed: Datafeed,
			library_path: '../charting_library_clonned_data/',
            theme: 'dark',
		});
		
        footerTicker();
        const timer = setInterval(footerTicker, 5000);
        footerTimer = timer;
	}

    // timer function that gets logs for footer part.
	const footerTicker = () => {
        let pool = JSON.parse(localStorage.getItem('pool')).address;
        if(currentBlock && !unmountComponent) {
            dispatch(getTradingLogs(pool, currentBlock));
        }
	}

    // when you click a row of log table, this function is triggered and open a new window which describes about that transaction.
    const handleRowClick = (e) => {
        window.open(
            `https://cronoscan.com//tx/${e.target.parentElement.id}`,
            '_blank',
        );
    }

    // function for auto-complete
    const handleAutocompleteClose = () => {
        dispatch(setAutoComplete(false));
    }

    const handleSearchTextChange = (text, flag) => {
        if (flag) {
            setSearchText(text);
            dispatch({
                type: SET_AUTOCOMPLETE,
                payload: {},
            });
        } else {
            setSearchText(text);
            getAutoComplete(text);
        }
    }

    const getAutoComplete = searchText => {
        if (searchText.length >= 2) {
            dispatch(searchTokens(searchText));
        } else {
            dispatch({
                type: SET_AUTOCOMPLETE,
                payload: {},
            });
        }
    }

    return (
        <div onClick={handleAutocompleteClose}>
            <Header2 />
            <Sidebar />

            <div className="content-body mb-0 pb-5">
                <div className="container-fluid">
                    <div className="row mb-3">
                        <div className="col-10">
                            <Autocomplete searchText={searchText} setSearchText={handleSearchTextChange} items={autoComplete} />
                        </div>
                        <div className="col-2">
                            <button className="btn btn-success waves-effect p-0 w-100 h-100" onClick={handleSearch}>
                                <span className="icon"><i className="fa fa-search"></i></span>
                                <span className="search-string-rt pl-1">Search</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-xxl-10 col-xl-9 col-lg-12">
                            <div className="card" style={{height: 'calc(100% - 20px)'}}>
                                <div className="card-header">
                                    <h4 className="card-title">Find your tokens</h4>
                                </div>
                                <div className="card-body">
                                    <div className="row m-0">
                                        <div className="col-lg-3 col-md-12">
                                            <div className='row'>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">Token</p>
                                                    <h6>{token ? token.symbol : ''}</h6>
                                                </div>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">24h Change</p>
                                                    <h6 className={rate>=0 ? "text-success" : "text-danger"}>
                                                        {rate>=0 ? '+' : ''}{rate.toFixed(2)}%
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-12">
                                            <div className='row'>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">Price</p>
                                                    <h6>{price.toFixed(7)}</h6>
                                                </div>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">Liquidity</p>
                                                    <h6>${numberWithCommas(parseInt(liquidity))}</h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-12">
                                            <div className='row'>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">Marketcap</p>
                                                    <h6>${marketCap ? numberWithCommas(marketCap) : 0}</h6>
                                                </div>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">1hr volume</p>
                                                    <h6>${numberWithCommas(volume.vol1)}</h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-12">
                                            <div className='row'>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">6hr volume</p>
                                                    <h6>${numberWithCommas(volume.vol6)}</h6>
                                                </div>
                                                <div className='col-sm-6'>
                                                    <p className="mb-0">24hr volume</p>
                                                    <h6>${numberWithCommas(volume.vol24)}</h6>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xxl-2 col-xl-3 col-lg-12">
                            <div className="card" style={{height: 'calc(100% - 20px)'}}>
                                <div className="card-header">
                                    <h4 className="card-title">Buy/Sell this token.</h4>
                                </div>
                                <div className="card-body">
                                    <Link className="btn btn-success waves-effect mr-2" to={token ? `/exchange/buy/${JSON.stringify(token)}` : '#'}>
                                        <span>Buy</span>
                                    </Link>
                                    <Link className="btn btn-danger waves-effect" to={token ? `/exchange/sell/${JSON.stringify(token)}` : '#'}>
                                        <span>Sell</span>
                                    </Link>
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
                                                                    <th scope="col" className="transaction-col-1">Traded({token?.symbol})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(CRO)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(CRO)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.all.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{
                                                                                (ele.bnb / ele.current).toFixed(7)
                                                                            }</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb).toFixed(3)}</td>
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
                                                                    <th scope="col" className="transaction-col-1">Traded({token?.name})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(CRO)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(CRO)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.buy.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{(ele.bnb / ele.current).toFixed(7)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb).toFixed(3)}</td>
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
                                                                    <th scope="col" className="transaction-col-1">Traded({token?.name})</th>
                                                                    <th scope="col" className="transaction-col-3">Token Price(CRO)</th>
                                                                    <th scope="col" className="transaction-col-1">Value(CRO)</th>
                                                                    <th scope="col" className="transaction-col-2">Time</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {trades.sell.map((ele, index) => {
                                                                    return (
                                                                        <tr key={index} id={ele.hash} onClick={handleRowClick}>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{ele.current.toFixed(3)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success transaction-col-3" : "text-danger transaction-col-3"}>{(ele.bnb / ele.current).toFixed(7)}</td>
                                                                            <td className={ele.type === 'buy' ? "text-success" : "text-danger"}>{(ele.bnb).toFixed(3)}</td>
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

            <Footer2 />
        </div>
    )
}

export default Dashboard;