# Realtime WebSocket Service

This Node.js service subscribes to Redis pub/sub events and broadcasts them to WebSocket clients.

## Run locally

```bash
npm install
npm run dev
```

## WebSocket endpoint

- `ws://localhost:8081?userId=<uuid>`

If an event contains `user_id`, it is only delivered to matching `userId` subscribers.
