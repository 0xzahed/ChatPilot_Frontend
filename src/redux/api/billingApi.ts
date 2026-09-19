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
      query: (workspaceId) => `/billing/${workspaceId}/subscription/`,
      providesTags: (r, e, id) => [{ type: "Subscription", id }],
    }),
    subscribe: builder.mutation<Subscription, { workspaceId: string; planId: string; billingCycle?: string }>({
      query: ({ workspaceId, planId, billingCycle }) => ({
        url: `/billing/${workspaceId}/subscription/`,
        method: "POST",
        body: { plan_id: planId, billing_cycle: billingCycle ?? "monthly" },
      }),
      invalidatesTags: ["Subscription"],
    }),
    getInvoices: builder.query<Invoice[], void>({
      query: () => "/billing/invoices/",
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
