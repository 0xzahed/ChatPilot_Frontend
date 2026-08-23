import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface UsageSummary {
  [key: string]: any;
}

export const usageApi = createApi({
  reducerPath: "usageApi",
  baseQuery: baseApi,
  tagTypes: ["Usage"],
  endpoints: (builder) => ({
    getUsageSummary: builder.query<UsageSummary, string>({
      query: (workspaceId) => `/usage/${workspaceId}/`,
      providesTags: (r, e, id) => [{ type: "Usage", id }],
    }),
  }),
});

export const { useGetUsageSummaryQuery } = usageApi;
