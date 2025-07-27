//src/lib/store.ts

// =================================================================
// FILE: src/lib/store.ts (Corrected Version)
// =================================================================
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Reducers
import authReducer from "./features/auth/authSlice";
import userReducer from "./features/user/userSlice";
import uploadProgressReducer from "./features/upload/uploadProgressSlice";
import { authApiSlice } from "./features/auth/authApiSlice";
import uiReducer from "./features/ui/uiSlice";
import { userApiSlice } from "./features/user/userApiSlice";
import { adminApiSlice } from "./features/admin/adminApiSlice";

export const store = configureStore({
  reducer: {
    // Standard Reducers
    auth: authReducer,
    user: userReducer,
    uploadProgress: uploadProgressReducer,
    ui: uiReducer,

    // RTK Query Reducers
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [authApiSlice.reducerPath]: authApiSlice.reducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    // Chain all middleware correctly using .concat()
    getDefaultMiddleware()
      .concat(userApiSlice.middleware)
      .concat(authApiSlice.middleware)
      .concat(adminApiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
