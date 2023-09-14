"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const events_1 = __importDefault(require("events"));
class PubSub extends events_1.default {
    constructor(url, options) {
        super();
        this.socket = (0, socket_io_client_1.io)(url, options);
        this.socket.on('message', (message) => {
            const data = JSON.parse(message.toString());
            this.emit(data.topic, data.message);
        });
        this.socket.on('connect', () => {
            this.emit('connect');
        });
    }
    // Singleton getInstance method
    static connect(url, options) {
        if (!this.instance) {
            this.instance = new PubSub(url, options);
        }
        return this.instance;
    }
    subscribeToTopic(topic, callback) {
        this.socket.emit('subscribe', topic);
        this.on(topic, callback);
        return this;
    }
    sendMessageToTopic(topic, message) {
        this.socket.emit('message', { topic, data: message });
    }
    unsubscribeFromTopic(topic, callback) {
        this.socket.emit('unsubscribe', topic);
        this.off(topic, callback);
        return this;
    }
}
PubSub.instance = null; // Singleton instance
exports.default = PubSub;
