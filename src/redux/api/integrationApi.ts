import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Integration, WebhookEvent, SyncLog } from "@/types/api";

export const integrationApi = createApi({
  reducerPath: "integrationApi",
  baseQuery: baseApi,
  tagTypes: ["Integration", "WebhookEvent", "SyncLog"],
  endpoints: (builder) => ({
    getIntegrations: builder.query<Integration[], void>({
      query: () => "/integrations/",
      providesTags: ["Integration"],
    }),
    connectIntegration: builder.mutation<{ requires_manual_setup?: boolean; auth_url?: string } & Record<string, unknown>, { type: string; workspaceId: string }>({
      query: ({ type, workspaceId }) => ({
        url: `/integrations/connect/${type}/`,
        method: "GET",
        params: { workspace_id: workspaceId },
      }),
      invalidatesTags: ["Integration"],
    }),
    callbackIntegration: builder.mutation<Record<string, unknown>, { type: string; code: string; state: string }>({
      query: ({ type, code, state }) => ({
        url: `/integrations/callback/${type}/`,
        method: "GET",
        params: { code, state },
      }),
      invalidatesTags: ["Integration"],
    }),
    completeIntegration: builder.mutation<Record<string, unknown>, { type: string; code: string; state: string }>({
      query: ({ type, code, state }) => ({
        url: `/integrations/complete/${type}/`,
        method: "POST",
        body: { code, state },
      }),
      invalidatesTags: ["Integration"],
    }),
    disconnectIntegration: builder.mutation<void, string>({
      query: (id) => ({ url: `/integrations/${id}/disconnect/`, method: "POST" }),
      invalidatesTags: ["Integration"],
    }),
    syncIntegration: builder.mutation<void, string>({
      query: (id) => ({ url: `/integrations/${id}/sync/`, method: "POST" }),
      invalidatesTags: ["Integration"],
    }),
    setupWhatsApp: builder.mutation<Record<string, unknown>, { workspaceId: string; accessToken: string; phoneNumberId: string }>({
      query: ({ workspaceId, accessToken, phoneNumberId }) => ({
        url: "/integrations/whatsapp/setup/",
        method: "POST",
        body: { workspace_id: workspaceId, access_token: accessToken, phone_number_id: phoneNumberId },
      }),
      invalidatesTags: ["Integration"],
    }),
    selectPages: builder.mutation<Record<string, unknown>, { integrationId: string; pageIds: string[] }>({
      query: ({ integrationId, pageIds }) => ({
        url: `/integrations/${integrationId}/select-pages/`,
        method: "POST",
        body: { page_ids: pageIds },
      }),
      invalidatesTags: ["Integration"],
    }),
    getWebhookEvents: builder.query<WebhookEvent[] | { results: WebhookEvent[] }, Record<string, unknown> | void>({
      query: (params) => ({ url: "/integrations/webhooks/", method: "GET", params: params || undefined }),
      providesTags: ["WebhookEvent"],
    }),
    replayWebhook: builder.mutation<void, string>({
      query: (id) => ({ url: `/integrations/webhooks/${id}/replay/`, method: "POST" }),
      invalidatesTags: ["WebhookEvent"],
    }),
    getSyncLogs: builder.query<SyncLog[], void>({
      query: () => "/integrations/sync-logs/",
      providesTags: ["SyncLog"],
    }),
  }),
});

export const {
  useGetIntegrationsQuery,
  useConnectIntegrationMutation,
  useCallbackIntegrationMutation,
  useCompleteIntegrationMutation,
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation,
  useSetupWhatsAppMutation,
  useSelectPagesMutation,
  useGetWebhookEventsQuery,
  useReplayWebhookMutation,
  useGetSyncLogsQuery,
} = integrationApi;
