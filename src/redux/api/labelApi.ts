import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Label } from "@/types/api";

export const labelApi = createApi({
  reducerPath: "labelApi",
  baseQuery: baseApi,
  tagTypes: ["Label"],
  endpoints: (builder) => ({
    getLabels: builder.query<Label[] | { results: Label[] }, void>({
      query: () => ({ url: "/conversations/labels/", method: "GET" }),
      providesTags: ["Label"],
    }),
    createLabel: builder.mutation<Label, Record<string, unknown>>({
      query: (body) => ({ url: "/conversations/labels/", method: "POST", body }),
      invalidatesTags: ["Label"],
    }),
    updateLabel: builder.mutation<Label, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/conversations/labels/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Label", id }],
    }),
    deleteLabel: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/labels/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Label"],
    }),
  }),
});

export const {
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} = labelApi;
