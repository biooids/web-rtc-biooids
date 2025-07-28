import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

interface Client {
  ws: WebSocket;
  displayName: string;
}

const rooms = new Map<string, Map<string, Client>>();

export const initSignalingServer = (httpServer: HttpServer) => {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws: WebSocket, req) => {
    const url = new URL(req.url || "", `ws://${req.headers.host}`);
    const roomId = url.searchParams.get("roomId");
    const displayName = url.searchParams.get("displayName") || "Guest";

    if (!roomId) {
      ws.close(1008, "Room ID is required.");
      return;
    }

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    const room = rooms.get(roomId)!;
    const clientId = uuidv4();
    room.set(clientId, { ws, displayName });
    console.log(
      `[Signal] Client ${clientId} (${displayName}) connected to room ${roomId}`
    );

    // --- FIX IS HERE ---
    // 1. Get the list of all peers already in the room.
    const peers = Array.from(room.entries())
      .filter(([id]) => id !== clientId) // Exclude the new client itself
      .map(([id, client]) => ({ id, displayName: client.displayName }));

    // 2. Send the 'init' message with the list of peers to the new client.
    ws.send(
      JSON.stringify({ type: "init", payload: { selfId: clientId, peers } })
    );

    // Announce the new client to all existing peers. They will initiate the calls.
    const joinedMessage = JSON.stringify({
      type: "user-joined",
      payload: { peerId: clientId, displayName },
    });
    room.forEach((peer, peerId) => {
      if (peerId !== clientId && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(joinedMessage);
      }
    });

    ws.on("message", (rawMessage: Buffer) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        message.senderId = clientId;
        const targetClient = message.targetId
          ? room.get(message.targetId)
          : null;
        if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
          targetClient.ws.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error(
          `[Signal] Failed to process message from ${clientId}:`,
          error
        );
      }
    });

    ws.on("close", () => {
      console.log(`[Signal] Client ${clientId} (${displayName}) disconnected`);
      room.delete(clientId);
      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        const leftMessage = JSON.stringify({
          type: "user-disconnected",
          payload: { peerId: clientId },
        });
        room.forEach((peer) => peer.ws.send(leftMessage));
      }
    });

    ws.on("error", (error) =>
      console.error(`[Signal] WebSocket error for client ${clientId}:`, error)
    );
  });

  console.log("✅ WebRTC Signaling Server has been initialized.");
};
