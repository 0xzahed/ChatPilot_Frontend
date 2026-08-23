import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface DashboardStats {
  total_conversations?: number;
  open_conversations?: number;
  unread_messages?: number;
  total_customers?: number;
  total_orders?: number;
  revenue?: number;
  ai_handled?: number;
  human_handled?: number;
  ai_automation_rate?: number;
  conversion_rate?: number;
  avg_response_time_seconds?: number;
  total_complaints?: number;
  open_complaints?: number;
  messages_used?: number;
  message_limit?: number;
  messages_remaining?: number;
  [key: string]: any;
}

export interface ChartData {
  conversations_over_time?: any[];
  orders_over_time?: any[];
  channel_performance?: any[];
  conversion_funnel?: any[];
  revenue_over_time?: any[];
  [key: string]: any;
}

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
