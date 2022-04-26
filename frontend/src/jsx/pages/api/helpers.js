import axios from 'axios';
import * as BigNumber from 'bignumber.js';
import { SERVER_URL } from '../../../apiConfig';

const CancelToken = axios.CancelToken;
var cancel = null;

// function that gets token information using given token address.
export async function getSymbolFromId(id) {
	const res = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
					dexTrades(
						baseCurrency: {is: "${id}"}
					) {
						baseCurrency {
							symbol
							name
							tokenType
							address
						}
					}
				}
			}
			`,
		}),
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
	if(res && res.data.data !== undefined) {
		if(res.data.data.ethereum.dexTrades) {
			return res.data.data.ethereum.dexTrades[0];
		} else {
			return null;
		}
	} else {
		return null;
	}
}

// function that gets balance of token. balance = total - token0 balance - token1 balance - tokendead balance
export async function getBalance(address) {
	let decimal = await getDecimal(address);
	localStorage.setItem('decimal', decimal);

	const totalRes = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": "0x18160ddd",
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

	let total;
	if(totalRes && totalRes.data) {
		total = new BigNumber(totalRes.data.result).shiftedBy(-decimal).toNumber();
	} else {
		return null;
	}

	const res0 = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": "0x70a082310000000000000000000000000000000000000000000000000000000000000000",
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

	let balance0;
	if(res0 && res0.data) {
		balance0 = new BigNumber(res0.data.result).shiftedBy(-decimal).toNumber();
	} else {
		return null;
	}

	const res1 = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": "0x70a082310000000000000000000000000000000000000000000000000000000000000001",
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

	let balance1;
	if(res1 && res1.data) {
		balance1 = new BigNumber(res1.data.result).shiftedBy(-decimal).toNumber();
	} else {
		return null;
	}

	const resDead = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": "0x70a08231000000000000000000000000000000000000000000000000000000000000dead",
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

	let balanceDead;
	if(resDead && resDead.data) {
		balanceDead = new BigNumber(resDead.data.result).shiftedBy(-decimal).toNumber();
	}

	return total - balance0 - balance1 - balanceDead;
}

// function that gets pull address for tokens in given factory.
export async function getPullAdress(fromAddr, toAddr, factory) {
	const pullRes = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": `0xe6a43905000000000000000000000000${fromAddr.substr(2, 40)}000000000000000000000000${toAddr.substr(2, 40)}`,
						"to": `${factory}`
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
	if(pullRes && pullRes.data) {
		const pullAddr = '0x' + pullRes.data.result.substr(26, 40);
		return pullAddr;
	} else {
		return null;
	}
}

// function that gets decimal of token.
async function getDecimal(address) {
	const decimalRes = await axios.request('https://bsc-dataseed.binance.org/', {
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

// function that gets price using reserves.
async function getPrice(pullAddress, currentToken) {
	if(pullAddress === '0x0000000000000000000000000000000000000000') {
		return {
			price: 0,
			liquidity: 0,
		}
	}
	const reserves = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": `0x0902f1ac`,
						"to": `${pullAddress}`
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
	
	const token0Res = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": `0x0dfe1681`,
						"to": `${pullAddress}`
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
	if(reserves === null || token0Res === null) {
		return null;
	}

	let current = '';
	let bnb = '';
	let token0 = '0x' + token0Res.data.result.substr(26, 40);

	if(token0.toLowerCase() === currentToken.toLowerCase()) {
		current = reserves.data.result.substr(0, 66);
		bnb = '0x' + reserves.data.result.substr(66, 64);
	} else {
		current = '0x' + reserves.data.result.substr(66, 64);
		bnb = reserves.data.result.substr(0, 66);
	}

	let bnbAmount = new BigNumber(bnb).shiftedBy(-18);
	let currentAmount = new BigNumber(current).shiftedBy(-(await getDecimal(currentToken)));
	let price = bnbAmount.dividedBy(currentAmount).toNumber();
	if(currentAmount.toNumber() === 0) {
		price = 0;
	}

	return {
		price: price,
		liquidity: currentAmount.toNumber(),
	};
}

// function that gets total supply of token.
const getTotalSupply = async (addr) => {
	if(addr === '0x0000000000000000000000000000000000000000') {
		return 0;
	}
	const supplyRes = await axios.request('https://bsc-dataseed.binance.org/', {
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
						"data": `0x18160ddd`,
						"to": `${addr}`
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
	
	let decimal = await getDecimal(addr);
	let supply;
	if(supplyRes && supplyRes.data) {
		supply = new BigNumber(supplyRes.data.result).shiftedBy(-decimal).toNumber();
	} else {
		return null;
	}
	
	return supply;
}

//. function that gets token price compared with other targetToken.
export const getTokenPrice = async (id, targetToken) => {
	let v1PullAddr = await getPullAdress(id, targetToken, '0xbcfccbde45ce874adcb698cc183debcf17952812');
	let v2PullAddr = await getPullAdress(id, targetToken, '0xca143ce32fe78f1f7019d7d551a6402fc5350c73');

	if(v1PullAddr === null || v2PullAddr === null) {
		return null;
	}

	if(id === JSON.parse(localStorage.getItem('token')).address) {
		localStorage.setItem('v1Pull', v1PullAddr);
		localStorage.setItem('v2Pull', v2PullAddr);
	}

	let v1Price = await getPrice(v1PullAddr, id);
	let v2Price = await getPrice(v2PullAddr, id);
	let v1Supply = await getTotalSupply(v1PullAddr);
	let v2Supply = await getTotalSupply(v2PullAddr);

	if(v1Supply === null || v2Supply === null || v1Price === null || v2Price === null) {
		return null;
	}

	let price = (v1Price.price*v1Supply + v2Price.price*v2Supply) / (v1Supply+v2Supply);
	if(v1Supply === 0 && v2Supply === 0) {
		price = 0;
	}

	return {
		price: price,
		liquidity: (v1Price.liquidity+v2Price.liquidity) * 2,
	};
}

// function that gets currently minted block number.
export async function getCurrentBlockNumber() {
	const blockNumRes = await axios.request('https://bsc-dataseed.binance.org/', {
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
		url: `${SERVER_URL}/api/rpc/getLogs`,
		method: 'POST',
		data: {
			address: address,
			fromBlock: fromBlock,
			decimal: localStorage.getItem('decimal'),
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

//. function that gets OHLC data per day using graphql.
export const getHistoryDay = async (from, to, count) => {
	const token = JSON.parse(localStorage.getItem('token'));

	const data = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
					dexTrades(
						exchangeName: {in: ["Pancake", "Pancake v2"]}
						any: [
							{	
								baseCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
								quoteCurrency: {is: "0xe9e7cea3dedca5984780bafc599bd69add087d56"}
							},
							{	
								baseCurrency: {is: "${token.address}"}
								quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
							}
						]
						options: {desc: "timeInterval.day"}
						time: {since: "${from}", till: "${to}"}
					) 	{
							buyCurrency: baseCurrency {
								symbol
								address
							}
							sellCurrency: quoteCurrency {
								symbol
							}
							trades: count
							average_price : quotePrice(calculate: average)
							maximum_price : quotePrice(calculate: maximum)
							minimum_price : quotePrice(calculate: minimum)
							open_price: minimum(of: block, get: quote_price)
							close_price: maximum(of: block, get: quote_price)
							timeInterval {
								day(count: ${count})
							}
						}
				}
			}
			`,
		}),
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
	})

	let current = [];
	let busd = [];

	if(data.data.data !== undefined || data.data.data.ethereum.dexTrades) {
		for(let i=0; i<data.data.data.ethereum.dexTrades.length; i++) {
			let ele = data.data.data.ethereum.dexTrades[i];
			if(ele.buyCurrency.address === token.address) {
				current.push(ele);
			} else {
				busd.push(ele);
			}
		}
	}

	let new_busd = [];
	let j = 0;
	if(current.length !== busd.length) {
		for(let i=0; i<current.length; i++) {
			if(j === busd.length) break;
			while(busd[j].timeInterval.day !== current[i].timeInterval.day) {
				j++;
			}
			new_busd.push(busd[j])
		}
	} else {
		new_busd = busd;
	}

	return {
		current: current,
		busd: new_busd,
	}
}

