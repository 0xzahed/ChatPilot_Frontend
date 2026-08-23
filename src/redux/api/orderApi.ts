import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Order {
  id: string;
  order_number?: string;
  customer?: string;
  customer_name?: string;
  items?: any[];
  total?: number;
  status?: string;
  payment_status?: string;
  created_at?: string;
  [key: string]: any;
}

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseApi,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<{ results: Order[]; count: number; next: string | null; previous: string | null } | Order[], any>({
      query: (params) => ({ url: "/orders/", method: "GET", params }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}/`,
      providesTags: (r, e, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<Order, any>({
      query: (body) => ({ url: "/orders/", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: builder.mutation<Order, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/orders/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Order", id }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
} = orderApi;
