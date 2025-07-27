import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

const rooms = new Map<string, Map<string, WebSocket>>();

/**
 * Initializes the WebSocket signaling server and attaches it to your main HTTP server.
 * @param httpServer The main HTTP server instance from your application.
 */
export const initSignalingServer = (httpServer: HttpServer) => {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, req) => {
    const url = new URL(req.url || "", `ws://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId");

    if (!roomId) {
      console.log("[Signal] Connection rejected: Missing roomId");
      ws.close(1008, "Room ID is required.");
      return;
    }

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    const room = rooms.get(roomId)!;
    const clientId = uuidv4();
    room.set(clientId, ws);
    console.log(`[Signal] Client ${clientId} connected to room ${roomId}`);

    // Send the new client its ID. It will wait for existing peers to call it.
    ws.send(JSON.stringify({ type: "init", payload: { selfId: clientId } }));

    // Announce the new client to everyone else. They will be responsible for initiating the call.
    const joinedMessage = JSON.stringify({
      type: "user-joined",
      payload: { peerId: clientId },
    });
    room.forEach((peerWs, peerId) => {
      if (peerId !== clientId && peerWs.readyState === WebSocket.OPEN) {
        peerWs.send(joinedMessage);
      }
    });

    ws.on("message", (rawMessage: Buffer) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        message.senderId = clientId;

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

    ws.on("close", () => {
      console.log(
        `[Signal] Client ${clientId} disconnected from room ${roomId}`
      );
      room.delete(clientId);

      if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`[Signal] Room ${roomId} is empty and has been removed.`);
      } else {
        const leftMessage = JSON.stringify({
          type: "user-disconnected",
          payload: { peerId: clientId },
        });
        room.forEach((peerWs) => peerWs.send(leftMessage));
      }
    });

    ws.on("error", (error) => {
      console.error(`[Signal] WebSocket error for client ${clientId}:`, error);
    });
  });

  console.log("✅ WebRTC Signaling Server has been initialized.");
};
