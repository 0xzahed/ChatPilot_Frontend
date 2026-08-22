"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { conversationApi } from "@/lib/api";
import { cn, timeAgo, getInitials } from "@/lib/utils";
import { ChannelIcon } from "./channel-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Bot, AlertTriangle, ShoppingCart } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
  { id: "assigned", label: "Assigned to me" },
  { id: "is_complaint", label: "Complaints" },
  { id: "has_order", label: "Orders" },
];

const CHANNELS = ["all", "facebook", "instagram", "whatsapp", "website"];

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const queryClient = useQueryClient();

  const params: any = {};
  if (search) params.search = search;
  if (filter === "unread") params.unread = "true";
  if (filter === "open") params.status = "open";
  if (filter === "closed") params.status = "closed";
  if (filter === "assigned") params.assigned = "me";
  if (filter === "is_complaint") params.is_complaint = "true";
  if (filter === "has_order") params.has_order = "true";
  if (channel !== "all") params.channel = channel;

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", params],
    queryFn: () => conversationApi.list(params).then((r) => r.data),
    refetchInterval: 10000,
  });

  const conversations = data?.results || data || [];

  // WebSocket for realtime updates
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socket: Socket = io(`${wsUrl}/ws/workspaces`, {
      query: { token },
      transports: ["websocket"],
    });

    socket.on("new_message", (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (data.conversation_id) {
        queryClient.invalidateQueries({ queryKey: ["messages", data.conversation_id] });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
        {/* Channel filter */}
        <div className="flex gap-1 overflow-x-auto">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize",
                channel === ch
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {ch}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                filter === f.id
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">No conversations found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          conversations.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "flex w-full gap-3 border-b border-border p-3 text-left transition-colors hover:bg-accent/50",
                selectedId === conv.id && "bg-primary/5 border-l-2 border-l-primary"
              )}
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  {conv.customer_avatar && <AvatarImage src={conv.customer_avatar} />}
                  <AvatarFallback>{getInitials(conv.customer_name || "U")}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <ChannelIcon channel={conv.channel} className="h-5 w-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-sm font-medium truncate", conv.unread_count > 0 && "font-bold")}>
                    {conv.customer_name}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {conv.last_message_at ? timeAgo(conv.last_message_at) : ""}
                  </span>
                </div>
                <p className={cn("text-xs text-muted-foreground truncate", conv.unread_count > 0 && "text-foreground font-medium")}>
                  {conv.last_message_preview || "No messages yet"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {conv.handled_by === "ai" && (
                    <Badge variant="secondary" className="text-[10px] py-0">
                      <Bot className="h-2.5 w-2.5 mr-0.5" /> AI
                    </Badge>
                  )}
                  {conv.is_complaint && (
                    <Badge variant="destructive" className="text-[10px] py-0">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Complaint
                    </Badge>
                  )}
                  {conv.has_order && (
                    <Badge variant="success" className="text-[10px] py-0">
                      <ShoppingCart className="h-2.5 w-2.5 mr-0.5" /> Order
                    </Badge>
                  )}
                  {conv.assigned_to_name && (
                    <span className="text-[10px] text-muted-foreground">@{conv.assigned_to_name.split(" ")[0]}</span>
                  )}
                  {conv.unread_count > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
