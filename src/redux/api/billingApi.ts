import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Plan {
  id: string;
  name: string;
  price_monthly?: number;
  price_yearly?: number;
  message_limit?: number;
  team_member_limit?: number;
  is_trial?: boolean;
  [key: string]: any;
}

export interface Subscription {
  id: string;
  plan?: Plan;
  status?: string;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  [key: string]: any;
}

export interface Usage {
  [key: string]: any;
}

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
        body: { plan_id: planId, billing_cycle: billingCycle },
      }),
      invalidatesTags: (r, e, { workspaceId }) => [{ type: "Subscription", id: workspaceId }],
    }),
    getInvoices: builder.query<Invoice[], void>({
      query: () => "/billing/invoices/",
      providesTags: ["Invoice"],
    }),
    getUsage: builder.query<Usage, string>({
      query: (workspaceId) => `/billing/${workspaceId}/usage/`,
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
