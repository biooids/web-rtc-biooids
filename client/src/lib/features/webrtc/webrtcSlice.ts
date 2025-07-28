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
  unmuteRequestReceived: false,
  isRoomMutedByHost: false,
  allowedToSpeak: [],
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
          isSelfMuted: false, // --- FIX: Initialize new property ---
        };
      }
    },
    removePeer: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
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
      const isMuted = action.payload;
      state.isRoomMutedByHost = isMuted;
      for (const peerId in state.peerMuteStatus) {
        if (peerId !== state.hostId) {
          state.peerMuteStatus[peerId].isMutedByHost = isMuted;
        }
      }
      if (!isMuted) {
        state.allowedToSpeak = [];
      }
    },
    setUnmuteRequest: (state, action: PayloadAction<boolean>) => {
      state.unmuteRequestReceived = action.payload;
    },
    addAllowedSpeaker: (state, action: PayloadAction<string>) => {
      if (!state.allowedToSpeak.includes(action.payload)) {
        state.allowedToSpeak.push(action.payload);
      }
    },
    removeAllowedSpeaker: (state, action: PayloadAction<string>) => {
      state.allowedToSpeak = state.allowedToSpeak.filter(
        (id) => id !== action.payload
      );
    },
    // --- FIX: Add new reducer to handle peer self-mute updates ---
    setPeerSelfMuted: (
      state,
      action: PayloadAction<{ peerId: string; isMuted: boolean }>
    ) => {
      const { peerId, isMuted } = action.payload;
      if (state.peerMuteStatus[peerId]) {
        state.peerMuteStatus[peerId].isSelfMuted = isMuted;
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
  setUnmuteRequest,
  addAllowedSpeaker,
  removeAllowedSpeaker,
  setPeerSelfMuted,
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
