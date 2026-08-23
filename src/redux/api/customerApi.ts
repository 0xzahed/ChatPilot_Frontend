import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  channel?: string;
  avatar?: string | null;
  language?: string;
  notes?: string;
  total_orders?: number;
  total_spent?: number;
  created_at?: string;
  [key: string]: any;
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseApi,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomers: builder.query<{ results: Customer[]; count: number; next: string | null; previous: string | null } | Customer[], any>({
      query: (params) => ({ url: "/customers/", method: "GET", params }),
      providesTags: ["Customer"],
    }),
    getCustomer: builder.query<Customer, string>({
      query: (id) => `/customers/${id}/`,
      providesTags: (r, e, id) => [{ type: "Customer", id }],
    }),
    createCustomer: builder.mutation<Customer, any>({
      query: (body) => ({ url: "/customers/", method: "POST", body }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/customers/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Customer", id }],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({ url: `/customers/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Customer"],
    }),
    getCustomerTimeline: builder.query<any[], string>({
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
