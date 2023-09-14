"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
let pubClient;
let subClient;
// Event Handlers
const handleSubscribe = (socket, topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield subClient.subscribe(topic);
        socket.join(topic);
    }
    catch (err) {
        console.error('Subscribe err:', err);
    }
});
const handleUnsubscribe = (socket, topic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield subClient.unsubscribe(topic);
        socket.leave(topic);
    }
    catch (err) {
        console.error('Unsubscribe err:', err);
    }
});
const handleMessage = ({ topic, data }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pubClient.publish(topic, data);
    }
    catch (err) {
        console.error('Publish err:', err);
    }
});
const handleDisconnecting = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topics = Array.from(socket.rooms);
        yield subClient.unsubscribe(...topics);
    }
    catch (err) {
        console.error('Unsubscribe err:', err);
    }
});
const startServer = () => {
    const io = new socket_io_1.Server(httpServer);
    io.on('connection', (socket) => {
        socket.on('subscribe', (topic) => handleSubscribe(socket, topic));
        socket.on('unsubscribe', (topic) => handleUnsubscribe(socket, topic));
        socket.on('message', handleMessage);
        socket.on('disconnecting', () => handleDisconnecting(socket));
    });
    subClient.on('message', (topic, message) => {
        io.to(topic).emit('message', JSON.stringify({ topic, message }));
    });
    httpServer.listen(process.env.PORT || 8102, () => console.log('Listening on', process.env.PORT || 8102));
};
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    pubClient = new ioredis_1.default({ host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || "") || 6379 });
    subClient = pubClient.duplicate();
    pubClient.on('connect', startServer);
    pubClient.on('error', (err) => console.error('pubClient err:', err));
    subClient.on('error', (err) => console.error('subClient err:', err));
});
init().catch((err) => console.error('Init failed:', err));
