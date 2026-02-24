import { WebSocketServer } from "ws";
import Redis from "ioredis";

const port = Number(process.env.PORT || 8081);
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379/0";
const redisChannel = process.env.WS_REDIS_CHANNEL || "havilah:events";

const wsServer = new WebSocketServer({ port });
const subscriber = new Redis(redisUrl);

const clients = new Map();

function safeSend(client, payload) {
  if (client.readyState === client.OPEN) {
    client.send(JSON.stringify(payload));
  }
}

wsServer.on("connection", (socket, request) => {
  const url = new URL(request.url || "/", "http://localhost");
  const userId = url.searchParams.get("userId");
  clients.set(socket, { userId });

  safeSend(socket, { type: "connected", userId, channel: redisChannel });

  socket.on("close", () => {
    clients.delete(socket);
  });
});

subscriber.subscribe(redisChannel, (error) => {
  if (error) {
    console.error("Redis subscription failed:", error);
    process.exit(1);
  }
  console.log(`Subscribed to channel "${redisChannel}"`);
});

subscriber.on("message", (_channel, message) => {
  let payload = null;
  try {
    payload = JSON.parse(message);
  } catch {
    payload = { type: "unknown", raw: message };
  }

  for (const [socket, meta] of clients.entries()) {
    const eventUserId = payload?.user_id || null;
    if (eventUserId && meta.userId && eventUserId !== meta.userId) {
      continue;
    }
    safeSend(socket, payload);
  }
});

setInterval(() => {
  for (const socket of clients.keys()) {
    if (socket.readyState !== socket.OPEN) {
      clients.delete(socket);
      continue;
    }
    socket.ping();
  }
}, 30000);

console.log(`WebSocket server listening on ws://0.0.0.0:${port}`);
