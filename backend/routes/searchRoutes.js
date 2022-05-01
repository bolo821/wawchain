const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post("/", async (req, res) => {
    searchTerm = req.body.searchTerm;

	axios.request({
		method: 'GET',
		url: `${process.env.THIRD_PARTY_URL}/find/${searchTerm}`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json(result.data);
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

router.get("/:walletAddress", (req, res) => {
	const { walletAddress } = req.params;
	axios.request({
		method: 'POST',
		url: `${process.env.THIRD_PARTY_URL}/wallet/${walletAddress}`,
	}).then(result => {
		if (result && result.data) {
			res.status(200).json(result.data);
		} else {
			res.status(400).json({
				message: 'Result not found.',
				error: '',
			});
		}
	}).catch(err => {
		res.status(500).json({
			message: 'Internal server error.',
			error: err,
		});
	});
});

module.exports = router;