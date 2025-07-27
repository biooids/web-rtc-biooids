// FILE: src/lib/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string | null }>) {
      state.token = action.payload.token;
    },
    loggedOut(state) {
      state.token = null;
    },
    clearCredentials(state) {
      state.token = null;
    },
  },
});

export const { setCredentials, loggedOut, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;
