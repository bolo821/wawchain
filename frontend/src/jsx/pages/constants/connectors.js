import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const POLLING_INTERVAL = 12000;
const RPC_URL = process.env.REACT_APP_RPC_URL;

export const injected = new InjectedConnector({
    supportedChainIds: [ 25 ],
});

export const walletconnect = new WalletConnectConnector({
    rpc: { 25: RPC_URL },
    chainId: 25,
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL,
    infuraId: RPC_URL,
});
