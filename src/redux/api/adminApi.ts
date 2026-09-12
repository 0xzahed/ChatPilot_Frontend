import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { AdminStats, AdminUser, AdminWorkspace, AuditLog } from "@/types/api";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseApi,
  tagTypes: ["AdminStats", "AdminUser", "AdminWorkspace", "AdminAuditLog"],
  endpoints: (builder) => ({
    // ─── Stats ──────────────────────────────────────────────
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/admin/stats/",
      providesTags: ["AdminStats"],
    }),

    // ─── Users ──────────────────────────────────────────────
    getAdminUsers: builder.query<{ results: AdminUser[]; count: number; total_pages: number; next: string | null; previous: string | null } | AdminUser[], Record<string, unknown>>({
      query: (params) => ({ url: "/admin/users/", method: "GET", params }),
      providesTags: ["AdminUser"],
    }),
    getAdminUser: builder.query<AdminUser, string>({
      query: (id) => `/admin/users/${id}/`,
      providesTags: (r, e, id) => [{ type: "AdminUser", id }],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/admin/users/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "AdminUser", id }, "AdminUser", "AdminStats"],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}/`, method: "DELETE" }),
      invalidatesTags: ["AdminUser", "AdminStats"],
    }),

    // ─── Workspaces ─────────────────────────────────────────
    getAdminWorkspaces: builder.query<{ results: AdminWorkspace[]; count: number; total_pages: number; next: string | null; previous: string | null } | AdminWorkspace[], Record<string, unknown>>({
      query: (params) => ({ url: "/admin/workspaces/", method: "GET", params }),
      providesTags: ["AdminWorkspace"],
    }),
    getAdminWorkspace: builder.query<AdminWorkspace, string>({
      query: (id) => `/admin/workspaces/${id}/`,
      providesTags: (r, e, id) => [{ type: "AdminWorkspace", id }],
    }),
    updateAdminWorkspace: builder.mutation<AdminWorkspace, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/admin/workspaces/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "AdminWorkspace", id }, "AdminWorkspace", "AdminStats"],
    }),
    deleteAdminWorkspace: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/workspaces/${id}/`, method: "DELETE" }),
      invalidatesTags: ["AdminWorkspace", "AdminStats"],
    }),

    // ─── Audit Logs ─────────────────────────────────────────
    getAdminAuditLogs: builder.query<{ results: AuditLog[]; count: number; total_pages: number; next: string | null; previous: string | null } | AuditLog[], Record<string, unknown>>({
      query: (params) => ({ url: "/admin/audit/", method: "GET", params }),
      providesTags: ["AdminAuditLog"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminWorkspacesQuery,
  useGetAdminWorkspaceQuery,
  useUpdateAdminWorkspaceMutation,
  useDeleteAdminWorkspaceMutation,
  useGetAdminAuditLogsQuery,
} = adminApi;
