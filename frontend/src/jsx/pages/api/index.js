import {
	getHistoryData
} from './helpers.js';

// import {
// 	subscribeOnStream,
// 	unsubscribeFromStream,
// 	calculateDelta,
// } from './streaming.js';

const lastBarsCache = new Map();

const configurationData = {
	supported_resolutions: [ '1', '5', '15', '60' ],
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

		if (token) {
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

			if (resolution !== localStorage.getItem('resolution')) {
				localStorage.setItem('resolution', resolution);
				localStorage.setItem('from', 0);
			}
			let from = localStorage.getItem('from');

			if (resolution === '60') {
				rlt = await getHistoryData({ interval: '1h', from });
			} else {
				rlt = await getHistoryData({ interval: `${resolution}m`, from });
			}

			if (rlt.length === 0) {
				onHistoryCallback([], {
					noData: true,
				});
				return;
			}

			let bars = [];
			let wcroPrice = parseFloat(localStorage.getItem('wcroPrice'));
			localStorage.setItem('from', parseInt(localStorage.getItem('from')) + 1);

			for (let i=0; i<rlt.length; i++) {
				bars = [...bars, {
					time: rlt[i].time * 1000,
					low: rlt[i].low * wcroPrice,
					high: rlt[i].high * wcroPrice,
					open: rlt[i].open * wcroPrice,
					close: rlt[i].close * wcroPrice,
				}];
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
		// if (lastBarsCache.get(symbolInfo.full_name)) {
		// 	subscribeOnStream(
		// 		symbolInfo,
		// 		resolution,
		// 		onRealtimeCallback,
		// 		subscribeUID,
		// 		onResetCacheNeededCallback,
		// 		lastBarsCache.get(symbolInfo.full_name),
		// 	);
		// }
	},

	unsubscribeBars: (subscriberUID) => {
		// unsubscribeFromStream(subscriberUID);
	},
};
