import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Customer, CustomerTimelineEvent } from "@/types/api";

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseApi,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<{ results: Customer[]; count: number; next: string | null; previous: string | null } | Customer[], Record<string, unknown>>({
      query: (params) => ({ url: "/customers/", method: "GET", params }),
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}/`,
      providesTags: (r, e, id) => [{ type: "Customer", id }],
    }),
    createCustomer: builder.mutation<Customer, Record<string, unknown>>({
      query: (body) => ({ url: "/customers/", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/customers/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Customer", id }],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({ url: `/customers/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Customer"],
    }),
    getCustomerTimeline: builder.query<CustomerTimelineEvent[], string>({
      query: (id) => `/customers/${id}/timeline/`,
      providesTags: (r, e, id) => [{ type: "Customer", id: `TIMELINE-${id}` }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerTimelineQuery,
} = customerApi;
