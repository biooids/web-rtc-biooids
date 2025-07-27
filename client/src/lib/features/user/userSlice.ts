// =================================================================
// FILE: src/lib/features/user/userSlice.ts
// =================================================================
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { userApiSlice } from "./userApiSlice";
import { loggedOut } from "../auth/authSlice";
import type { RootState } from "../../store";
import type {
  SanitizedUserDto,
  UsersState,
  UpdateProfileApiResponse,
} from "./userTypes";

const initialState: UsersState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<SanitizedUserDto | null>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loggedOut, (state) => {
        state.currentUser = null;
      })
      .addMatcher(
        userApiSlice.endpoints.getMe.matchFulfilled,
        (state, action: PayloadAction<SanitizedUserDto>) => {
          state.currentUser = action.payload;
        }
      )
      .addMatcher(
        userApiSlice.endpoints.updateMyProfile.matchFulfilled,
        (state, action: PayloadAction<UpdateProfileApiResponse>) => {
          if (action.payload.data?.user) {
            state.currentUser = action.payload.data.user;
          }
        }
      );
  },
});

export const { setCurrentUser } = userSlice.actions;
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export default userSlice.reducer;
