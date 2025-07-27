// FILE: src/lib/api/baseQueryWithReauth.ts

import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { RootState } from "../store";
import { loggedOut, setCredentials } from "../features/auth/authSlice";

// Create a mutex to ensure that the token refresh process only runs once,
// even if multiple API calls fail simultaneously.
const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the Redux store and add it to the request headers
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for the mutex to be unlocked before making the request
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  // Check if the request failed due to an expired token (status 401)
  if (result.error && result.error.status === 401) {
    // Try to acquire the mutex lock. If we fail, it means another request
    // is already refreshing the token, so we wait for it to finish.
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // Attempt to refresh the token by calling our backend's refresh endpoint
        const refreshResult = await rawBaseQuery(
          "/auth/refresh",
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { accessToken } = (refreshResult.data as any).data;
          // Update the Redux store with the new token
          api.dispatch(setCredentials({ token: accessToken }));

          // Retry the original request with the new token
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // If refresh fails, log the user out
          console.error("Token refresh failed. Logging out.");
          api.dispatch(loggedOut());
        }
      } finally {
        // Release the lock so other requests can proceed
        release();
      }
    } else {
      // If the mutex was already locked, wait for it to be released and then retry the original request.
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
