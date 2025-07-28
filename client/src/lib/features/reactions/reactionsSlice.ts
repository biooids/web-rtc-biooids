import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Reaction {
  id: number; // Unique ID to re-trigger animations
  emoji: string;
  peerId: string;
}

interface ReactionsState {
  // Maps a peerId to their currently active reaction
  latestReactions: Record<string, Reaction | null>;
}

const initialState: ReactionsState = {
  latestReactions: {},
};

// --- FIX: createAsyncThunk manages the show-and-hide lifecycle ---
// This thunk will show a reaction and automatically clear it after 3 seconds.
export const showReaction = createAsyncThunk(
  "reactions/show",
  async (reactionData: { peerId: string; emoji: string }, { dispatch }) => {
    const reaction: Reaction = {
      ...reactionData,
      id: Date.now(), // Generate a unique ID for this specific reaction event
    };
    // Dispatch the action to show the reaction immediately.
    dispatch(reactionsSlice.actions.setReaction(reaction));

    // Wait for 3 seconds before clearing it.
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Return the original reaction data to the `fulfilled` reducer.
    return reaction;
  }
);

const reactionsSlice = createSlice({
  name: "reactions",
  initialState,
  reducers: {
    // This reducer places the reaction into the state.
    setReaction: (state, action: PayloadAction<Reaction>) => {
      state.latestReactions[action.payload.peerId] = action.payload;
    },
    // This reducer clears a reaction from the state.
    clearReaction: (
      state,
      action: PayloadAction<{ peerId: string; id: number }>
    ) => {
      const { peerId, id } = action.payload;
      // Only clear the reaction if it's the same one that triggered the timer.
      // This prevents a new reaction from being cleared by an old timer.
      if (state.latestReactions[peerId]?.id === id) {
        state.latestReactions[peerId] = null;
      }
    },
  },
  extraReducers: (builder) => {
    // When the showReaction thunk completes its 3-second timer...
    builder.addCase(showReaction.fulfilled, (state, action) => {
      // ...call the clearReaction reducer to remove it from the state.
      const { peerId, id } = action.payload;
      if (state.latestReactions[peerId]?.id === id) {
        state.latestReactions[peerId] = null;
      }
    });
  },
});

export const { setReaction, clearReaction } = reactionsSlice.actions;
export default reactionsSlice.reducer;
