import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface AuditLog {
  id: string;
  workspace?: string;
  workspace_name?: string;
  user?: string;
  user_email?: string;
  action?: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  ip_address?: string;
  metadata?: any;
  created_at?: string;
  [key: string]: any;
}

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseApi,
  tagTypes: ["AuditLog"],
  endpoints: (builder) => ({
    getAuditLogs: builder.query<{ results: AuditLog[]; count: number; next: string | null; previous: string | null } | AuditLog[], any>({
      query: (params) => ({ url: "/audit/", method: "GET", params }),
      providesTags: ["AuditLog"],
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;
