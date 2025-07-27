// FILE: src/features/webrtc/signaling.server.ts

import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/config/logger";
import {
  SignalingMessage,
  SdpPayload,
  IceCandidatePayload,
  Client,
} from "./webrtc.types";

// This will store all our active rooms. The key is the roomId,
// and the value is a Map of connected clients (keyed by their unique ID).
const rooms = new Map<string, Map<string, Client>>();

/**
 * Initializes the WebSocket signaling server and attaches it to the main HTTP server.
 * @param httpServer The main HTTP server instance from your application.
 */
export const initSignalingServer = (httpServer: HttpServer) => {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, req) => {
    // Extract the roomId from the connection URL (e.g., /?roomId=my-room-123)
    const url = new URL(req.url!, `ws://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      logger.warn("Connection attempt without roomId. Closing connection.");
      ws.close(1008, "Room ID is required");
      return;
    }

    const clientId = uuidv4();
    logger.info(
      { roomId, clientId },
      "New client connected to signaling server"
    );

    // Create the room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const room = rooms.get(roomId)!;
    room.set(clientId, { id: clientId, ws });

    // --- Message Handling ---
    ws.on("message", (rawMessage: Buffer) => {
      try {
        const message: SignalingMessage = JSON.parse(rawMessage.toString());
        message.senderId = clientId; // Attach sender ID to the message

        // Relay the message to all *other* clients in the same room
        broadcastToRoom(roomId, message, clientId);
      } catch (error) {
        logger.error({ err: error, clientId }, "Failed to parse message");
      }
    });

    // --- Disconnection Handling ---
    ws.on("close", () => {
      logger.info({ roomId, clientId }, "Client disconnected");
      room.delete(clientId);

      // If the room is now empty, clean it up
      if (room.size === 0) {
        rooms.delete(roomId);
        logger.info({ roomId }, "Room is now empty and has been removed.");
      } else {
        // Notify other clients that this user has left
        broadcastToRoom(
          roomId,
          {
            type: "user-disconnected",
            payload: { id: clientId },
          },
          clientId // This message comes from the server, but we use the disconnected ID
        );
      }
    });

    ws.on("error", (error) => {
      logger.error({ err: error, clientId }, "WebSocket error for client");
    });
  });

  logger.info("✅ WebRTC Signaling Server initialized successfully.");
};

/**
 * Broadcasts a message to all clients in a room except the sender.
 * @param roomId The ID of the room.
 * @param message The message to send.
 * @param excludeId The ID of the client to exclude (the sender).
 */
function broadcastToRoom(
  roomId: string,
  message: SignalingMessage,
  excludeId: string
) {
  const room = rooms.get(roomId);
  if (!room) return;

  const outgoingMessage = JSON.stringify(message);

  for (const [id, client] of room.entries()) {
    if (id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(outgoingMessage);
    }
  }
}
