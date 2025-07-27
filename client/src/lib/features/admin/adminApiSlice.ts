// =================================================================
// FILE: src/lib/features/admin/adminApiSlice.ts
// =================================================================
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../api/baseQueryWithReauth";
import {
  AdminApiQuery,
  GetAdminStatsResponse,
  GetAdminUsersResponse,
  GetAdminPostsResponse,
  GetAdminCommentsResponse,
  SystemRole,
} from "./adminTypes";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminStats", "AdminUsers", "AdminPosts", "AdminComments"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<GetAdminStatsResponse, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),
    getAdminUsers: builder.query<GetAdminUsersResponse, AdminApiQuery>({
      query: (args) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
        return `/admin/users?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.users.map(({ id }) => ({
                type: "AdminUsers" as const,
                id,
              })),
              { type: "AdminUsers", id: "LIST" },
            ]
          : [{ type: "AdminUsers", id: "LIST" }],
    }),
    getAdminPosts: builder.query<GetAdminPostsResponse, AdminApiQuery>({
      query: (args) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
        return `/admin/posts?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.posts.map(({ id }) => ({
                type: "AdminPosts" as const,
                id,
              })),
              { type: "AdminPosts", id: "LIST" },
            ]
          : [{ type: "AdminPosts", id: "LIST" }],
    }),
    getAdminComments: builder.query<GetAdminCommentsResponse, AdminApiQuery>({
      query: (args) => {
        const params = new URLSearchParams();
        Object.entries(args).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
        return `/admin/comments?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.comments.map(({ id }) => ({
                type: "AdminComments" as const,
                id,
              })),
              { type: "AdminComments", id: "LIST" },
            ]
          : [{ type: "AdminComments", id: "LIST" }],
    }),
    updateUserRole: builder.mutation<
      void,
      { userId: string; role: SystemRole }
    >({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: [{ type: "AdminUsers", id: "LIST" }],
    }),
    deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
      query: (userId) => ({ url: `/admin/users/${userId}`, method: "DELETE" }),
      invalidatesTags: ["AdminUsers", "AdminStats"],
    }),
    deletePost: builder.mutation<{ success: boolean; id: string }, string>({
      query: (postId) => ({ url: `/admin/posts/${postId}`, method: "DELETE" }),
      invalidatesTags: ["AdminPosts", "AdminStats"],
    }),
    deleteComment: builder.mutation<{ success: boolean; id: string }, string>({
      query: (commentId) => ({
        url: `/admin/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminComments", "AdminStats"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminPostsQuery,
  useGetAdminCommentsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useDeletePostMutation,
  useDeleteCommentMutation,
} = adminApiSlice;
