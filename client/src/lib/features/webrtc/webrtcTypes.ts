export interface PeerMutePayload {
  mutedPeerId: string;
  muterPeerId: string;
  isMuted: boolean;
}

export interface MuteStatus {
  isMutedByHost: boolean;
  personallyMutedBy: string[];
}

export interface WebRTCState {
  isCallActive: boolean;
  roomId: string | null;
  myId: string | null;
  isHost: boolean;
  hostId: string | null;
  remoteStreams: Record<string, MediaStream>;
  peerDisplayNames: Record<string, string>;
  peerMuteStatus: Record<string, MuteStatus>;
}
