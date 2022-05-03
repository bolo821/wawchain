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
import { setProcessing } from '../../actions/main';

function Exchange() {
    const dispatch = useDispatch();
    const { type, token } = useParams();
    const autoCompleteFrom = useSelector(state => state.exchange.autoCompleteFrom);
    const autoCompleteTo = useSelector(state => state.exchange.autoCompleteTo);
    const { account, library } = useWeb3React();

    const [ showWalletDlg, setShowWalletDlg ] = useState(false);
    const [ fromText, setFromText ] = useState('');
    const [ fromToken, setFromToken ] = useState(null);
    const [ fromAmount, setFromAmount ] = useState(0);
    const [ toText, setToText ] = useState('');
    const [ toToken, setToToken ] = useState(null);
    const [ toAmount, setToAmount ] = useState(0);
    const [ balance, setBalance ] = useState(-1);
    const [ croBalance, setCroBalance ] = useState(0);
    const [ btnText, setBtnText ] = useState('Exchange');

    const [ aggregateRes, setAggregateRes ] = useState(null);

    useEffect(() => {
        if (account) {
            const web3 = new Web3(library.provider);
            web3.eth.getBalance(account).then(res => {
                let bal = getAmountWithoutDecimal(res, 18);
                setCroBalance(bal);
            }).catch(err => {
            });    
        }
    }, [ account, library ]);

    useEffect(() => {
        let dToken = JSON.parse(token);
        if (type === 'buy') {
            setToText(`${dToken.name}(${dToken.symbol})`);
            setToToken(dToken);
            setFromText('Cronos(CRO)');
            setFromToken({
                address: process.env.REACT_APP_NATIVE_COIN_ADDRESS,
                symbol: 'CRO',
                name: 'Cronos',
                decimal: 18,
            });
        } else {
            setFromText(`${dToken.name}(${dToken.symbol})`);
            setFromToken(dToken);
            setToText('Cronos(CRO)');
            setToToken({
                address: process.env.REACT_APP_NATIVE_COIN_ADDRESS,
                symbol: 'CRO',
                name: 'Cronos',
                decimal: 18,
            });
        }
    }, [ type, token ]);

    useEffect(() => {
        if (account && fromToken && fromToken.address !== process.env.REACT_APP_NATIVE_COIN_ADDRESS) {
            const web3 = new Web3(process.env.REACT_APP_RPC_URL);
            const BALContract = new web3.eth.Contract(config.BALANCE.abi, fromToken.address);

            BALContract.methods.balanceOf(account).call().then(res => {
                setBalance(getAmountWithoutDecimal(res, fromToken.decimal));
            }).catch(err => {
                setBalance(-1);
            });
        } else if (fromToken && fromToken.address === process.env.REACT_APP_NATIVE_COIN_ADDRESS) {
            setBalance(croBalance);
        }
    }, [ account, fromToken, croBalance, library ]);

    useEffect(() => {
        setAggregateRes(null);
        if (fromToken && toToken && fromAmount > 0) {
            setToAmount(0);

            let from = fromToken.address !== process.env.REACT_APP_NATIVE_COIN_ADDRESS ? fromToken.address : '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23';
            let to = toToken.address !== process.env.REACT_APP_NATIVE_COIN_ADDRESS ? toToken.address : '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23';

            callAggregatorAPI(from, to, fromAmount, fromToken.decimal).then(res => {
                setToAmount(res.estimate);
                setAggregateRes(res.data);
            }).catch(err => {
            });
        }
    }, [ fromToken, toToken, fromAmount ]);

    // Check allowance of fromToken once it is given.
    useEffect(() => {
        const check = async () => {
            if (account && aggregateRes && fromToken.address !== process.env.REACT_APP_NATIVE_COIN_ADDRESS) {
                const web3 = new Web3(library.provider);
                const ApproveContract = new web3.eth.Contract(config.APPROVE.abi, fromToken.address);
                let allowedAmount = await ApproveContract.methods.allowance(account, config.SWAP.address).call();
    
                if (allowedAmount.toString() === '0') {
                    setBtnText('Approve');
                }    
            } else {
                setBtnText('Exchange');
            }
        }

        setTimeout(() => {
            check();
        }, 10);
    }, [ fromToken, account, aggregateRes, library ]);

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

            if (btnText === 'Approve') {
                dispatch(setProcessing(true));
                const web3 = new Web3(library.provider);
                const ApproveContract = new web3.eth.Contract(config.APPROVE.abi, fromToken.address);
                const approveRes = await ApproveContract.methods.approve(config.SWAP.address, '1000000000000000000000000000000000').send({ from: account, gasLimit: 70000 }).catch(err => {
                    dispatch(setProcessing(false));
                });

                if (approveRes) {
                    toast.success('Successfully approved.');
                    setBtnText('Exchange');
                }
                dispatch(setProcessing(false));
                return;
            }

            dispatch(setProcessing(true));
            const swapParameters = await getSwapParameters({
                chainId: 25,
                currencyInAddress: fromToken.address,
                currencyInDecimals: fromToken.decimal,
                amountIn: aggregateRes.inputAmount,
                currencyOutAddress: toToken.address,
                currencyOutDecimals: toToken.decimal,
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
                dispatch(setProcessing(false));
            });

            const web3 = new Web3(library.provider);
            const SWAPContract = new web3.eth.Contract(config.SWAP.abi, config.SWAP.address);
            let swapRes = await SWAPContract.methods.swap(swapParameters.args[0], swapParameters.args[1], swapParameters.args[2]).send({ from: account, gasLimit: 400000, value: swapParameters.value }).catch(err => {
                dispatch(setProcessing(false));
            });
            if (swapRes) {
                const web3 = new Web3(library.provider);
                web3.eth.getBalance(account).then(res => {
                    let bal = getAmountWithoutDecimal(res, 18);
                    setCroBalance(bal);
                }).catch(err => {
                });
            }
            dispatch(setProcessing(false));
        } else {
            toast.warn('Please connect your wallet.');
        }
    }

    const handleSwitchCurrency = () => {
        let tempText = fromText;
        let tempToken = fromToken;

        setFromText(toText);
        setFromToken(toToken);
        setFromAmount(0);

        setToText(tempText);
        setToToken(tempToken);
        setToAmount(0);
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

                                            <div className="row">
                                                <div className="col-6 d-flex justify-content-end">
                                                    <span className="switch-btn-rt" onClick={handleSwitchCurrency}>Switch</span>
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
                                                <Button className="btn btn-success px-4" onClick={handleSwap} disabled={toAmount<=0 || !account}>{btnText}</Button>
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