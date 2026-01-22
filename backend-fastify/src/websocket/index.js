import fastifyWebsocket from "@fastify/websocket";
import { userIdToken } from "../utils/users.js";

let fastifyInstance = null;

/**
 * Parse message of weboscket.
 * @param {string} message - the raw message from websocket.
 */
const parseMessage = function (message) {
  try {
    const parsedMessage = JSON.parse(message);
    return parsedMessage;
  } catch (error) {
    return message.toString();
  }
};

/**
 * Sends a WebSocket notification to specific clients.
 * @param {Object} payload - The payload to send as a WebSocket notification.
 * @param {String} type - The type of notification to send.
 * @param {String|String[]} targetUserId - A string or an array of user IDs to send the notification to.
 */
export const sendTargetedNotification = function (type, payload, targetUserId) {
  if (!fastifyInstance || !fastifyInstance.websocketServer) {
    console.warn("WebSocket server not initialized");
    return;
  }
  fastifyInstance.websocketServer.clients.forEach((client) => {
    if (
      Array.isArray(targetUserId)
        ? targetUserId.includes(client.userId)
        : targetUserId === client.userId
    ) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
};

/**
 * Sends a WebSocket notification to all connected clients.
 * @param {Object} payload - The payload to send as a WebSocket notification.
 * @param {String} type - The type of notification to send.
 */
export const sendGeneralNotification = function (type, payload) {
  if (!fastifyInstance || !fastifyInstance.websocketServer) {
    console.warn("WebSocket server not initialized");
    return;
  }
  fastifyInstance.websocketServer.clients.forEach((client) => {
    client.send(JSON.stringify({ type, payload }));
  });
};

/**
 * Sets up WebSocket functionality for the Fastify instance.
 * @param {import('fastify').FastifyInstance} fastify - The Fastify instance
 */
export const setFastifyWebsocket = function (fastify) {
  fastifyInstance = fastify;
  /**
   * @param {fastifyWebsocket} socket - The WebSocket connection
   * @param {FastifyRequest} req - The Fastify request object
   */
  fastify.register(async function (fastify) {
    fastify.get("/websocket", { websocket: true }, (socket, req) => {
      const userToken = req.query?.userToken || req.request?.query?.userToken;
      if (!socket) {
        console.error("\nWebSocket connection is undefined.\n");
        return;
      }
      if (userToken) {
        const userId = userIdToken(userToken);
        // Store the user ID in the socket context
        socket.userId = userId;
        fastify.websocketServer.clients.add(socket);
      }
      socket.on("close", () => {
        console.log("\n************  Web Socket - close *************\n");
      });
      socket.on("message", (message) => {
        console.log("Web Socket - message", parseMessage(message));
      });
    });
  });
};
