import axios from 'axios';
import * as BigNumber from 'bignumber.js';

const CancelToken = axios.CancelToken;
var cancel = null;

// function that gets historical data.
export const getHistoryData = async (data) => {
	const { interval, from } = data;
	const token = JSON.parse(localStorage.getItem('token'));
	const poolAddress = JSON.parse(localStorage.getItem('pool')).address;

	const res = await axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/get_history_data`,
		method: 'POST',
		data: {
			address: token.address,
			pullAddress: poolAddress,
			interval: interval,
			from: from,
			to: from,
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			return null;
		}
	});


	if (res && res.data) {
		return res.data.bars;
	} else {
		return null;
	}
}

// function that gets token information using given token address.
export async function getSymbolFromId(id) {
	const res = await axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/get_token_information`,
		method: 'POST',
		data: { address: id },
		headers: {
			'Content-Type': 'application/json',
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			return null;
		}
	});

	if(res && res.data && res.data.token && res.data.token.status !== false) {
		return res.data?.token;
	} else {
		return null;
	}
}

// function that gets market information.
export async function getMarketInformation() {
	const res = await axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/get_market_info`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			return null;
		}
	});

	if(res && res.data) {
		return res.data?.prices;
	} else {
		return null;
	}
}

// function that gets parameters.
export const getParameters = address => new Promise((resolve, reject) => {
	axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/get_parameters`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			address,
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).then(res => {
		if (res && res.data && res.data.data) {
			resolve(res.data.data);
		} else {
			reject(null);
		}
	}).catch(err => {
		if (axios.isCancel(err)) {
			reject(null);
		} else {
			reject(null);
		}
	});
});

// function that gets market information.
export async function getPairs(address) {
	const res = await axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/get_pairs`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: {
			address,
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			return null;
		}
	});

	if(res && res.data) {
		return res.data?.data;
	} else {
		return null;
	}
}

// function that calls aggregator api.
export const callAggregatorAPI = (tokenIn, tokenOut, amountIn, decimal) => new Promise((resolve, reject) => {
	let sendAmount = new BigNumber(amountIn).shiftedBy(decimal).multipliedBy(0.9992).toNumber();
	axios.request({
		url: `https://aggregator-api.kyberswap.com/cronos/route?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amountIn=${sendAmount}`,
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).then(res => {
		if(res && res.data) {
			let outTokenDecimal = res.data.tokens[tokenOut].decimals;
			let estimateAmount = new BigNumber(res.data.outputAmount).shiftedBy(-outTokenDecimal).toNumber();
			let slippage = 0.2;
			let minAmountOut = new BigNumber(res.data.outputAmount).dividedToIntegerBy(1 + slippage).toNumber();
	
			resolve({
				data: { ...res.data, minAmountOut: minAmountOut },
				estimate: estimateAmount,
			});
		} else {
			reject(null);
		}
	}).catch(err => {
		if (axios.isCancel(err)) {
			reject(null);
		} else {
			reject(null);
		}
	});
}) 

// function that gets currently minted block number.
export async function getCurrentBlockNumber() {
	const blockNumRes = await axios.request(`${process.env.REACT_APP_RPC_URL}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify(
			{
				"jsonrpc": "2.0",
				"id": new Date().getTime(),
				"method": "eth_blockNumber",
				"params": []
			}
		),
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	});
	if(blockNumRes && blockNumRes.data) {
		return blockNumRes.data.result;
	} else {
		return null;
	}
	
}

// function that gets logs from fromBlock for given token.
export async function getLogs(address, fromBlock) {
	const res = await axios.request({
		url: `${process.env.REACT_APP_SERVER_URL}/api/rpc/getLogs`,
		method: 'POST',
		data: {
			address: address,
			fromBlock: fromBlock,
			decimal: JSON.parse(localStorage.getItem('token')).decimal,
		},
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	});


	if (res && res.data && res.data.success) {
		return res.data.logs;
	} else {
		return null;
	}
}

// function that gets decimal of token.
export async function getDecimal(address) {
	const decimalRes = await axios.request(process.env.REACT_APP_RPC_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify(
			{
				"jsonrpc": "2.0",
				"id": new Date().getTime(),
				"method": "eth_call",
				"params": [
					{
						"data": "0x313ce567",
						"to": `${address}`
					},
					"latest"
				]
			}
		),
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	});

	let decimal;
	if(decimalRes && decimalRes.data) {
		decimal = parseInt(decimalRes.data.result, 16);
	} else {
		return 18;
	}
	return decimal;
}

// function that gets comma separated numbers form normal numbers.
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function that clears axios request when moving to another page.
export const clearRequest = () => {
	cancel();
}

export const getTimeString = (timestamp) => {
	let date = new Date(timestamp);
	let year = date.getFullYear();
	let month = (date.getMonth() + 1).toString().padStart(2, "0");
	let day = date.getDate().toString().padStart(2, "0");
	let hour = date.getHours().toString().padStart(2, "0");
	let minute = date.getMinutes().toString().padStart(2, "0");
	let second = date.getSeconds().toString().padStart(2, "0");

	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export const getAmountWithoutDecimal = (amount, decimal) => {
	let input = new BigNumber(amount).shiftedBy(-decimal).toNumber();
	return input;
}