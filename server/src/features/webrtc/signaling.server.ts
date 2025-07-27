import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

// This in-memory map will store all our active rooms.
// The key is the roomId, and the value is another Map of connected clients.
const rooms = new Map<string, Map<string, WebSocket>>();

/**
 * Initializes the WebSocket signaling server and attaches it to your main HTTP server.
 * @param httpServer The main HTTP server instance from your application.
 */
export const initSignalingServer = (httpServer: HttpServer) => {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, req) => {
    // 1. Extract the roomId from the connection URL.
    const url = new URL(req.url || "", `ws://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      console.log("[Signal] Connection rejected: Missing roomId");
      ws.close(1008, "Room ID is required.");
      return;
    }

    // 2. Create the room if it's the first client joining.
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    const room = rooms.get(roomId)!;
    const clientId = uuidv4();

    // 3. Add the new client to the room.
    room.set(clientId, ws);
    console.log(`[Signal] Client ${clientId} connected to room ${roomId}`);

    // 4. Send an 'init' message to the new client.
    // This gives them their unique ID and a list of all other peers already in the room.
    const peerIds = Array.from(room.keys()).filter((id) => id !== clientId);
    ws.send(
      JSON.stringify({ type: "init", payload: { selfId: clientId, peerIds } })
    );

    // 5. Announce the new client's arrival to all existing members of the room.
    const joinedMessage = JSON.stringify({
      type: "user-joined",
      payload: { peerId: clientId },
    });
    room.forEach((peerWs, peerId) => {
      if (peerId !== clientId && peerWs.readyState === WebSocket.OPEN) {
        peerWs.send(joinedMessage);
      }
    });

    // --- Handle Messages from this Client ---
    ws.on("message", (rawMessage: Buffer) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        // Add the sender's ID to the message so the recipient knows who it's from.
        message.senderId = clientId;

        // If the message has a specific target, send it only to that client.
        const targetWs = message.targetId ? room.get(message.targetId) : null;
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error(
          `[Signal] Failed to process message from ${clientId}:`,
          error
        );
      }
    });

    // --- Handle Client Disconnection ---
    ws.on("close", () => {
      console.log(
        `[Signal] Client ${clientId} disconnected from room ${roomId}`
      );
      room.delete(clientId);

      // If the room is now empty, remove it from memory.
      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`[Signal] Room ${roomId} is empty and has been removed.`);
      } else {
        // Notify remaining clients that this user has left.
        const leftMessage = JSON.stringify({
          type: "user-disconnected",
          payload: { peerId: clientId },
        });
        room.forEach((peerWs) => peerWs.send(leftMessage));
      }
    });

    // --- Handle Errors ---
    ws.on("error", (error) => {
      console.error(`[Signal] WebSocket error for client ${clientId}:`, error);
    });
  });

  console.log("✅ WebRTC Signaling Server has been initialized.");
};
