import express, { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

const app: Express = express();
const httpServer: HTTPServer = createServer(app);

let pubClient: Redis;
let subClient: Redis;

// Event Handlers
const handleSubscribe = async (socket: Socket, topic: string): Promise<void> => {
  try {
    await subClient.subscribe(topic);
    socket.join(topic);
  } catch (err) {
    console.error('Subscribe err:', err);
  }
};

const handleUnsubscribe = async (socket: Socket, topic: string): Promise<void> => {
  try {
    await subClient.unsubscribe(topic);
    socket.leave(topic);
  } catch (err) {
    console.error('Unsubscribe err:', err);
  }
};

const handleMessage = async ({ topic, data }: { topic: string; data: string }): Promise<void> => {
  if( topic.includes('/') ){
    data = [topic.toString(), data].join('|')
    topic = topic.split('/')[0];
  }

  try {
    await pubClient.publish(topic, data);
  } catch (err) {
    console.error('Publish err:', err);
  }
};

const handleDisconnecting = async (socket: Socket): Promise<void> => {
  try {
    const topics = Array.from(socket.rooms);
    await subClient.unsubscribe(...topics);
  } catch (err) {
    console.error('Unsubscribe err:', err);
  }
};

const startServer = (): void => {
  const io = new Server(httpServer);

  io.on('connection', (socket: Socket) => {
    socket.on('subscribe', (topic: string) => handleSubscribe(socket, topic));
    socket.on('unsubscribe', (topic: string) => handleUnsubscribe(socket, topic));
    socket.on('message', handleMessage);
    socket.on('disconnecting', () => handleDisconnecting(socket));
  });

  subClient.on('message', (topic: string, message: string) => {
    io.to(topic).emit('message', JSON.stringify({ topic, message }));
  });

  httpServer.listen(process.env.PORT || 8102, () => console.log('Listening on', process.env.PORT || 8102));
};

const init = async (): Promise<void> => {
  pubClient = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || "") || 6379 });
  subClient = pubClient.duplicate();

  pubClient.on('connect', startServer);
  pubClient.on('error', (err: Error) => console.error('pubClient err:', err));
  subClient.on('error', (err: Error) => console.error('subClient err:', err));
};

init().catch((err: Error) => console.error('Init failed:', err));
