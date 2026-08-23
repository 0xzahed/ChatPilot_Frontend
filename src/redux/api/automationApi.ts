import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface AutomationRule {
  id: string;
  name?: string;
  trigger?: string;
  action?: string;
  is_active?: boolean;
  [key: string]: any;
}

export interface CommentAutomation {
  id: string;
  [key: string]: any;
}

export const automationApi = createApi({
  reducerPath: "automationApi",
  baseQuery: baseApi,
  tagTypes: ["AutomationRule", "CommentAutomation"],
  endpoints: (builder) => ({
    getRules: builder.query<AutomationRule[] | { results: AutomationRule[] }, void>({
      query: () => "/automation/rules/",
      providesTags: ["AutomationRule"],
    }),
    createRule: builder.mutation<AutomationRule, any>({
      query: (body) => ({ url: "/automation/rules/", method: "POST", body }),
      invalidatesTags: ["AutomationRule"],
    }),
    updateRule: builder.mutation<AutomationRule, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/automation/rules/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: ["AutomationRule"],
    }),
    deleteRule: builder.mutation<void, string>({
      query: (id) => ({ url: `/automation/rules/${id}/`, method: "DELETE" }),
      invalidatesTags: ["AutomationRule"],
    }),
    getComments: builder.query<CommentAutomation[], void>({
      query: () => "/automation/comments/",
      providesTags: ["CommentAutomation"],
    }),
  }),
});

export const {
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetCommentsQuery,
} = automationApi;
