// FILE: src/lib/features/ui/uiSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/lib/store";

type InteractionType = "perform this action";

interface UiState {
  isAuthModalOpen: boolean;
  interactionType: InteractionType;
}

const initialState: UiState = {
  isAuthModalOpen: false,
  interactionType: "perform this action",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openAuthModal(state) {
      state.isAuthModalOpen = true;
      state.interactionType = "perform this action";
    },
    closeAuthModal(state) {
      state.isAuthModalOpen = false;
    },
  },
});

export const { openAuthModal, closeAuthModal } = uiSlice.actions;

export const selectAuthModalState = (state: RootState) => state.ui;

export default uiSlice.reducer;
