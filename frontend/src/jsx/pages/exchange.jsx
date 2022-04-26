/* eslint-disable */
import React from 'react';
import { connect } from 'react-redux';
import { getUserBalance } from '../../actions/wallet';

import Header2 from '../layout/header2';
import Sidebar from '../layout/sidebar';
import Button from 'react-bootstrap/Button';
import Header from './components/Header';

import Web3Modal from "web3modal";
import Web3 from "web3";
import axios from 'axios';

import WalletConnectProvider from "@walletconnect/web3-provider";
import { apiGetAccountAssets, cancelRequest } from "./helpers/api";

import {
    hashPersonalMessage,
    recoverPublicKey,
    recoverPersonalSignature,
    formatTestTransaction,
    getChainData
} from "./helpers/utilities";

import { openBox, getProfile } from "./helpers/box";

import {
    ETH_SEND_TRANSACTION,
    ETH_SIGN,
    PERSONAL_SIGN,
    BOX_GET_PROFILE,
    DAI_BALANCE_OF,
    DAI_TRANSFER
} from "./constants";

import { callBalanceOf, callTransfer } from "./helpers/web3";

const INITIAL_STATE = {
    web3Modal: null,
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    assets: [],
    showModal: false,
    pendingRequest: false,
    result: null
};

function initWeb3(provider) {
    const web3 = new Web3(provider);

    web3.eth.extend({
        methods: [
            {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: web3.utils.hexToNumber
            }
        ]
    });

    return web3;
}

