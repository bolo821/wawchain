import { getIntervalHistory } from './helpers';

var subscriptionItem = {};
var updateTimer = null;
var delta = 0;
var fullyUpdated = false;

async function setBarTime(resolution) {
	let currentTime = new Date().getTime();
	let oldTime = subscriptionItem.lastBar.time;
	let timeInterval = 0;

	if(resolution === 'D') {
		timeInterval = 24 * 60 * 60000;
	} else {
		timeInterval = parseInt(resolution) * 60000;
	}

	if(currentTime > oldTime + timeInterval) {
		if(fullyUpdated) {
			subscriptionItem.lastBar = {
				...subscriptionItem.lastBar,
				time: oldTime + timeInterval,
				open: subscriptionItem.lastBar.close,
				low: Math.min(subscriptionItem.lastBar.close, subscriptionItem.lastBar.low)
			}
			fullyUpdated = false;
		} else {
			let since = new Date(oldTime-delta).toISOString();
			let till = new Date(oldTime+timeInterval-delta).toISOString();
			let res = await getIntervalHistory(since, till);

			if(res.current) {
				let busd_bar = res.busd;
				let current_bar = res.current;
		
				let avgVal = busd_bar.average_price * current_bar.average_price;
				let lowVal = busd_bar.average_price * current_bar.minimum_price;
				let highVal = busd_bar.average_price * current_bar.maximum_price;
				let openVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.open_price);
				let closeVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.close_price);
				
				if(current_bar.trades === 1) {
					subscriptionItem.lastBar = {
						...subscriptionItem.lastBar,
						low: avgVal,
						high: avgVal,
						open: avgVal,
						close: avgVal,
					};
				} else {
					subscriptionItem.lastBar = {
						...subscriptionItem.lastBar,
						low: lowVal,
						high: highVal,
						open: openVal,
						close: closeVal,
					};
				}
			}
			fullyUpdated = true;
		}
	}
}

export function calculateDelta(resolution, last) {
	let current = parseInt(new Date().getTime()/60000)*60000;
	switch(resolution) {
		case '1': {
			delta = current - last;
			break;
		}
		case '3': {
			delta = parseInt((current - last) / (3*60000)) * 3*60000;
			break;
		}
		case '10': {
			delta = parseInt((current - last) / (10*60000)) * 3*60000;
			break;
		}
		case '15': {
			delta = parseInt((current - last) / (15*60000)) * 15*60000;
			break;
		}
		case '30': {
			delta = parseInt((current - last) / (30*60000)) * 30*60000;
			break;
		}
		default: {
			delta = 0;
			break;
		}
	}
	return delta;
}

// function that draws current price info to the chart.
export async function subscribeOnStream(
	symbolInfo,
	resolution,
	onRealtimeCallback,
	subscribeUID,
	onResetCacheNeededCallback,
	lastBar,
) {
	subscriptionItem = {
		...subscriptionItem,
		subscribeUID: subscribeUID,
		resolution: resolution,
		lastBar: lastBar,
		callback: onRealtimeCallback,
	};
	fullyUpdated = true;

	let since = new Date(lastBar.time).toISOString();
	let till = new Date().toISOString();
	const res = await getIntervalHistory(since, till);

	if(res.current) {
		let busd_bar = res.busd;
		let current_bar = res.current;

		let avgVal = busd_bar.average_price * current_bar.average_price;
		let lowVal = busd_bar.average_price * current_bar.minimum_price;
		let highVal = busd_bar.average_price * current_bar.maximum_price;
		let openVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.open_price);
		let closeVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.close_price);
		
		if(current_bar.trades === 1) {
			subscriptionItem.lastBar = {
				...subscriptionItem.lastBar,
				low: avgVal,
				high: avgVal,
				open: avgVal,
				close: avgVal,
			};
		} else {
			subscriptionItem.lastBar = {
				...subscriptionItem.lastBar,
				low: lowVal,
				high: highVal,
				open: openVal,
				close: closeVal,
			};
		}
	}
	setBarTime(resolution);
	onRealtimeCallback(subscriptionItem.lastBar);

	if(updateTimer) {
		clearInterval(updateTimer);
	}

	fullyUpdated = false;
	updateTimer = setInterval(() => {
		loadLastBar(resolution)
	}, 2000);
}

// timer function that get current price.
const loadLastBar = async (resolution) => {
	let price = localStorage.getItem('price');
	if(price) {
		subscriptionItem.lastBar = {
			...subscriptionItem.lastBar,
			close: parseFloat(price),
		}
		await setBarTime(resolution);
		subscriptionItem.callback(subscriptionItem.lastBar);
	}
}

export function unsubscribeFromStream(subscriberUID) {
	if(updateTimer) {
		clearInterval(updateTimer);
	}
}
