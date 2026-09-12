import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { UsageRecord } from "@/types/api";

export const usageApi = createApi({
  reducerPath: "usageApi",
  baseQuery: baseApi,
  tagTypes: ["Usage"],
  endpoints: (builder) => ({
    getUsageSummary: builder.query<UsageRecord, string>({
      query: (workspaceId) => `/usage/${workspaceId}/`,
      providesTags: (r, e, id) => [{ type: "Usage", id }],
    }),
  }),
});

export const { useGetUsageSummaryQuery } = usageApi;
