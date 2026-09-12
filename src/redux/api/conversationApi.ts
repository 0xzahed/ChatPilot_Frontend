import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";
import type { Conversation, Message, SendMessageRequest, Label, FacebookPage } from "@/types/api";

export const conversationApi = createApi({
  reducerPath: "conversationApi",
  baseQuery: baseApi,
  tagTypes: ["Conversation", "Message", "Label"],
  endpoints: (builder) => ({
    getConversations: builder.query<{ results: Conversation[]; count?: number; next?: string | null; previous?: string | null } | Conversation[], Record<string, unknown>>({
      query: (params) => ({ url: "/conversations/", method: "GET", params }),
      providesTags: ["Conversation"],
    }),
    getConversation: builder.query<Conversation, string>({
      query: (id) => `/conversations/${id}/`,
      providesTags: (r, e, id) => [{ type: "Conversation", id }],
    }),
    getMessages: builder.query<Message[], string>({
      query: (id) => `/conversations/${id}/messages/`,
      providesTags: (r, e, id) => [{ type: "Message", id: `CONV-${id}` }],
    }),
    sendMessage: builder.mutation<Message, { id: string } & SendMessageRequest>({
      query: ({ id, ...body }) => ({ url: `/conversations/${id}/messages/send/`, method: "POST", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "Message", id: `CONV-${id}` }, { type: "Conversation", id }],
    }),
    assignConversation: builder.mutation<void, { id: string; agentId: string }>({
      query: ({ id, agentId }) => ({ url: `/conversations/${id}/assign/`, method: "POST", body: { assigned_to: agentId } }),
      invalidatesTags: (r, e, { id }) => [{ type: "Conversation", id }],
    }),
    closeConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/close/`, method: "POST" }),
      invalidatesTags: (r, e, id) => [{ type: "Conversation", id }],
    }),
    reopenConversation: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/reopen/`, method: "POST" }),
      invalidatesTags: (r, e, id) => [{ type: "Conversation", id }],
    }),
    markUnread: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/${id}/mark-unread/`, method: "POST" }),
      invalidatesTags: (r, e, id) => [{ type: "Conversation", id }],
    }),
    aiSuggest: builder.mutation<Record<string, unknown>, string>({
      query: (id) => ({ url: `/conversations/${id}/ai-suggest/`, method: "POST" }),
    }),
    getConversationLabels: builder.query<Label[], string>({
      query: (id) => `/conversations/${id}/labels/`,
      providesTags: (r, e, id) => [{ type: "Label", id: `CONV-${id}` }],
    }),
    addLabel: builder.mutation<void, { id: string; labelId: string }>({
      query: ({ id, labelId }) => ({ url: `/conversations/${id}/labels/`, method: "POST", body: { label_id: labelId } }),
      invalidatesTags: (r, e, { id }) => [{ type: "Label", id: `CONV-${id}` }],
    }),
    removeLabel: builder.mutation<void, { id: string; labelId: string }>({
      query: ({ id, labelId }) => ({ url: `/conversations/${id}/labels/`, method: "DELETE", body: { label_id: labelId } }),
      invalidatesTags: (r, e, { id }) => [{ type: "Label", id: `CONV-${id}` }],
    }),
    sendTyping: builder.mutation<void, { id: string; isTyping: boolean }>({
      query: ({ id, isTyping }) => ({ url: `/conversations/${id}/typing/`, method: "POST", body: { is_typing: isTyping } }),
    }),
    // ─── Facebook Pages (for inbox filter) ───────────────────
    getFacebookPages: builder.query<FacebookPage[], void>({
      query: () => "/conversations/facebook-pages/",
      providesTags: ["Conversation"],
    }),
    // ─── Labels (global) ────────────────────────────────────
    getLabels: builder.query<Label[] | { results: Label[] }, void>({
      query: () => "/conversations/labels/",
      providesTags: ["Label"],
    }),
    createLabel: builder.mutation<Label, { name: string; color: string; workspace_id: string }>({
      query: (body) => ({ url: "/conversations/labels/", method: "POST", body }),
      invalidatesTags: ["Label"],
    }),
    updateLabel: builder.mutation<Label, { id: string; data: Record<string, unknown> }>({
      query: ({ id, data }) => ({ url: `/conversations/labels/${id}/`, method: "PATCH", body: data }),
      invalidatesTags: ["Label"],
    }),
    deleteLabel: builder.mutation<void, string>({
      query: (id) => ({ url: `/conversations/labels/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Label"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useAssignConversationMutation,
  useCloseConversationMutation,
  useReopenConversationMutation,
  useMarkUnreadMutation,
  useAiSuggestMutation,
  useGetConversationLabelsQuery,
  useAddLabelMutation,
  useRemoveLabelMutation,
  useSendTypingMutation,
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useGetFacebookPagesQuery,
} = conversationApi;
