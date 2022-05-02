import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';
import Footer2 from '../layout/footer2';

import Cwallet from './components/Cwallet';
import { Button } from 'react-bootstrap';

import { useWeb3React } from "@web3-react/core";
import Autocomplete from './components/AutocompleteToken';
import { SET_FROM_AUTOCOMPLETE, searchFromAutocomplete, SET_TO_AUTOCOMPLETE, searchToAutocomplete } from '../../actions/exchange';
import { callAggregatorAPI, getAmountWithoutDecimal } from './api/helpers';

import getSwapParameters from '@kyberswap/aggregator-sdk';
import { toast } from 'react-toastify';
import Web3 from "web3";
import config from '../../config';

const web3 = new Web3(process.env.REACT_APP_RPC_URL);

function Exchange() {
    const dispatch = useDispatch();
    const { type, token } = useParams();
    const autoCompleteFrom = useSelector(state => state.exchange.autoCompleteFrom);
    const autoCompleteTo = useSelector(state => state.exchange.autoCompleteTo);
    const { account } = useWeb3React();

    const [ showWalletDlg, setShowWalletDlg ] = useState(false);
    const [ fromText, setFromText ] = useState('');
    const [ fromToken, setFromToken ] = useState('');
    const [ fromAmount, setFromAmount ] = useState(0);
    const [ toText, setToText ] = useState('');
    const [ toToken, setToToken ] = useState('');
    const [ toAmount, setToAmount ] = useState(0);
    const [ balance, setBalance ] = useState(-1);
    const [ croBalance, setCroBalance ] = useState(0);

    const [ aggregateRes, setAggregateRes ] = useState(null);

    useEffect(() => {
        if (account) {
            web3.eth.getBalance(account).then(res => {
                let bal = getAmountWithoutDecimal(res, 18);
                setCroBalance(bal);
            }).catch(err => {
                console.log('error: ', err);
            });    
        }
    }, [ account ]);

    useEffect(() => {
        let dToken = JSON.parse(token);
        if (type === 'buy') {
            setToText(`${dToken.name}(${dToken.symbol})`);
            setToToken(dToken.address);
            setFromText('Cronos(CRO)');
            setFromToken('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
        } else {
            setFromText(`${dToken.name}(${dToken.symbol})`);
            setFromToken(dToken.address);
            setToText('Cronos(CRO)');
            setToToken('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
        }
    }, [ type, token ]);

    useEffect(() => {
        if (fromToken.length === 42 && toToken.length === 42 && fromAmount > 0) {
            setToAmount(0);
            callAggregatorAPI(fromToken, toToken, fromAmount).then(res => {
                setToAmount(res.estimate);
                setAggregateRes(res.data);
            }).catch(err => {
            });
        }
    }, [ fromToken, toToken, fromAmount ]);

    useEffect(() => {
        if (account && fromToken !== '' && fromToken.length === 42 && fromToken !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
            const BALContract = new web3.eth.Contract(config.BALANCE.abi, fromToken);

            BALContract.methods.balanceOf(account).call().then(res => {
                let decimal = JSON.parse(token).decimal;
                setBalance(getAmountWithoutDecimal(res, decimal));
            }).catch(err => {
                console.log('error: ', err);
                setBalance(-1);
            });
        } else if (fromToken === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
            setBalance(croBalance);
        }
    }, [ account, fromToken, token, croBalance ]);

    const handleFromTokenSearch = (text, flag) => {
        if (flag) {
            setFromText(text);
            dispatch({
                type: SET_FROM_AUTOCOMPLETE,
                payload: {},
            });
        } else {
            setFromText(text);
            if (text.length >= 2) {
                dispatch(searchFromAutocomplete(text));
            }
        }
    }

    const handleToTokenSearch = (text, flag) => {
        if (flag) {
            setToText(text);
            dispatch({
                type: SET_TO_AUTOCOMPLETE,
                payload: {},
            });
        } else {
            setToText(text);
            if (text.length >= 2) {
                dispatch(searchToAutocomplete(text));
            }
        }
    }

    const handleSwap = async () => {
        if (account) {
            if (balance < fromAmount) {
                toast.warn('Your balance is less than the required amount.');
                return;
            }
            const swapParameters = await getSwapParameters({
                chainId: 25,
                currencyInAddress: fromToken,
                currencyInDecimals: aggregateRes.tokens[fromToken].decimals,
                amountIn: aggregateRes.inputAmount,
                currencyOutAddress: toToken,
                currencyOutDecimals: aggregateRes.tokens[toToken].decimals,
                tradeConfig: {
                    minAmountOut: aggregateRes.minAmountOut,
                    recipient: account,
                    deadline: Date.now() + 20 * 60 * 1000,
                },
                feeConfig: {
                    isInBps: true,
                    feeAmount: '8',
                    feeReceiver: '0xDa0D8fF1bE1F78c5d349722A5800622EA31CD5dd',
                    chargeFeeBy: 'currency_in',
                },
                customTradeRoute: JSON.stringify(aggregateRes.swaps),
            }).catch(err => {
                console.log('error: ', err);
            });
    
            const SWAPContract = new web3.eth.Contract(config.SWAP.abi, config.SWAP.address);
            const swapRes = await SWAPContract.methods.swap(swapParameters.args[0], swapParameters.args[1], swapParameters.args[2]).send({ from: account }).catch(err => {
                console.log('error: ', err);
            })
            console.log('swap result: ', swapRes);
        } else {
            toast.warn('Please connect your wallet.');
        }
    }

    return (
        <>
            <Header2 />
            <Sidebar />

            <div className="content-body pb-5">
                <div className="container">
                    <div className="row mb-3">
                        <div className="col-12">
                            <Button className="btn btn-primary btn-block" onClick={() => setShowWalletDlg(true)}>{account ? `${account.substring(0, 5)}...${account.substring(38, 42)}` : 'Connect Wallet'}</Button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 d-flex justify-content-end">
                            Your CRO Balance: {croBalance}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header">
                                    <h4 className="card-title">Exchange</h4>
                                    { balance >= 0 &&
                                        <span>{`Your token balance: ${balance}`}</span>
                                    }
                                </div>
                                <div className="card-body">
                                    <div className="buy-sell-widget">
                                        <form method="post" name="myform" className="currency_validate">
                                            <div className="form-group">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="mr-sm-2">From Token</label>
                                                        <div className="input-group mb-3">
                                                            <Autocomplete searchText={fromText} setSearchText={handleFromTokenSearch} items={autoCompleteFrom} setToken={setFromToken} className='w-100' />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="mr-sm-2">From Token Amount</label>
                                                        <div className="input-group mb-3">
                                                            <input type="number" name="fromAmount" className="form-control"
                                                                value={fromAmount} onChange={e => {setFromAmount(e.target.value)}} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <label className="mr-sm-2">To Token</label>
                                                        <div className="input-group mb-3">
                                                            <Autocomplete searchText={toText} setSearchText={handleToTokenSearch} items={autoCompleteTo} setToken={setToToken} className='w-100' />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="mr-sm-2">Estimated Token Amount</label>
                                                        <div className="input-group mb-3">
                                                            <input type="number" name="toAmount" className="form-control" disabled
                                                                value={toAmount} onChange={e => {setToAmount(e.target.value)}} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row justify-content-center">
                                                <Button className="btn btn-success px-4" onClick={handleSwap} disabled={toAmount<=0}>Exchange Now</Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Cwallet isOpen={showWalletDlg} setIsOpen={setShowWalletDlg} />

            <Footer2 />
        </>
    )
}

export default Exchange;