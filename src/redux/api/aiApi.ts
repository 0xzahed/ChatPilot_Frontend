import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { AISettings, AIInstructions, AIEvent, AIUsage } from "@/types/api";

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: baseApi,
  tagTypes: ["AISettings", "AIInstructions", "AIEvent", "AIUsage"],
  endpoints: (builder) => ({
    getAISettings: builder.query<AISettings, string>({
      query: (workspaceId) => `/ai/${workspaceId}/settings/`,
      providesTags: (r, e, id) => [{ type: "AISettings", id }],
    }),
    updateAISettings: builder.mutation<AISettings, { workspaceId: string; data: Record<string, unknown> }>({
      query: ({ workspaceId, data }) => ({ url: `/ai/${workspaceId}/settings/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { workspaceId }) => [{ type: "AISettings", id: workspaceId }],
    }),
    getAIInstructions: builder.query<AIInstructions, string>({
      query: (workspaceId) => `/ai/${workspaceId}/instructions/`,
      providesTags: (r, e, id) => [{ type: "AIInstructions", id }],
    }),
    updateAIInstructions: builder.mutation<AIInstructions, { workspaceId: string; data: Record<string, unknown> }>({
      query: ({ workspaceId, data }) => ({ url: `/ai/${workspaceId}/instructions/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { workspaceId }) => [{ type: "AIInstructions", id: workspaceId }],
    }),
    getAIEvents: builder.query<AIEvent[], void>({
      query: () => "/ai/events/",
      providesTags: ["AIEvent"],
    }),
    getAIUsage: builder.query<AIUsage, string>({
      query: (workspaceId) => `/ai/${workspaceId}/usage/`,
      providesTags: (r, e, id) => [{ type: "AIUsage", id }],
    }),
    testAI: builder.mutation<{ response?: string; suggestion?: string } & Record<string, unknown>, { workspaceId: string; message: string }>({
      query: ({ workspaceId, message }) => ({
        url: `/ai/${workspaceId}/test/`,
        method: "POST",
        body: { message },
      }),
    }),
  }),
});

export const {
  useGetAISettingsQuery,
  useUpdateAISettingsMutation,
  useGetAIInstructionsQuery,
  useUpdateAIInstructionsMutation,
  useGetAIEventsQuery,
  useGetAIUsageQuery,
  useTestAIMutation,
} = aiApi;
