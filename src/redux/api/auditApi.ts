import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { AuditLog } from "@/types/api";

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseApi,
  tagTypes: ["AuditLog"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<{ results: AuditLog[]; count: number; next: string | null; previous: string | null } | AuditLog[], Record<string, unknown>>({
      query: (params) => ({ url: "/audit/", method: "GET", params }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
