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
  isEveryoneMuted: boolean;
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

        switch (message.type) {
          case "toggle-mute-all":
            if (clientId === room.hostId) {
              room.isEveryoneMuted = message.payload.isMuted;
              const updatedStateMessage = JSON.stringify({
                type: "all-peers-muted-state-changed",
                payload: { isMuted: room.isEveryoneMuted },
              });
              room.clients.forEach((c) => c.ws.send(updatedStateMessage));
            }
            break;

          case "chat-message":
          case "reaction":
            room.clients.forEach((c) => {
              if (c.ws.readyState === WebSocket.OPEN)
                c.ws.send(JSON.stringify(message));
            });
            break;

          case "personal-mute-toggle":
          case "accepted-unmute-request":
          // --- FIX: Add the new message type to be broadcast to other participants ---
          case "local-audio-state-changed":
            room.clients.forEach((peer, peerId) => {
              if (peerId !== clientId && peer.ws.readyState === WebSocket.OPEN)
                peer.ws.send(JSON.stringify(message));
            });
            break;

          case "decline-unmute":
            const hostClient = room.clients.get(message.targetId);
            if (hostClient) hostClient.ws.send(JSON.stringify(message));
            break;

          case "request-unmute":
            if (clientId !== room.hostId) return;
            const targetToUnmute = room.clients.get(message.targetId);
            if (targetToUnmute) targetToUnmute.ws.send(JSON.stringify(message));
            break;

          case "force-mute":
            if (clientId !== room.hostId) return;
            const targetToMute = room.clients.get(message.targetId);
            if (targetToMute) {
              targetToMute.ws.send(JSON.stringify(message));
              const revokedMessage = JSON.stringify({
                type: "permission-revoked",
                payload: { peerId: message.targetId },
              });
              room.clients.forEach((peer, peerId) => {
                if (peerId !== clientId && peerId !== message.targetId) {
                  peer.ws.send(revokedMessage);
                }
              });
            }
            break;

          default:
            if (message.targetId) {
              const targetClient = room.clients.get(message.targetId);
              if (targetClient) targetClient.ws.send(JSON.stringify(message));
            } else {
              console.warn(
                `[Signal] Unhandled message type without targetId: ${message.type}`
              );
            }
            break;
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
