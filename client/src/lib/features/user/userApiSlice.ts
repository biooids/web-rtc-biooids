// FILE: src/lib/features/user/userApiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import { loggedOut } from "../auth/authSlice";
import {
  uploadStarted,
  uploadProgressUpdated,
  uploadSucceeded,
  uploadFailed,
} from "../upload/uploadProgressSlice";
import type {
  SanitizedUserDto,
  GetMeApiResponse,
  UpdateProfileApiResponse,
  UserProfile,
} from "./userTypes";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me", "User"],
  endpoints: (builder) => ({
    getMe: builder.query<SanitizedUserDto, void>({
      query: () => "/users/me", // Note: Path changed to match new backend routes
      transformResponse: (response: GetMeApiResponse) => response.data.user,
      providesTags: ["Me"],
    }),

    getUserByUsername: builder.query<UserProfile, string>({
      query: (username) => `/users/profile/${username}`, // Note: Path changed
      transformResponse: (response: { status: string; data: UserProfile }) =>
        response.data,
      providesTags: (result, error, username) => [
        { type: "User", id: username },
      ],
    }),

    updateMyProfile: builder.mutation<UpdateProfileApiResponse, FormData>({
      queryFn: async (formData, api, _extraOptions) => {
        const { dispatch } = api;
        const file = (formData.get("profileImage") ||
          formData.get("bannerImage")) as File | null;
        const performUpload = (token: string) => {
          return new Promise<any>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(
              "PATCH",
              `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/me` // Note: Path changed
            );
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded * 100) / event.total);
                dispatch(uploadProgressUpdated(progress));
              }
            };
            xhr.onload = () => {
              const response = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                dispatch(uploadSucceeded());
                resolve({ data: response }); // Wrap in `data` to match RTK Query structure
              } else {
                dispatch(uploadFailed(response.message || "Upload failed"));
                reject({ status: xhr.status, data: response });
              }
            };
            xhr.onerror = () => {
              const errorMsg = "A network error occurred during upload.";
              dispatch(uploadFailed(errorMsg));
              reject({ status: "NETWORK_ERROR", data: { message: errorMsg } });
            };
            xhr.send(formData);
          });
        };
        try {
          dispatch(uploadStarted(file?.name || "file"));
          const session = await getSession();
          if (!session?.backendAccessToken) {
            throw new Error("Not authenticated.");
          }
          const result = await performUpload(session.backendAccessToken);
          return result;
        } catch (error: any) {
          if (error.status === 401) {
            dispatch(
              uploadFailed("Your session has expired. Please reload the page.")
            );
          }
          return { error: { status: error.status, data: error.data } };
        }
      },
      invalidatesTags: ["Me"],
    }),

    deleteMyAccount: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/users/me", method: "DELETE" }), // Note: Path changed
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(loggedOut());
        } catch (error) {
          dispatch(loggedOut());
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useDeleteMyAccountMutation,
  useGetUserByUsernameQuery,
} = userApiSlice;
