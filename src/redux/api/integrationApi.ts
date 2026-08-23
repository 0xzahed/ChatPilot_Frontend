import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Integration {
  id: string;
  type: string;
  status?: string;
  connected?: boolean;
  [key: string]: any;
}

export interface WebhookEvent {
  id: string;
  [key: string]: any;
}

export interface SyncLog {
  id: string;
  [key: string]: any;
}

export const integrationApi = createApi({
  reducerPath: "integrationApi",
  baseQuery: baseApi,
  tagTypes: ["Integration", "WebhookEvent", "SyncLog"],
  endpoints: (builder) => ({
    getIntegrations: builder.query<Integration[], void>({
      query: () => "/integrations/",
      providesTags: ["Integration"],
    }),
    connectIntegration: builder.mutation<any, { type: string; workspaceId: string }>({
      query: ({ type, workspaceId }) => ({
        url: `/integrations/connect/${type}/`,
        method: "GET",
        params: { workspace_id: workspaceId },
      }),
      invalidatesTags: ["Integration"],
    }),
    callbackIntegration: builder.mutation<any, { type: string; code: string; state: string }>({
      query: ({ type, code, state }) => ({
        url: `/integrations/callback/${type}/`,
        method: "GET",
        params: { code, state },
      }),
      invalidatesTags: ["Integration"],
    }),
    completeIntegration: builder.mutation<any, { type: string; code: string; state: string }>({
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
    setupWhatsApp: builder.mutation<any, { workspaceId: string; accessToken: string; phoneNumberId: string }>({
      query: ({ workspaceId, accessToken, phoneNumberId }) => ({
        url: "/integrations/whatsapp/setup/",
        method: "POST",
        body: { workspace_id: workspaceId, access_token: accessToken, phone_number_id: phoneNumberId },
      }),
      invalidatesTags: ["Integration"],
    }),
    getWebhookEvents: builder.query<WebhookEvent[] | { results: WebhookEvent[] }, any>({
      query: (params) => ({ url: "/integrations/webhooks/", method: "GET", params }),
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
  useGetWebhookEventsQuery,
  useReplayWebhookMutation,
  useGetSyncLogsQuery,
} = integrationApi;
