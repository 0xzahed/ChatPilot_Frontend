import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Notification {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  read?: boolean;
  created_at?: string;
  [key: string]: any;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: baseApi,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<{ results: Notification[]; count: number; next: string | null; previous: string | null } | Notification[], any>({
      query: (params) => ({ url: "/notifications/", method: "GET", params }),
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
