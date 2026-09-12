import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { DashboardStats, ChartData } from "@/types/api";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseApi,
  tagTypes: ["Dashboard", "Charts"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardStats, { workspaceId: string; days?: number }>({
      query: ({ workspaceId, days }) => ({
        url: "/analytics/dashboard/",
        method: "GET",
        params: { workspace_id: workspaceId, days },
      }),
      providesTags: (r, e, arg) => [{ type: "Dashboard", id: `${arg.workspaceId}-${arg.days}` }],
    }),
    getCharts: builder.query<ChartData, { workspaceId: string; days?: number }>({
      query: ({ workspaceId, days }) => ({
        url: "/analytics/charts/",
        method: "GET",
        params: { workspace_id: workspaceId, days },
      }),
      providesTags: (r, e, arg) => [{ type: "Charts", id: `${arg.workspaceId}-${arg.days}` }],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetChartsQuery,
} = analyticsApi;
