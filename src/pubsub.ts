import { io, Socket } from 'socket.io-client';
import EventEmitter from 'events'

export default class PubSub extends EventEmitter {
  private socket: Socket;
  private static instance: PubSub | null = null; // Singleton instance

  constructor(url: string, options?: Record<string, any>) {
    super()

    this.socket = io(url, options);

    this.socket.on('message', (message: string | Buffer) => {
      const data = JSON.parse(message.toString());

      this.emit(data.topic, data.message);
    });

    this.socket.on('connect', () => {
      this.emit('connect')
    });
  }

  // Singleton getInstance method
  static connect(url: string, options?: Record<string, any>): PubSub {
    if (!this.instance) {
      this.instance = new PubSub(url, options);
    }
    return this.instance;
  }

  subscribeToTopic(topic: string, callback: (message: any) => void): PubSub {
    this.socket.emit('subscribe', topic);

    this.on(topic, callback)

    return this
  }

  sendMessageToTopic(topic: string, message: any): void {
    this.socket.emit('message', { topic, data: message });
  }

  unsubscribeFromTopic(topic: string, callback: (message: any) => void): PubSub {
    this.socket.emit('unsubscribe', topic);

    this.off(topic, callback)

    return this
  }
}
