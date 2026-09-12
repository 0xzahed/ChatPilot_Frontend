import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Workspace, WorkspaceMember, WorkspaceSettings } from "@/types/api";

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
    createWorkspace: builder.mutation<{ workspace: Workspace; membership: unknown } | Workspace, { name: string; slug: string }>({
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
    updateWorkspaceSettings: builder.mutation<WorkspaceSettings, { id: string; data: Record<string, unknown> }>({
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
