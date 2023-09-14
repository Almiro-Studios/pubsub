import { io } from 'socket.io-client'
import PubSub from './pubsub'

const pubsub = PubSub.connect('http://127.0.0.1:8102')

const onFirstMessage = (message: any) => {
  console.log('Received first message:', message)

  // unsubscribe from a topic
  pubsub.unsubscribeFromTopic('myTopic', onFirstMessage)

  pubsub.on('myTopic', onThirdMessage)

  // send message again
  pubsub.sendMessageToTopic('myTopic2', 'Second message only received once')
  pubsub.sendMessageToTopic('myTopic', 'this should not be received')
}

const onSecondMessage = (message: any) => {
  console.log('Received second message:', message)

  setTimeout(() => {
    process.exit(0)
  }, 2000)
}

const onThirdMessage = (message: any) => {
  console.log('Should not have received this message:', message)

  process.exit(1)
}

pubsub.on('connect', () => {
  console.log('Connected to server')

  pubsub.subscribeToTopic('myTopic', onFirstMessage)
  pubsub.subscribeToTopic('myTopic2', onSecondMessage)

  pubsub.sendMessageToTopic('myTopic', 'Hello, world!')
})