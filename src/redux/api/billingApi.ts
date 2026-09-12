import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Plan, Subscription, Invoice, UsageRecord } from "@/types/api";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseApi,
  tagTypes: ["Plan", "Subscription", "Invoice", "Usage"],
  endpoints: (builder) => ({
    getPlans: builder.query<Plan[], void>({
      query: () => "/billing/plans/",
      providesTags: ["Plan"],
    }),
    getSubscription: builder.query<Subscription, string>({
      query: (workspaceId) => `/billing/subscription/${workspaceId}/`,
      providesTags: (r, e, id) => [{ type: "Subscription", id }],
    }),
    subscribe: builder.mutation<Subscription, { workspaceId: string; planId: string }>({
      query: ({ workspaceId, planId }) => ({
        url: "/billing/subscribe/",
        method: "POST",
        body: { workspace_id: workspaceId, plan_id: planId },
      }),
      invalidatesTags: ["Subscription"],
    }),
    getInvoices: builder.query<Invoice[], string>({
      query: (workspaceId) => `/billing/invoices/${workspaceId}/`,
      providesTags: ["Invoice"],
    }),
    getUsage: builder.query<UsageRecord, string>({
      query: (workspaceId) => `/usage/${workspaceId}/`,
      providesTags: (r, e, id) => [{ type: "Usage", id }],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetSubscriptionQuery,
  useSubscribeMutation,
  useGetInvoicesQuery,
  useGetUsageQuery,
} = billingApi;
