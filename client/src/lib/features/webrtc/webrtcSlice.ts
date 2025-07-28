import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

const initialState: WebRTCState = {
  isCallActive: false,
  roomId: null,
  myId: null,
  isHost: false,
  hostId: null,
  remoteStreams: {},
  peerDisplayNames: {},
  peerMuteStatus: {},
};

const webrtcSlice = createSlice({
  name: "webrtc",
  initialState,
  reducers: {
    callStarted: (state, action: PayloadAction<string>) => {
      state.isCallActive = true;
      state.roomId = action.payload;
    },
    callEnded: () => initialState,
    setMyId: (state, action: PayloadAction<string>) => {
      state.myId = action.payload;
    },
    setIsHost: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload;
    },
    setHostId: (state, action: PayloadAction<string | null>) => {
      state.hostId = action.payload;
    },
    addPeer: (
      state,
      action: PayloadAction<{ peerId: string; displayName: string }>
    ) => {
      const { peerId, displayName } = action.payload;
      state.peerDisplayNames[peerId] = displayName;
      state.peerMuteStatus[peerId] = {
        isMutedByHost: false,
        personallyMutedBy: [],
      };
    },
    removePeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      const stream = state.remoteStreams[peerId];
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      delete state.remoteStreams[peerId];
      delete state.peerDisplayNames[peerId];
      delete state.peerMuteStatus[peerId];
    },
    addRemoteStream: (
      state,
      action: PayloadAction<{ peerId: string; stream: MediaStream }>
    ) => {
      state.remoteStreams[action.payload.peerId] = action.payload.stream;
    },
    // --- THIS IS THE FINAL CORRECTED LOGIC ---
    togglePersonalMute: (
      state,
      action: PayloadAction<{ peerIdToMute: string; localPeerId: string }>
    ) => {
      const { peerIdToMute, localPeerId } = action.payload;
      const status = state.peerMuteStatus[peerIdToMute];
      if (status) {
        const isMuted = status.personallyMutedBy.includes(localPeerId);

        // Create a new array to guarantee an immutable update
        const newMutedBy = isMuted
          ? status.personallyMutedBy.filter((id) => id !== localPeerId)
          : [...status.personallyMutedBy, localPeerId];

        // Assign the new array back to the state
        state.peerMuteStatus[peerIdToMute].personallyMutedBy = newMutedBy;
      }
    },
    setAllPeersMutedByHost: (state, action: PayloadAction<boolean>) => {
      const isMuted = action.payload;
      for (const peerId in state.peerMuteStatus) {
        state.peerMuteStatus[peerId].isMutedByHost = isMuted;
      }
    },
  },
});

export const {
  callStarted,
  callEnded,
  setMyId,
  setIsHost,
  setHostId,
  addPeer,
  removePeer,
  addRemoteStream,
  togglePersonalMute,
  setAllPeersMutedByHost,
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