//. function that gets OHLC data per given interval minute using graphql.
export const getHistoryMinute = async (from, to, count) => {
	const token = JSON.parse(localStorage.getItem('token'));

	const data = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
					dexTrades(
						exchangeName: {in: ["Pancake", "Pancake v2"]}
						any: [
							{	
								baseCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
								quoteCurrency: {is: "0xe9e7cea3dedca5984780bafc599bd69add087d56"}
							},
							{	
								baseCurrency: {is: "${token.address}"}
								quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
							}
						]
						options: {desc: "timeInterval.minute"}
						time: {since: "${from}", till: "${to}"}
					) 	{
							buyCurrency: baseCurrency {
								symbol
								address
							}
							sellCurrency: quoteCurrency {
								symbol
							}
							trades: count
							average_price : quotePrice(calculate: average)
							maximum_price : quotePrice(calculate: maximum)
							minimum_price : quotePrice(calculate: minimum)
							open_price: minimum(of: block, get: quote_price)
							close_price: maximum(of: block, get: quote_price)
							timeInterval {
								minute(count: ${count})
							}
						}
				}
			}
			`,
		}),
		cancelToken: new CancelToken(function executor(c) {
			cancel = c;
		}),
	}).catch(async (err) => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	})

	let current = [];
	let busd = [];

	if(data && (data.data.data !== undefined || data.data.data.ethereum.dexTrades)) {
		for(let i=0; i<data.data.data.ethereum.dexTrades.length; i++) {
			let ele = data.data.data.ethereum.dexTrades[i];
			if(ele.buyCurrency.address === token.address) {
				current.push(ele);
			} else {
				busd.push(ele);
			}
		}
	}

	let new_busd = [];
	let j = 0;
	if(current.length !== busd.length) {
		for(let i=0; i<current.length; i++) {
			if(j === busd.length) break;
			while(busd[j].timeInterval.minute !== current[i].timeInterval.minute) {
				j++;
			}
			new_busd.push(busd[j])
		}
	} else {
		new_busd = busd;
	}

	return {
		current: current,
		busd: new_busd,
	}
}

// function that gets 24 hour price change rate using graphql.
export async function get24hChangeRate(currentPrice) {
	const token = JSON.parse(localStorage.getItem('token'));
	let date = new Date();
	date.setDate(date.getDate() - 1);
	let till = date.toISOString();

	const res = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
					dexTrades(
						options: {desc: ["block.height", "transaction.index"], limit: 50}
						baseCurrency: {is: "${token.address}"}
						time: {till: "${till}"}
						exchangeName: {in: ["Pancake", "Pancake v2"]}
					) {
						transaction {
							index
						}
						block {
							height
						}
						buyAmount
						buyAmountInUsd: buyAmount(in: USD)
						buyCurrency {
							symbol
						}
						sellAmount
						sellAmountInUsd: sellAmount(in: USD)
						sellCurrency {
							symbol
						}
						sellAmountInUsd: sellAmount(in: USD)
						tradeAmount(in: USD)
					}
				}
			}
			`,
		}),
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

	let sum = 0;
	let count = 0;

	if(res && res.data.data) {
		const info = res.data.data.ethereum.dexTrades;
		if(info) {
			count = info.length;
			for(let i=0; i<info.length; i++) {
				if(info[i].sellCurrency.symbol === token.symbol) {
					sum += info[i].tradeAmount / info[i].sellAmount;
				} else {
					sum += info[i].tradeAmount / info[i].buyAmount;
				}
			}
		}
	}

	if(sum) {
		let prevPrice = sum / count;
		return (currentPrice - prevPrice) / prevPrice * 100;
	} else {
		return 0;
	}
}

