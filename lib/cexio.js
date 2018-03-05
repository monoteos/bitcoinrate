'use strict';

const EventEmitter = require('events');
const WebSocket = require('ws');
const crypto = require('crypto');
const BTC = 'BTC';
const USD = 'USD';

/**
 * CEX.IO
 * @link https://cex.io/websocket-api#ticker-subscription
 */
class Cexio extends EventEmitter {


    constructor(config) {
        super();

        /**
         * API endpoint URI
         */
        this.endpoint = config.endpoint;

        /**
         * Connect to API endpoint
         */
        this.connect();
    }

    /**
     * Create socket connection
     */
    connect() {
        this.ws = new WebSocket(this.endpoint);
        this.ws.on('message', data => this.onMessage(data));
        this.ws.on('error', error => this.onError(error));
        this.ws.on('close', message => this.onClose(message));
    }

    /**
     * On receive message from server
     * @param data
     */
    onMessage(data) {
        const response = JSON.parse(data);

        switch (response.e) {
            case 'connected':

                /**
                 * Subscribe on getting rate
                 */
                this.subscribe();

                break;
            case 'tick':

                /**
                 * Parse raw data and emit event
                 */
                this.emitData(response);

                break;
            case 'ping':

                /**
                 * Server handshake
                 * @type {{e: string}}
                 */
                const request = {
                    "e": "pong"
                };
                this.ws.send(JSON.stringify(request));
                break;
        }
    }

    /**
     * On websocket error handler
     * @param error object
     */
    onError(error) {
        console.log(`Error ${error}`);
    }

    /**
     * On close websocket handler
     * @param message string
     */
    onClose(message) {
        console.log(`Connection closed ${message}`);

        /**
         * Create new socket
         */
        this.connect();
    }

    /**
     * Send get rate request
     */
    subscribe() {
        if (this.ws.readyState === WebSocket.OPEN) {

            /**
             * Subscription request
             * @type {{e: string, rooms: [*]}}
             */
            const request = {
                "e": "subscribe",
                "rooms": [
                    "tickers"
                ]
            };

            this.ws.send(JSON.stringify(request));

            console.log(`Listening ${this.endpoint}`);
        }
    }

    /**
     * Emit event with price data
     * @param response
     */
    emitData(response) {

        if(response.data &&
            response.data.symbol1 && response.data.symbol2 &&
            response.data.symbol1 === BTC && response.data.symbol2 === USD) {

            this.emit('update', JSON.stringify({price: response.data.price}), 'cexio');
        }
    }
}

module.exports = Cexio;
