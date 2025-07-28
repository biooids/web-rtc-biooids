import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Reaction {
  peerId: string;
  emoji: string;
  // Unique ID to help React with re-rendering the animation
  id: number;
}

export interface ReactionsState {
  // A record of the latest reaction for each peer
  latestReactions: Record<string, Reaction>;
}

const initialState: ReactionsState = {
  latestReactions: {},
};

const reactionsSlice = createSlice({
  name: "reactions",
  initialState,
  reducers: {
    showReaction: (state, action: PayloadAction<Reaction>) => {
      state.latestReactions[action.payload.peerId] = action.payload;
    },
  },
});

export const { showReaction } = reactionsSlice.actions;

export default reactionsSlice.reducer;
