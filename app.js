/**
 * Configuration file
 */
const config = require('./config.json');

const moment = require('moment');

/**
 * Rate object
 * @type {{cexio: number, coinmarketcap: number, difference: number}}
 */
var rate = {
    cexio: 0,
    coinmarketcap: 0,
    difference: 0
};

/**
 * Calculate rate difference and log it if changed
 * @param data string
 * @param type string
 */
function updateRate(data, type) {
    const parsed = JSON.parse(data);

    rate[type] = parseFloat(parsed.price);

    let difference = 0;
    if(rate.cexio && rate.coinmarketcap) {
        /**
         * Calculate BTC rate difference between two APIs
         */
        difference = (100 - (rate.coinmarketcap * 100) / rate.cexio).toFixed(config.precision);
    }

    /**
     * Show notification if rate difference differ from previous value
     */
    if (difference && difference !== rate.difference) {
        rate.difference = difference;

        /**
         * Format timestamp according application config
         * @type {string}
         */
        const timestamp = moment().utc().format(config.timeFormat);

        console.log(`${timestamp} ${rate.difference}`);
    }
}

/**
 * Construct data source parsers
 */
Object.keys(config.dataSource).map(function (source) {
    const dataSourceClass = require(`./lib/${source}`);
    const dataSource = new dataSourceClass(config.dataSource[source]);

    /**
     * Bind update rate event
     */
    dataSource.on('update', (data, sourceType) => updateRate(data, sourceType));
});
