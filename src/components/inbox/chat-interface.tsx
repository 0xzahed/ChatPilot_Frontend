"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api";
import { cn, formatTime, timeAgo, getInitials } from "@/lib/utils";
import { ChannelBadge } from "./channel-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import {
  Send, Bot, User, AlertTriangle, ShoppingCart, Sparkles,
  MoreVertical, Check, X, Zap, Clock, Paperclip, Smile,
} from "lucide-react";
import { io, Socket } from "socket.io-client";

interface ChatInterfaceProps {
  conversationId: string;
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: conversation, isLoading: convLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => conversationApi.get(conversationId).then((r) => r.data),
  });

  const { data: messagesData, isLoading: msgLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationApi.messages(conversationId).then((r) => r.data),
  });

  const messages = messagesData?.results || messagesData || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socket: Socket = io(`${wsUrl}/ws/workspaces`, {
      query: { token },
      transports: ["websocket"],
    });

    socket.on("new_message", (data) => {
      if (data.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      }
    });

    socket.on("typing", (data) => {
      if (data.conversation_id === conversationId) {
        setIsTyping(data.is_typing);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      conversationApi.sendMessage(conversationId, data),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err: any) => {
      toast({ type: "error", title: err.response?.data?.error?.message || "Failed to send message" });
    },
  });

  const aiSuggestMutation = useMutation({
    mutationFn: () => conversationApi.aiSuggest(conversationId),
    onSuccess: (res) => {
      setMessage(res.data.suggestion || res.data.message || "");
    },
    onError: (err: any) => {
      toast({ type: "error", title: "AI suggestion failed" });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (agentId: string) => conversationApi.assign(conversationId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      toast({ type: "success", title: "Conversation assigned" });
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => conversationApi.close(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({ type: "success", title: "Conversation closed" });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate({ content: message });
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    // Could emit typing event here
  };

  if (convLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {conversation?.customer_avatar && <AvatarImage src={conversation.customer_avatar} />}
            <AvatarFallback>{getInitials(conversation?.customer_name || "U")}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{conversation?.customer_name}</p>
              <ChannelBadge channel={conversation?.channel} />
            </div>
            <p className="text-xs text-muted-foreground">
              {conversation?.customer_phone || "No phone"}
              {conversation?.language && ` • ${conversation.language}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation?.handled_by === "ai" && (
            <Badge variant="secondary">
              <Bot className="h-3 w-3 mr-1" /> AI Handled
            </Badge>
          )}
          {conversation?.is_complaint && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" /> Complaint
            </Badge>
          )}
          {conversation?.status === "open" ? (
            <Badge variant="success">Open</Badge>
          ) : (
            <Badge variant="secondary">Closed</Badge>
          )}

          <Dropdown
            trigger={
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              { label: "Close conversation", icon: X, onClick: () => closeMutation.mutate() },
              { label: "Reopen", icon: Check, onClick: () => conversationApi.reopen(conversationId) },
            ]}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.sender_type === "customer" ? "justify-start" : "justify-end"
              )}
            >
              {msg.sender_type === "customer" && (
                <Avatar className="h-7 w-7 mt-1">
                  <AvatarFallback className="text-xs">{getInitials(conversation?.customer_name || "C")}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-3 py-2",
                  msg.sender_type === "customer"
                    ? "bg-muted text-foreground"
                    : msg.sender_type === "ai"
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {msg.sender_type === "ai" && (
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium text-indigo-500">
                    <Bot className="h-3 w-3" /> AI
                  </div>
                )}
                {msg.sender_type === "agent" && (
                  <div className="mb-1 flex items-center gap-1 text-xs font-medium opacity-70">
                    <User className="h-3 w-3" /> Agent
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={cn("mt-1 text-[10px]", msg.sender_type === "customer" ? "text-muted-foreground" : "opacity-60")}>
                  {formatTime(msg.created_at)}
                  {msg.sender_type !== "customer" && msg.status === "read" && " • Read"}
                </p>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{getInitials(conversation?.customer_name || "C")}</AvatarFallback>
            </Avatar>
            <div className="flex gap-1 rounded-lg bg-muted px-3 py-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestion banner */}
      {aiSuggestMutation.data && (
        <div className="border-t border-border bg-indigo-500/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-indigo-500">AI Suggestion</span>
              <span className="text-muted-foreground">— click to use</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessage(aiSuggestMutation.data.data?.suggestion || aiSuggestMutation.data.data?.message || "")}
            >
              Use
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => aiSuggestMutation.mutate()}
            disabled={aiSuggestMutation.isPending}
            title="Get AI suggestion"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </Button>
          <Button type="submit" size="icon" disabled={!message.trim() || sendMessageMutation.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
