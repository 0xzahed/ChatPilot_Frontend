import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { TeamMember } from "@/types/api";

export const teamApi = createApi({
  reducerPath: "teamApi",
  baseQuery: baseApi,
  tagTypes: ["Team"],
  endpoints: (builder) => ({
    getTeam: builder.query<TeamMember[] | { results: TeamMember[] }, void>({
      query: () => "/team/",
      providesTags: ["Team"],
    }),
    inviteMember: builder.mutation<Record<string, unknown>, { email: string; role: string; workspaceId: string }>({
      query: ({ email, role, workspaceId }) => ({
        url: "/team/invite/",
        method: "POST",
        body: { email, role, workspace_id: workspaceId },
      }),
      invalidatesTags: ["Team"],
    }),
    updateMember: builder.mutation<Record<string, unknown>, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/team/${id}/`, method: "PATCH", body: { role } }),
      invalidatesTags: ["Team"],
    }),
  }),
});

export const {
  useGetTeamQuery,
  useInviteMemberMutation,
  useUpdateMemberMutation,
} = teamApi;
