import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Complaint } from "@/types/api";

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: baseApi,
  tagTypes: ["Complaint"],
  endpoints: (builder) => ({
    getComplaints: builder.query<{ results: Complaint[]; count: number; next: string | null; previous: string | null } | Complaint[], Record<string, unknown>>({
      query: (params) => ({ url: "/complaints/", method: "GET", params }),
      providesTags: ["Complaint"],
    }),
    getComplaint: builder.query<Complaint, string>({
      query: (id) => `/complaints/${id}/`,
      providesTags: (r, e, id) => [{ type: "Complaint", id }],
    }),
    updateComplaint: builder.mutation<Complaint, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/complaints/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "Complaint", id }],
    }),
  }),
});

export const {
  useGetComplaintsQuery,
  useGetComplaintQuery,
  useUpdateComplaintMutation,
} = complaintApi;
