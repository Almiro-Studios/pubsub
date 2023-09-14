"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pubsub_1 = __importDefault(require("./pubsub"));
const pubsub = pubsub_1.default.connect('http://127.0.0.1:8102');
const onFirstMessage = (message) => {
    console.log('Received first message:', message);
    // unsubscribe from a topic
    pubsub.unsubscribeFromTopic('myTopic', onFirstMessage);
    pubsub.on('myTopic', onThirdMessage);
    // send message again
    pubsub.sendMessageToTopic('myTopic2', 'Second message only received once');
    pubsub.sendMessageToTopic('myTopic', 'this should not be received');
};
const onSecondMessage = (message) => {
    console.log('Received second message:', message);
    setTimeout(() => {
        process.exit(0);
    }, 2000);
};
const onThirdMessage = (message) => {
    console.log('Should not have received this message:', message);
    process.exit(1);
};
pubsub.on('connect', () => {
    console.log('Connected to server');
    pubsub.subscribeToTopic('myTopic', onFirstMessage);
    pubsub.subscribeToTopic('myTopic2', onSecondMessage);
    pubsub.sendMessageToTopic('myTopic', 'Hello, world!');
});
