const express = require('express');
const router = express.Router();
const axios = require('axios');

const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const web3 = new Web3(process.env.RPC_URL);

router.post("/getLogs", async (req, res, next) => {
	const { address, fromBlock, decimal } = req.body;

	let logInfo = null;
	let error = null;
	logInfo = await web3.eth.getPastLogs(
		{
			address: address,
			fromBlock: fromBlock,
			topics: [
				"0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
				null,
				null
			]
		}
	).catch( err => {
		logInfo = null;
		error = err;
	});

	if (logInfo && logInfo.length) {
		var mainIndex = 0;

		for(let i=0; i<logInfo.length; i++) {
			let hash = logInfo[i].data;
			let in0 = new BigNumber(hash.substr(0, 66));
			let in1 = new BigNumber('0x' + hash.substr(66, 64));
			let out0 = new BigNumber('0x' + hash.substr(130, 64));
			let out1 = new BigNumber('0x' + hash.substr(194, 64));
			if(	(in0.toNumber() !== 0 && in1.toNumber() === 0 && out0.toNumber() !== 0 && out1.toNumber() !== 0) ||
				(in0.toNumber() !== 0 && in1.toNumber() !== 0 && out0.toNumber() !== 0 && out1.toNumber() === 0)) {
				mainIndex = 0;
			} else if(	(in0.toNumber() === 0 && in1.toNumber() !== 0 && out0.toNumber() !== 0 && out1.toNumber() !== 0) ||
						(in0.toNumber() !== 0 && in1.toNumber() !== 0 && out0.toNumber() === 0 && out1.toNumber() !== 0)) {
				mainIndex = 1;
			}
		}
	
		let logs = [];
		for(let i=0; i<logInfo.length; i++) {
			let hash = logInfo[i].data;
	
			let block = null;
			block = await web3.eth.getBlock(logInfo[i].blockNumber)
			.catch(err => {
				block = null;
			});
	
			let time = new Date().getTime() / 1000;
			if (block) {
				time = block.timestamp;
			}
	
			let in0 = new BigNumber(hash.substr(0, 66));
			let in1 = new BigNumber('0x' + hash.substr(66, 64));
			let out0 = new BigNumber('0x' + hash.substr(130, 64));
			let out1 = new BigNumber('0x' + hash.substr(194, 64));
	
			if(mainIndex === 0) {
				if(in0.toNumber() !== 0 && in1.toNumber() === 0) {
					let type = 'sell';
					let current = in0.shiftedBy(-decimal).toNumber();
					let bnb = BigNumber.sum(out0, out1).shiftedBy(-18).toNumber();
					logs.push({
						type: type,
						current: current,
						bnb: bnb,
						block: logInfo[i].blockNumber,
						hash: logInfo[i].transactionHash,
						time: time,
					});
				} else {
					let type = 'buy';
					let current = out0.shiftedBy(-decimal).toNumber();
					let bnb = BigNumber.sum(in0, in1).shiftedBy(-18).toNumber();
					logs.push({
						type: type,
						current: current,
						bnb: bnb,
						block: logInfo[i].blockNumber,
						hash: logInfo[i].transactionHash,
						time: time,
					});
				}
			} else {
				if(in1.toNumber() !== 0 && in0.toNumber() === 0) {
					let type = 'sell';
					let current = in1.shiftedBy(-decimal).toNumber();
					let bnb = BigNumber.sum(out0, out1).shiftedBy(-18).toNumber();
					logs.push({
						type: type,
						current: current,
						bnb: bnb,
						block: logInfo[i].blockNumber,
						hash: logInfo[i].transactionHash,
						time: time,
					});
				} else {
					let type = 'buy';
					let current = out1.shiftedBy(-decimal).toNumber();
					let bnb = BigNumber.sum(in0, in1).shiftedBy(-18).toNumber();
					logs.push({
						type: type,
						current: current,
						bnb: bnb,
						block: logInfo[i].blockNumber,
						hash: logInfo[i].transactionHash,
						time: time,
					});
				}
			}
		}
	
		res.json({
			success: true,
			logs: logs,
		});
		next();
	} else {
		res.status(500).json({
			message: 'Internal server error.',
			error: error,
		});
		next();
	}
});

router.post('/get_history_data', (req, res) => {
	const { address, pullAddress, from, to, interval } = req.body;

	axios.request({
		method: 'GET',
		url: `${process.env.THIRD_PARTY_URL}/tokens/${address}/candles/${pullAddress}?from=${from}&to=${to}&interval=${interval}`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json({
				bars: result.data,
			});
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

router.post('/get_token_information', (req, res) => {
	const { address } = req.body;

	axios.request({
		method: 'GET',
		url: `${process.env.THIRD_PARTY_URL}/tokens/${address}`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json({
				token: result.data,
			});
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

router.get('/get_market_info', (req, res) => {
	axios.request({
		method: 'POST',
		url: `${process.env.THIRD_PARTY_URL}/tokens`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json({
				prices: result.data.usd,
			});
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

router.post('/get_parameters', (req, res) => {
	const { address } = req.body;

	axios.request({
		method: 'GET',
		url: `${process.env.THIRD_PARTY_URL}/tokens/${address}/params`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json({
				data: result.data,
			});
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

router.post('/get_pairs', (req, res) => {
	const { address } = req.body;

	axios.request({
		method: 'GET',
		url: `${process.env.THIRD_PARTY_URL}/tokens/${address}/pairs`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json({
				data: result.data,
			});
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

router.get('/get_token_information_new/:tokenAddress', (req, res) => {
	const { tokenAddress } = req.params;

	axios.request({
		method: 'GET',
		url: `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json(result.data.pairs);
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: "Internal server error.",
			error: err,
		});
	});
});

module.exports = router;