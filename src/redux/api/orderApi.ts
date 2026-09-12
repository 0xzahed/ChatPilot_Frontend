import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Order } from "@/types/api";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseApi,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<{ results: Order[]; count: number; next: string | null; previous: string | null } | Order[], Record<string, unknown>>({
      query: (params) => ({ url: "/orders/", method: "GET", params }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query<Order, string>({
      query: (id) => `/orders/${id}/`,
      providesTags: (r, e, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<Order, Record<string, unknown>>({
      query: (body) => ({ url: "/orders/", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: builder.mutation<Order, { id: string; data: Record<string, unknown> }>({
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
