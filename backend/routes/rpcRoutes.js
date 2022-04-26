const express = require('express');
const router = express.Router();

const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const web3 = new Web3("https://bsc-dataseed.binance.org/");

router.post("/getLogs", async (req, res, next) => {
	const { address, fromBlock, decimal } = req.body;

	let logInfo = null;
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
		res.json({
			success: false,
			msg: 'Rpc call error',
		});
		next();
	}

	
});

module.exports = router;