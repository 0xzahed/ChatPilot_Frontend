import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Complaint {
  id: string;
  title?: string;
  description?: string;
  customer?: string;
  customer_name?: string;
  status?: string;
  priority?: string;
  assigned_to?: string | null;
  created_at?: string;
  [key: string]: any;
}

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: baseApi,
  tagTypes: ["Complaint"],
  endpoints: (builder) => ({
    getComplaints: builder.query<{ results: Complaint[]; count: number; next: string | null; previous: string | null } | Complaint[], any>({
      query: (params) => ({ url: "/complaints/", method: "GET", params }),
      providesTags: ["Complaint"],
    }),
    getComplaint: builder.query<Complaint, string>({
      query: (id) => `/complaints/${id}/`,
      providesTags: (r, e, id) => [{ type: "Complaint", id }],
    }),
    updateComplaint: builder.mutation<Complaint, { id: string; data: any }>({
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
