import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WebRTCState, PeerMutePayload } from "./webrtcTypes";

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
      if (!state.peerMuteStatus[peerId]) {
        state.peerMuteStatus[peerId] = {
          isMutedByHost: false,
          personallyMutedBy: [],
        };
      }
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
    togglePersonalMute: (
      state,
      action: PayloadAction<{ peerIdToMute: string; localPeerId: string }>
    ) => {
      const { peerIdToMute, localPeerId } = action.payload;
      const status = state.peerMuteStatus[peerIdToMute];
      if (status) {
        const index = status.personallyMutedBy.indexOf(localPeerId);
        if (index > -1) {
          status.personallyMutedBy.splice(index, 1);
        } else {
          status.personallyMutedBy.push(localPeerId);
        }
      }
    },
    // --- FIX: Added reducer to handle incoming mute events from other peers ---
    updatePeerPersonalMute: (state, action: PayloadAction<PeerMutePayload>) => {
      const { mutedPeerId, muterPeerId, isMuted } = action.payload;
      const status = state.peerMuteStatus[mutedPeerId];
      if (status) {
        const index = status.personallyMutedBy.indexOf(muterPeerId);
        if (isMuted && index === -1) {
          status.personallyMutedBy.push(muterPeerId);
        } else if (!isMuted && index > -1) {
          status.personallyMutedBy.splice(index, 1);
        }
      }
    },
    setAllPeersMutedByHost: (state, action: PayloadAction<boolean>) => {
      for (const peerId in state.peerMuteStatus) {
        state.peerMuteStatus[peerId].isMutedByHost = action.payload;
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
  updatePeerPersonalMute,
  setAllPeersMutedByHost,
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
