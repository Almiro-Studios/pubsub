# Almiro Studios Pub/Sub Service + Library

## Description
A simple pub/sub service to send and receive messages between clients.

# Requirements
- Node.js v16 or higher
- Redis server

# Server usage
## Environment variables used
```bash
REDIS_HOST=localhost
REDIS_PORT=6379 (optional, will default to redis default port)
```

## Docker usage
```bash
docker build . -t pubsub
docker run -e REDIS_HOST=localhost -e REDIS_PORT=6379 -p 8102:8102 -t pubsub
```

## Installation
```bash
git clone https://github.com/Almiro-Studios/pubsub.git
```

```bash
cd pubsub
npm install
```

## Build
```bash
npm run build
```
## Run
```bash
npm start
```
or
```bash
npm run dev
```

# Library usage
## Installation
```bash
npm i --save @almiro-studios/pubsub
```

## Usage
```javascript
const PubSub = require('@almiro-studios/pubsub');

PubSub.connect('http://localhost:8102');

PubSub.subscribeToTopic('myTopic', (message) => {
  console.log(message);
});

pubsub.on('connect', () => {
  console.log('Connected to server')

  PubSub.sendMessageToTopic('myTopic', 'Hello, world!');
});
```