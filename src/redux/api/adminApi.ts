import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface AdminStats {
  users?: { total?: number; active?: number; inactive?: number; platform_admins?: number; new_7d?: number };
  workspaces?: { total?: number; active?: number; suspended?: number; new_7d?: number };
  conversations?: { total?: number; open?: number; new_7d?: number };
  customers?: { total?: number };
  orders?: { total?: number };
  plan_distribution?: { plan: string; workspace_id: string; status: string }[];
  [key: string]: any;
}

export interface AdminUser {
  id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  is_platform_admin?: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  email_verified_at?: string | null;
  last_active_at?: string | null;
  date_joined?: string;
  workspace_count?: number;
  workspace_name?: string | null;
  [key: string]: any;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  owner?: string;
  owner_email?: string;
  owner_name?: string;
  is_active?: boolean;
  is_suspended?: boolean;
  member_count?: number;
  conversation_count?: number;
  customer_count?: number;
  plan_name?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface AdminAuditLog {
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
    getAdminUsers: builder.query<{ results: AdminUser[]; count: number; total_pages: number; next: string | null; previous: string | null } | AdminUser[], any>({
      query: (params) => ({ url: "/admin/users/", method: "GET", params }),
      providesTags: ["AdminUser"],
    }),
    getAdminUser: builder.query<AdminUser, string>({
      query: (id) => `/admin/users/${id}/`,
      providesTags: (r, e, id) => [{ type: "AdminUser", id }],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/admin/users/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "AdminUser", id }, "AdminUser", "AdminStats"],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/users/${id}/`, method: "DELETE" }),
      invalidatesTags: ["AdminUser", "AdminStats"],
    }),

    // ─── Workspaces ─────────────────────────────────────────
    getAdminWorkspaces: builder.query<{ results: AdminWorkspace[]; count: number; total_pages: number; next: string | null; previous: string | null } | AdminWorkspace[], any>({
      query: (params) => ({ url: "/admin/workspaces/", method: "GET", params }),
      providesTags: ["AdminWorkspace"],
    }),
    getAdminWorkspace: builder.query<AdminWorkspace, string>({
      query: (id) => `/admin/workspaces/${id}/`,
      providesTags: (r, e, id) => [{ type: "AdminWorkspace", id }],
    }),
    updateAdminWorkspace: builder.mutation<AdminWorkspace, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/admin/workspaces/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "AdminWorkspace", id }, "AdminWorkspace", "AdminStats"],
    }),
    deleteAdminWorkspace: builder.mutation<void, string>({
      query: (id) => ({ url: `/admin/workspaces/${id}/`, method: "DELETE" }),
      invalidatesTags: ["AdminWorkspace", "AdminStats"],
    }),

    // ─── Audit Logs ─────────────────────────────────────────
    getAdminAuditLogs: builder.query<{ results: AdminAuditLog[]; count: number; total_pages: number; next: string | null; previous: string | null } | AdminAuditLog[], any>({
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
