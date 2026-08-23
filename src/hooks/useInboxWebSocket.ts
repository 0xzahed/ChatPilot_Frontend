"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { conversationApi } from "@/redux/api/conversationApi";

/**
 * WebSocket hook for inbox live sync.
 * Connects to Django Channels WorkspaceConsumer at /ws/workspaces/<id>/
 * and invalidates RTK Query cache tags so conversations/messages refetch.
 */
export function useInboxWebSocket(activeConversationId?: string) {
  const dispatch = useDispatch<any>();
  const wsRef = useRef<WebSocket | null>(null);
  const activeIdRef = useRef<string | undefined>(activeConversationId);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const workspaceId = typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null;
    if (!token || !workspaceId) return;

    const url = `${wsBaseUrl}/ws/workspaces/${workspaceId}/?token=${encodeURIComponent(token)}`;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(url);

      ws.onopen = () => {
        // eslint-disable-next-line no-console
        console.log("[InboxWS] connected");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const evt = payload.event;
          const data = payload.data;

          if (evt === "new_message") {
            // Invalidate conversation list
            dispatch(conversationApi.util.invalidateTags(["Conversation"]));
            if (data?.conversation_id) {
              dispatch(
                conversationApi.util.invalidateTags([
                  { type: "Message", id: `CONV-${data.conversation_id}` },
                  { type: "Conversation", id: data.conversation_id },
                ])
              );
            }
          } else if (evt === "conversation_updated") {
            dispatch(conversationApi.util.invalidateTags(["Conversation"]));
            if (data?.conversation_id) {
              dispatch(
                conversationApi.util.invalidateTags([
                  { type: "Conversation", id: data.conversation_id },
                ])
              );
            }
          } else if (evt === "typing") {
            if (data?.conversation_id && data.conversation_id === activeIdRef.current) {
              window.dispatchEvent(new CustomEvent("inbox:typing", { detail: data }));
            }
          }
        } catch {
          // ignore non-JSON
        }
      };

      ws.onerror = () => {
        // eslint-disable-next-line no-console
        console.error("[InboxWS] error");
      };

      ws.onclose = () => {
        // eslint-disable-next-line no-console
        console.log("[InboxWS] disconnected");
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    };

    connect();
    wsRef.current = ws;

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      wsRef.current = null;
    };
  }, [dispatch]);

  return wsRef;
}
