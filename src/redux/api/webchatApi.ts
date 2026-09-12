import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { WebchatConfig } from "@/types/api";

export const webchatApi = createApi({
  reducerPath: "webchatApi",
  baseQuery: baseApi,
  tagTypes: ["WebchatConfig"],
  endpoints: (builder) => ({
    getWebchatConfig: builder.query<WebchatConfig, string>({
      query: (workspaceId) => `/webchat/config/${workspaceId}/`,
      providesTags: (r, e, id) => [{ type: "WebchatConfig", id }],
    }),
    updateWebchatConfig: builder.mutation<WebchatConfig, { workspaceId: string; data: Record<string, unknown> }>({
      query: ({ workspaceId, data }) => ({
        url: `/webchat/config/${workspaceId}/`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (r, e, { workspaceId }) => [{ type: "WebchatConfig", id: workspaceId }],
    }),
  }),
});

export const {
  useGetWebchatConfigQuery,
  useUpdateWebchatConfigMutation,
} = webchatApi;
