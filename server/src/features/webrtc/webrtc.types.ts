// FILE: src/features/webrtc/webrtc.types.ts

import { WebSocket } from "ws";

// --- Base Message Structure ---
// All messages sent over the WebSocket will follow this basic structure.
export interface SignalingMessage {
  type: string;
  payload: unknown;
  senderId?: string; // The ID of the user who sent the message
  targetId?: string; // The ID of the user the message is intended for
}

// --- Specific Message Payloads ---

// Payload for WebRTC offers and answers
export interface SdpPayload {
  sdp: RTCSessionDescriptionInit;
}

// Payload for ICE candidates
export interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
}

// --- Client Management ---

// Represents a connected client in a room
export interface Client {
  id: string;
  ws: WebSocket;
}
