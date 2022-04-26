import {
	getHistoryDay,
	getHistoryMinute,
} from './helpers.js';

import {
	subscribeOnStream,
	unsubscribeFromStream,
	calculateDelta,
} from './streaming.js';

const lastBarsCache = new Map();

const configurationData = {
	supported_resolutions: ['1', '3', '10', '15', '30', '60', '120', '720', '1D'],
	symbols_types: [
		{
			name: 'crypto',
			value: 'crypto',
		},
	],
};

// datafeed object.
export default {
	onReady: (callback) => {
		setTimeout(() => callback(configurationData));
	},

	resolveSymbol: async (
		symbolName,
		onSymbolResolvedCallback,
		onResolveErrorCallback,
	) => {
		const token = JSON.parse(localStorage.getItem('token'));

		if(token) {
			const symbolInfo = {
				ticker: symbolName,
				name: token.symbol,
				description: token.name,
				type: token.type,
				session: '24x7',
				timezone: 'Etc/UTC',
				minmov: 1,
				pricescale: 10000000000,
				has_intraday: true,
				has_no_volume: true,
				has_daily: true,
				has_weekly_and_monthly: true,
				supported_resolutions: configurationData.supported_resolutions,
				volume_precision: 5,
				data_status: 'streaming',
			};
	
			setTimeout(() => onSymbolResolvedCallback(symbolInfo));
		} else {
			setTimeout(() => onResolveErrorCallback());
		}
	},

	getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
		try {
			let rlt = [];
			if(resolution === '1D') {
				rlt = await getHistoryDay(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 1);
			} else if(resolution === '720') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 720);
			} else if(resolution === '120') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 120);
			} else if(resolution === '60') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 60);
			} else if(resolution === '30') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 30);
			} else if(resolution === '15') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 15);
			} else if(resolution === '10') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 10);
			} else if(resolution === '3') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 3);
			} else if(resolution === '1') {
				rlt = await getHistoryMinute(new Date(from*1000).toISOString(), new Date(to*1000).toISOString(), 1);
			}

			if (rlt.current.length === 0) {
				onHistoryCallback([], {
					noData: true,
				});
				return;
			}

			let bars = [];
			let delta = 0;
			if(firstDataRequest) {
				delta = calculateDelta(resolution, new Date(rlt.current[0].timeInterval.minute.replace(' ', 'T')).getTime()+10800000);
			}
			
			for(let i=rlt.current.length-1; i>=0; i--) {
				let current_bar = rlt.current[i];
				let busd_bar = rlt.busd[i];
				let time;
				if(resolution === '1D') {
					time = new Date(current_bar.timeInterval.day).getTime() + 10800000;
				} else {
					time = new Date(current_bar.timeInterval.minute.replace(' ', 'T')).getTime() + 10800000;
					time += delta;
				}
				
				if(time/1000 >= from && time/1000 < to) {
					let avgVal = busd_bar.average_price * current_bar.average_price;
					let lowVal = busd_bar.average_price * current_bar.minimum_price;
					let highVal = busd_bar.average_price * current_bar.maximum_price;
					let openVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.open_price);
					let closeVal = parseFloat(busd_bar.average_price) * parseFloat(current_bar.close_price);
					
					if(current_bar.trades === 1) {
						bars = [...bars, {
							time: time,
							low: avgVal,
							high: avgVal,
							open: avgVal,
							close: avgVal,
						}];
					} else {
						bars = [...bars, {
							time: time,
							low: Math.max(lowVal, Math.min(avgVal, openVal)),
							high: highVal,
							open: openVal,
							close: closeVal,
						}];
					}
				}
			}

			if (firstDataRequest) {
				lastBarsCache.set(symbolInfo.full_name, {
					...bars[bars.length - 1],
				});
			}
			onHistoryCallback(bars, {
				noData: false,
			});
			localStorage.setItem('initSuccess', 'true');
		} catch (error) {
			console.log('[getBars]: Get error', error);
			localStorage.setItem('initSuccess', 'false');
			onErrorCallback(error);
		}
	},

	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback,
	) => {
		if(lastBarsCache.get(symbolInfo.full_name)) {
			subscribeOnStream(
				symbolInfo,
				resolution,
				onRealtimeCallback,
				subscribeUID,
				onResetCacheNeededCallback,
				lastBarsCache.get(symbolInfo.full_name),
			);
		}
	},

	unsubscribeBars: (subscriberUID) => {
		unsubscribeFromStream(subscriberUID);
	},
};
