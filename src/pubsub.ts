import { io, Socket } from 'socket.io-client';
import EventEmitter from 'events'

export type status = 'connected' | 'disconnected'
export const status = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
}

export default class PubSub extends EventEmitter {
  private socket: Socket;
  private static instance: PubSub | null = null; // Singleton instance
  static CONNECTED: status = 'connected'
  static DISCONNECTED: status = 'disconnected'

  get status(): status {
    return this.socket.connected ? PubSub.CONNECTED : PubSub.DISCONNECTED
  }

  constructor(url: string, options?: Record<string, any>) {
    super()

    this.socket = io(url, options);

    this.socket.on('message', (payload: string | Buffer) => {
      let originalTopic: string = ''
      let data: any = JSON.parse(payload.toString())

      // remove embedded topic if exists
      if( data.message.includes('|') ){
        [originalTopic, data.message] = data.message.split('|')
      }

      console.log(data.topic, originalTopic)
      this.emit(data.topic, JSON.parse(data.message));
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
    this.socket.emit('message', { topic, data:  JSON.stringify(message) });
  }

  unsubscribeFromTopic(topic: string, callback: (message: any) => void): PubSub {
    this.socket.emit('unsubscribe', topic);

    this.off(topic, callback)

    return this
  }
}