// function that gets 24 hour trading volume using graphql.
export const get24hVolume = async () => {
	const token = JSON.parse(localStorage.getItem('token'));
	let from = new Date();
	from.setDate(from.getDate() - 1);
	let since = from.toISOString();

	const res = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
				 dexTrades(
				   baseCurrency: {is:"${token.address}"}
				   time: {since: "${since}", till: null}
				   exchangeName: {in: ["Pancake", "Pancake v2"]}
				 ) {
				   tradeAmount(in:USD)
				 }
			   }
			}
			`,
		}),
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

	if(res) {
		if(res.data.data.ethereum.dexTrades.length) {
			return res.data.data.ethereum.dexTrades[0].tradeAmount;
		} else {
			return 0;
		}
	} else {
		return 0;
	}
}

// function that gets OHLC data in given time interval.
export const getIntervalHistory = async (since, till) => {
	const token = JSON.parse(localStorage.getItem('token'));

	const data = await axios.request('https://graphql.bitquery.io', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': 'BQYAi1KiYGqD9vp4gpcBcIMFLVBXyY6f',
		},
		data: JSON.stringify({
			query: `
			{
				ethereum(network: bsc) {
					dexTrades(
						exchangeName: {in: ["Pancake", "Pancake v2"]}
						any: [
							{	
								baseCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
								quoteCurrency: {is: "0xe9e7cea3dedca5984780bafc599bd69add087d56"}
							},
							{	
								baseCurrency: {is: "${token.address}"}
								quoteCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
							}
						]
						time: {since: "${since}", till: "${till}"}
					) 	{
							buyCurrency: baseCurrency {
								symbol
								address
							}
							sellCurrency: quoteCurrency {
								symbol
							}
							trades: count
							average_price : quotePrice(calculate: average)
							maximum_price : quotePrice(calculate: maximum)
							minimum_price : quotePrice(calculate: minimum)
							open_price: minimum(of: block, get: quote_price)
							close_price: maximum(of: block, get: quote_price)
						}
				}
			}
			`,
		}),
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
	})

	let current = null;
	let busd = null;

	if(data && data.data.data !== undefined && data.data.data.ethereum.dexTrades && data.data.data.ethereum.dexTrades.length) {
		if(data.data.data.ethereum.dexTrades[0].buyCurrency.address === token.address) {
			current = data.data.data.ethereum.dexTrades[0];
			busd = data.data.data.ethereum.dexTrades[1];
		} else {
			current = data.data.data.ethereum.dexTrades[1];
			busd = data.data.data.ethereum.dexTrades[0];
		}
	}
	return {
		current: current,
		busd: busd,
	}
}

// function that gets comma separated numbers form normal numbers.
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//. function that gets lists of candidate tokens for auto-complete.
export const getTokenCandidates = async (search) => {
	const res = await axios.request(
		`${SERVER_URL}/api/token/search`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			data: {
				searchTerm: `${search}`,
			},
			cancelToken: new CancelToken(function executor(c) {
				cancel = c;
			}),
		}
	).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	});

	if(res) {
		if(res.data && res.data.success) {
			return res.data.tokens;
		} else {
			return [];
		}
	} else {
		return [];
	}
}

// function that checks if the given token has logo image in git.
export const validateImageUrl = async (url) => {
	const validRes = await axios.request(
		url,
		{
			method: 'GET',
			cancelToken: new CancelToken(function executor(c) {
				cancel = c;
			}),
		},
	).catch(err => {
		if (axios.isCancel(err)) {
			return null;
		} else {
			console.log('error: ', err);
			return null;
		}
	});

	if(validRes && validRes.data) {
		return true;
	}
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