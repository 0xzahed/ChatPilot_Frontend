"use client";

import { useEffect, useState } from "react";
import {
  useGetConversationsQuery,
  useGetFacebookPagesQuery,
} from "@/redux/api/conversationApi";
import { useInboxWebSocket } from "@/hooks/useInboxWebSocket";
import { cn, timeAgo, getInitials } from "@/lib/utils";
import { ChannelIcon } from "./channel-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Bot, AlertTriangle, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

// Facebook icon (not available in this lucide version)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}

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

const PAGE_SIZE = 30;

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const [selectedPageId, setSelectedPageId] = useState<string>("all");

  // Page resets to 1 whenever the filter/search selection changes —
  // implemented as render-time derived state (no setState-in-effect).
  const filterKey = [search, filter, channel, selectedPageId].join("|");
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (p: number | ((prev: number) => number)) =>
    setPageState((s) => ({
      key: filterKey,
      page: typeof p === "function" ? p(s.key === filterKey ? s.page : 1) : p,
    }));

  // Fetch connected Facebook pages for the page filter dropdown
  const { data: fbPagesData } = useGetFacebookPagesQuery();
  const fbPages: { page_id: string; page_name: string }[] = (fbPagesData as any) || [];

  // Live sync via WebSocket — invalidates Conversation tags on new_message
  useInboxWebSocket(selectedId || undefined);

  const params: any = { page, limit: PAGE_SIZE };
  if (search) params.search = search;
  if (filter === "unread") params.unread = "true";
  if (filter === "open") params.status = "open";
  if (filter === "closed") params.status = "closed";
  if (filter === "assigned") params.assigned = "me";
  if (filter === "is_complaint") params.is_complaint = "true";
  if (filter === "has_order") params.has_order = "true";
  if (channel !== "all") params.channel = channel;
  if (selectedPageId !== "all") params.page_id = selectedPageId;

  const { data: rawData, isLoading, refetch } = useGetConversationsQuery(params, {
    // Poll every 15s as a backup to WebSocket
    pollingInterval: 15000,
  });
  const data = rawData as any;

  const conversations: any[] = data?.results || data?.data || (Array.isArray(data) ? data : []);
  // baseApi's unwrapResponse flattens backend pagination into
  // {results, count, page, total_pages} — read those fields directly.
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.count ?? conversations.length;

  // Refetch on window focus for freshest data
  useEffect(() => {
    const onFocus = () => refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="border-b border-border p-3 space-y-3">
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
        <div className="flex gap-1.5 overflow-x-auto pb-1">
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
        {/* Facebook Page filter — only show when there are connected pages */}
        {fbPages.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedPageId("all")}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                selectedPageId === "all"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              All Pages
            </button>
            {fbPages.map((page) => (
              <button
                key={page.page_id}
                onClick={() => setSelectedPageId(page.page_id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1",
                  selectedPageId === page.page_id
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <FacebookIcon className="h-3 w-3" />
                {page.page_name}
              </button>
            ))}
          </div>
        )}
        {/* Status filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
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
                  {conv.last_message_preview || conv.last_message || "No messages yet"}
                </p>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {conv.page_name && (
                    <Badge variant="secondary" className="text-[10px] py-0">
                      <FacebookIcon className="h-2.5 w-2.5 mr-0.5" /> {conv.page_name}
                    </Badge>
                  )}
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

      {/* Pagination */}
      {!isLoading && conversations.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {totalCount.toLocaleString()} conversations
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-16 text-center text-xs text-muted-foreground">
              {page} / {totalPages.toLocaleString()}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
