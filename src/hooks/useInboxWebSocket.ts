"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux";
import { conversationApi } from "@/redux/api/conversationApi";

/**
 * WebSocket hook for inbox live sync.
 * Connects to Django Channels WorkspaceConsumer at /ws/workspaces/<id>/
 * and invalidates RTK Query cache tags so conversations/messages refetch.
 *
 * Auth: the browser exchanges its HttpOnly-cookie session for a short-lived
 * single-use ticket (POST /api/auth/ws-ticket/) instead of putting the
 * long-lived JWT in the WS URL.
 */
export function useInboxWebSocket(activeConversationId?: string) {
  const dispatch = useDispatch<AppDispatch>();
  const wsRef = useRef<WebSocket | null>(null);
  const activeIdRef = useRef<string | undefined>(activeConversationId);

  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const workspaceId =
      typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null;
    if (!workspaceId) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    const fetchTicket = async (): Promise<string | null> => {
      try {
        const res = await fetch("/api/auth/ws-ticket/", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: "{}",
        });
        if (!res.ok) return null;
        const body = await res.json();
        return body?.data?.ticket ?? null;
      } catch {
        return null;
      }
    };

    const connect = async () => {
      const ticket = await fetchTicket();
      if (closed || !ticket) {
        // No session (or backend down) — retry on a slower cadence.
        if (!closed) reconnectTimer = setTimeout(connect, 5000);
        return;
      }

      const url = `${wsBaseUrl}/ws/workspaces/${workspaceId}/?ticket=${encodeURIComponent(ticket)}`;
      ws = new WebSocket(url);

      ws.onopen = () => {
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
        console.error("[InboxWS] error");
      };

      ws.onclose = () => {
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
