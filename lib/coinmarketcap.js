'use strict';

const EventEmitter = require('events');
const rp = require('request-promise');

class Coinmarketcap extends EventEmitter {

    constructor(data) {
        super();

        /**
         * API endpoint URI
         */
        this.endpoint = data.endpoint;

        /**
         * Getting data interval
         */
        this.interval = data.interval;

        /**
         * Attach retrieving interval
         */
        this.ticker = setInterval(this.getData.bind(this), this.interval);

        /**
         * Get data immediately
         */
        this.getData();
    }

    getData() {
        rp({url: this.endpoint, json: true})
            .then(data => this.emitData(data))
            .catch(function (error) {
                console.log(error);
        })
    }

    emitData(data) {

        /**
         * Emit event with price data if exists
         */
        if(data && data[0] && data[0].price_usd) {
            this.emit('update', JSON.stringify({price: data[0].price_usd}), 'coinmarketcap');
        }
    }

}

module.exports = Coinmarketcap;
