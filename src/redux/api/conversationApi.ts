import { createApi } from "@reduxjs/toolkit/query/react";
import baseApi from "./baseApi";

export interface Conversation {
  id: string;
  customer?: any;
  customer_name?: string;
  customer_avatar?: string;
  customer_phone?: string;
  channel?: string;
  status?: string;
  subject?: string;
  last_message?: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_count?: number;
  assigned_to?: string | null;
  assigned_to_name?: string;
  is_complaint?: boolean;
  has_order?: boolean;
  handled_by?: string;
  language?: string;
  labels?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender_type: string;
  sender_name?: string;
  content: string;
  message_type?: string;
  reply_to?: string | null;
  is_note?: boolean;
  created_at: string;
  ai_metadata?: any;
}

export interface SendMessageRequest {
  content: string;
  message_type?: string;
  reply_to?: string;
  is_note?: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspace_id?: string;
}

export const conversationApi = createApi({
  reducerPath: "conversationApi",
  baseQuery: baseApi,
  tagTypes: ["Conversation", "Message", "Label"],
  endpoints: (builder) => ({
    getConversations: builder.query<{ results: Conversation[]; count?: number; next?: string | null; previous?: string | null } | Conversation[], any>({
      query: (params) => ({ url: "/conversations/", method: "GET", params }),
      providesTags: ["Conversation"],
    }),
    getConversation: builder.query<Conversation, string>({
      query: (id) => `/conversations/${id}/`,
      providesTags: (r, e, id) => [{ type: "Conversation", id }],
    }),
    getMessages: builder.query<Message[] | { results: Message[] }, string>({
      query: (id) => `/conversations/${id}/messages/`,
      providesTags: (r, e, id) => [{ type: "Message", id: `CONV-${id}` }],
    }),
    sendMessage: builder.mutation<Message, { id: string; body: SendMessageRequest }>({
      query: ({ id, body }) => ({ url: `/conversations/${id}/messages/send/`, method: "POST", body }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Message", id: `CONV-${id}` },
        "Conversation",
      ],
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
    aiSuggest: builder.mutation<any, string>({
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
    // ─── Labels (global) ────────────────────────────────────
    getLabels: builder.query<Label[] | { results: Label[] }, void>({
      query: () => "/conversations/labels/",
      providesTags: ["Label"],
    }),
    createLabel: builder.mutation<Label, { name: string; color: string; workspace_id: string }>({
      query: (body) => ({ url: "/conversations/labels/", method: "POST", body }),
      invalidatesTags: ["Label"],
    }),
    updateLabel: builder.mutation<Label, { id: string; data: any }>({
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
} = conversationApi;
