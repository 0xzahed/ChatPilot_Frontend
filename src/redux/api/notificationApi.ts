import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Notification } from "@/types/api";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseApi,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<{ results: Notification[]; count: number; next: string | null; previous: string | null } | Notification[], Record<string, unknown> | void>({
      query: (params) => ({ url: "/notifications/", method: "GET", params: params || undefined }),
      providesTags: ["Notification"],
    }),
    markRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read/`, method: "POST" }),
      invalidatesTags: ["Notification"],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all/", method: "POST" }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
