// client/src/lib/features/webrtc/webrtcTypes.ts
export interface WebRTCState {
  isCallActive: boolean;
  roomId: string | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>; // Keyed by peerId
}
