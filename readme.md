Seeding data to trading view chart is done in /src/jsx/pages/api/index.js file.
In this file you can see export default part at line 25.
This file returns the json object.
The details informatino about what each field do can be found in the following article.
https://medium.com/@jonchurch/tradingview-charting-library-js-api-setup-for-crypto-part-1-57e37f5b3d5a

In resolveSymbol field, you can set information about tokens such as token symbol, name, description...
I think you can just replace the symbolInfo object for it.

In getBars field, you feed data to the chart.
Currently the system gets data from the bitquery.io and use that data to build "bars" variable.
This "bars" variable is an array of objects which has the following style.
{
	time: time,
	low: low_price,
	high: high_price,
	open: open_price,
	close: close_price,
}
Finally you can call onHistoryCallback function with this "bars" variable which was inputed as a parameter of getBars field.

In subscribeBars function you set data for real-time change.
The trading view chart changes it's state real-time and this means new values for the current time should be added to the chart.
This is done in this field.
Current system uses complicated process but you can just call onRealtimeCallback function which was inputed as a parameter with the json which has the above json format.