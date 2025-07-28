import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WebRTCState {
  isCallActive: boolean;
  roomId: string | null;
  remoteStreams: Record<string, MediaStream>;
  // 1. Add a map for peer display names
  peerDisplayNames: Record<string, string>;
}

const initialState: WebRTCState = {
  isCallActive: false,
  roomId: null,
  remoteStreams: {},
  // 2. Initialize the empty map
  peerDisplayNames: {},
};

const webrtcSlice = createSlice({
  name: "webrtc",
  initialState,
  reducers: {
    callStarted: (state, action: PayloadAction<string>) => {
      state.isCallActive = true;
      state.roomId = action.payload;
    },
    callEnded: (state) => {
      Object.values(state.remoteStreams).forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      state.isCallActive = false;
      state.roomId = null;
      state.remoteStreams = {};
      // 3. Reset display names on call end
      state.peerDisplayNames = {};
    },
    addRemoteStream: (
      state,
      action: PayloadAction<{ peerId: string; stream: MediaStream }>
    ) => {
      state.remoteStreams[action.payload.peerId] = action.payload.stream;
    },
    removeRemoteStream: (state, action: PayloadAction<string>) => {
      const peerId = action.payload;
      const stream = state.remoteStreams[peerId];
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        delete state.remoteStreams[peerId];
        // 4. Remove the display name when a peer leaves
        delete state.peerDisplayNames[peerId];
      }
    },
    // 5. New action to set a display name for a peer
    setPeerDisplayName: (
      state,
      action: PayloadAction<{ peerId: string; displayName: string }>
    ) => {
      state.peerDisplayNames[action.payload.peerId] =
        action.payload.displayName;
    },
  },
});

export const {
  callStarted,
  callEnded,
  addRemoteStream,
  removeRemoteStream,
  setPeerDisplayName, // 6. Export the new action
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