class Exchange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        if(this.state.fetching) {
            cancelRequest();
        }
    }
    
    handleClick = async () => {
        const web3Modal = new Web3Modal({
            network: this.getNetwork(),
            cacheProvider: true,
            providerOptions: this.getProviderOptions(),
            theme: "dark",
        });

        await this.setState({
            ...INITIAL_STATE,
            web3Modal: web3Modal,
        });

        const provider = await this.state.web3Modal.connect();

        await this.subscribeProvider(provider);

        const web3 = initWeb3(provider);

        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        await this.props.getUserBalance(address);

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.chainId();

        await this.setState({
            web3,
            provider,
            connected: true,
            address,
            chainId,
            networkId
        });
        await this.getAccountAssets();
    }
    
    getNetwork = () => {
        getChainData(this.state.chainId).network;
    }
    
    getProviderOptions = () => {
        const providerOptions = { 
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
                    wc: "eba3268d-c260-4abb-ad80-d0a08b4c3404@1?bridge=wss://pancakeswap.bridge.walletconnect.org&key=2448f00000be5b8277f9bba839bbce8d89f3c30b6f83df1412194ee555afd9fb",
                }
            },
        };
        return providerOptions;
    };

    subscribeProvider = async (provider) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts) => {
            await this.setState({ address: accounts[0] });
            await this.getAccountAssets();
        });
        provider.on("chainChanged", async (chainId) => {
            const { web3 } = this.state;
            const networkId = await web3.eth.net.getId();
            await this.setState({ chainId, networkId });
            await this.getAccountAssets();
        });
    
        provider.on("networkChanged", async (networkId) => {
            const { web3 } = this.state;
            const chainId = await web3.eth.chainId();
            await this.setState({ chainId, networkId });
            await this.getAccountAssets();
        });
    };

    getAccountAssets = async () => {
        const { address, chainId } = this.state;
        this.setState({ fetching: true });
        try {
            // get account balances
            const assets = await apiGetAccountAssets(address, chainId);
            await this.setState({ fetching: false, assets });
        } catch (error) {
            if (axios.isCancel(error)) {
                console.error(error);
            } else {
                console.log('error: ', error);
            }
            await this.setState({ fetching: false });
        }
    };

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal });
    }

    testSendTransaction = async () => {
        const { web3, address, chainId } = this.state;

        if (!web3) {
            return;
        }

        const tx = await formatTestTransaction(address, chainId);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            function sendTransaction(_tx) {
                return new Promise((resolve, reject) => {
                    web3.eth
                    .sendTransaction(_tx)
                    .once("transactionHash", (txHash) => resolve(txHash))
                    .catch((err) => reject(err));
                });
            }

            // send transaction
            const result = await sendTransaction(tx);

            // format displayed result
            const formattedResult = {
                action: ETH_SEND_TRANSACTION,
                txHash: result,
                from: address,
                to: address,
                value: "0 ETH"
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error);
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testSignMessage = async () => {
        const { web3, address } = this.state;

        if (!web3) {
            return;
        }

        // test message
        const message = "My email is john@doe.com - 1537836206101";

        // hash message
        const hash = hashPersonalMessage(message);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send message
            const result = await web3.eth.sign(hash, address);

            // verify signature
            const signer = recoverPublicKey(result, hash);
            const verified = signer.toLowerCase() === address.toLowerCase();

            // format displayed result
            const formattedResult = {
                action: ETH_SIGN,
                address,
                signer,
                verified,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error);
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testSignPersonalMessage = async () => {
        const { web3, address } = this.state;

        if (!web3) {
            return;
        }

        // test message
        const message = "My email is john@doe.com - 1537836206101";

        // encode message (hex)
        const hexMsg = convertUtf8ToHex(message);

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send message
            const result = await web3.eth.personal.sign(hexMsg, address);

            // verify signature
            const signer = recoverPersonalSignature(result, message);
            const verified = signer.toLowerCase() === address.toLowerCase();

            // format displayed result
            const formattedResult = {
                action: PERSONAL_SIGN,
                address,
                signer,
                verified,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error);
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testContractCall = async (functionSig) => {
        let contractCall = null;
        switch (functionSig) {
            case DAI_BALANCE_OF:
                contractCall = callBalanceOf;
                break;
            case DAI_TRANSFER:
                contractCall = callTransfer;
                break;
            default:
                break;
        }

        if (!contractCall) {
            throw new Error(
                `No matching contract calls for functionSig=${functionSig}`
            );
        }

        const { web3, address, chainId } = this.state;
        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send transaction
            const result = await contractCall(address, chainId, web3);

            // format displayed result
            const formattedResult = {
                action: functionSig,
                result
            };

            // display result
            this.setState({
                web3,
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error);
            this.setState({ web3, pendingRequest: false, result: null });
        }
    };

    testOpenBox = async () => {
        function getBoxProfile(
            address,
            provider
        ) {
            return new Promise(async (resolve, reject) => {
                try {
                    await openBox(address, provider, async () => {
                    const profile = await getProfile(address);
                    resolve(profile);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }

        const { address, provider } = this.state;

        try {
            // open modal
            this.toggleModal();

            // toggle pending request indicator
            this.setState({ pendingRequest: true });

            // send transaction
            const profile = await getBoxProfile(address, provider);

            let result = null;
            if (profile) {
            result = {
                name: profile.name,
                description: profile.description,
                job: profile.job,
                employer: profile.employer,
                location: profile.location,
                website: profile.website,
                github: profile.github
            };
            }

            // format displayed result
            const formattedResult = {
                action: BOX_GET_PROFILE,
                result
            };

            // display result
            this.setState({
                pendingRequest: false,
                result: formattedResult || null
            });
        } catch (error) {
            console.error(error);
            this.setState({ pendingRequest: false, result: null });
        }
    };

    resetApp = async () => {
        const { web3 } = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.state.web3Modal.clearCachedProvider();
        this.setState({ ...INITIAL_STATE });
    };

    
    render = () => {
        const {
            assets,
            address,
            connected,
            chainId,
            fetching,
            showModal,
            pendingRequest,
            result
        } = this.state;
        return (
            <>
                <Header2 />
                <Sidebar />
    
                <div className="content-body">
                    <div className="container pt-5">
                        <div className="row justify-content-between align-items-center">
                            {!connected ? 
                            <div className="col-xl-6 col-lg-6 col-12">
                                <div className="intro-content">
                                    <h1 className="mb-4">
                                        connect your wallet on <strong className="text-primary">WawChain</strong>. <br />
                                    </h1>
                                    <p></p>
                                </div>
    
                                <div className="intro-btn">
                                    <Button variant="outline-primary" onClick={this.handleClick}>Connect to wallet</Button>
                                </div>
                            </div>
                            : ''}
                            <Header
                                connected={connected}
                                address={address}
                                chainId={chainId}
                                killSession={this.resetApp}
                                balance={this.props.balance}
                            />
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        balance: state.wallet.balance,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getUserBalance: address => dispatch(getUserBalance(address)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Exchange);