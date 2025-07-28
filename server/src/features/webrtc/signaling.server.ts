import { WebSocketServer, WebSocket } from "ws";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

interface Client {
  ws: WebSocket;
  displayName: string;
}

interface Room {
  hostId: string | null;
  clients: Map<string, Client>;
  isEveryoneMuted: boolean; // Track the room's mute state
}

const rooms = new Map<string, Room>();

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
      rooms.set(roomId, {
        hostId: null,
        clients: new Map(),
        isEveryoneMuted: false,
      });
    }
    const room = rooms.get(roomId)!;
    const clientId = uuidv4();

    if (!room.hostId) {
      room.hostId = clientId;
    }

    room.clients.set(clientId, { ws, displayName });

    const peers = Array.from(room.clients.entries())
      .filter(([id]) => id !== clientId)
      .map(([id, client]) => ({ id, displayName: client.displayName }));

    // Tell the new user the current global mute state
    ws.send(
      JSON.stringify({
        type: "init",
        payload: {
          selfId: clientId,
          peers,
          hostId: room.hostId,
          isRoomMuted: room.isEveryoneMuted,
        },
      })
    );

    const joinedMessage = JSON.stringify({
      type: "user-joined",
      payload: { peerId: clientId, displayName, hostId: room.hostId },
    });
    room.clients.forEach((peer, peerId) => {
      if (peerId !== clientId && peer.ws.readyState === WebSocket.OPEN) {
        peer.ws.send(joinedMessage);
      }
    });

    ws.on("message", (rawMessage: Buffer) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        message.senderId = clientId;
        message.senderName = displayName;

        // Host wants to toggle the mute state for everyone
        if (message.type === "toggle-mute-all") {
          room.isEveryoneMuted = message.payload.isMuted;
          const updatedStateMessage = JSON.stringify({
            type: "all-peers-muted-state-changed",
            payload: { isMuted: room.isEveryoneMuted },
          });
          room.clients.forEach((c) => c.ws.send(updatedStateMessage));
        } else if (message.targetId) {
          const targetClient = room.clients.get(message.targetId);
          if (targetClient) {
            targetClient.ws.send(JSON.stringify(message));
          }
        } else {
          room.clients.forEach((c) => c.ws.send(JSON.stringify(message)));
        }
      } catch (error) {
        console.error(`[Signal] Error processing message:`, error);
      }
    });

    ws.on("close", () => {
      room.clients.delete(clientId);
      if (room.clients.size > 0) {
        if (room.hostId === clientId) {
          room.hostId = room.clients.keys().next().value || null;
        }
        const leftMessage = JSON.stringify({
          type: "user-disconnected",
          payload: { peerId: clientId, newHostId: room.hostId },
        });
        room.clients.forEach((peer) => peer.ws.send(leftMessage));
      } else {
        rooms.delete(roomId);
      }
    });

    ws.on("error", (error) =>
      console.error(`[Signal] WebSocket error for client ${clientId}:`, error)
    );
  });

  console.log("✅ WebRTC Signaling Server has been initialized.");
};
