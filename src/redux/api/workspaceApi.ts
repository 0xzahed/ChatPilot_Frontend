import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  owner?: string;
  is_active?: boolean;
  is_suspended?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMember {
  id: string;
  user: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface WorkspaceSettings {
  [key: string]: any;
}

export const workspaceApi = createApi({
  reducerPath: "workspaceApi",
  baseQuery: baseApi,
  tagTypes: ["Workspace", "WorkspaceMember", "WorkspaceSettings"],
  endpoints: (builder) => ({
    getWorkspaces: builder.query<Workspace[] | { results: Workspace[] }, void>({
      query: () => "/workspaces/",
      providesTags: ["Workspace"],
    }),
    getWorkspace: builder.query<Workspace, string>({
      query: (id) => `/workspaces/${id}/`,
      providesTags: (r, e, id) => [{ type: "Workspace", id }],
    }),
    createWorkspace: builder.mutation<{ workspace: Workspace; membership: any } | Workspace, { name: string; slug: string }>({
      query: (body) => ({ url: "/workspaces/", method: "POST", body }),
      invalidatesTags: ["Workspace"],
    }),
    getWorkspaceMembers: builder.query<WorkspaceMember[] | { results: WorkspaceMember[] }, string>({
      query: (id) => `/workspaces/${id}/members/`,
      providesTags: (r, e, id) => [{ type: "WorkspaceMember", id }],
    }),
    getWorkspaceSettings: builder.query<WorkspaceSettings, string>({
      query: (id) => `/workspaces/${id}/settings/`,
      providesTags: (r, e, id) => [{ type: "WorkspaceSettings", id }],
    }),
    updateWorkspaceSettings: builder.mutation<WorkspaceSettings, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/workspaces/${id}/settings/`, method: "PATCH", body: data }),
      invalidatesTags: (r, e, { id }) => [{ type: "WorkspaceSettings", id }],
    }),
  }),
});

export const {
  useGetWorkspacesQuery,
  useGetWorkspaceQuery,
  useCreateWorkspaceMutation,
  useGetWorkspaceMembersQuery,
  useGetWorkspaceSettingsQuery,
  useUpdateWorkspaceSettingsMutation,
} = workspaceApi;
