import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the WebRTC state
export interface WebRTCState {
  isCallActive: boolean;
  roomId: string | null;
  localStream: MediaStream | null; // This is useful for UI but not managed here
  remoteStreams: Record<string, MediaStream>; // Keyed by peerId
}

const initialState: WebRTCState = {
  isCallActive: false,
  roomId: null,
  localStream: null,
  remoteStreams: {},
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
      // Stop tracks for all remote streams before clearing them
      Object.values(state.remoteStreams).forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      state.isCallActive = false;
      state.roomId = null;
      state.remoteStreams = {};
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      // Note: Storing MediaStream in Redux is generally discouraged
      // but can be acceptable for simple use cases like this.
      state.localStream = action.payload;
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
      }
    },
  },
});

export const {
  callStarted,
  callEnded,
  setLocalStream,
  addRemoteStream,
  removeRemoteStream,
} = webrtcSlice.actions;

export default webrtcSlice.reducer;
