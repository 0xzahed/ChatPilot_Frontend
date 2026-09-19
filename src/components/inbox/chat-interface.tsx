"use client";

import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  useGetConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useAiSuggestMutation,
  useCloseConversationMutation,
  useReopenConversationMutation,
  useUploadAttachmentMutation,
} from "@/redux/api/conversationApi";
import { useInboxWebSocket } from "@/hooks/useInboxWebSocket";
import { cn, formatTime, getInitials } from "@/lib/utils";
import { ChannelBadge } from "./channel-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dropdown } from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import {
  Send, Bot, User, AlertTriangle, Sparkles,
  MoreVertical, Check, X, Paperclip,
} from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string;
}

const HTML_RE = /<[a-z][^>]*>/i;

/** Renders message content — plain text stays text; HTML bodies (iedu
 * marketing/support templates) render sanitized so tags don't leak raw. */
function MessageContent({ content, className }: { content: string; className?: string }) {
  if (!HTML_RE.test(content || "")) {
    return <p className={cn("text-sm whitespace-pre-wrap", className)}>{content}</p>;
  }
  const clean = DOMPurify.sanitize(content, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target"],
  });
  return (
    <div
      className={cn("text-sm [&_a]:underline [&_a]:text-inherit [&_img]:max-w-full", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Live sync — WebSocket invalidates Message/Conversation tags
  useInboxWebSocket(conversationId);

  const { data: rawConversation, isLoading: convLoading } = useGetConversationQuery(conversationId);
  const { data: messagesData, isLoading: msgLoading } = useGetMessagesQuery(conversationId, {
    // Poll every 10s as a backup to WebSocket
    pollingInterval: 10000,
  });
  const conversation = rawConversation as any;

  const messages: any[] = (messagesData as any)?.results || (messagesData as any) || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for typing events dispatched by useInboxWebSocket
  useEffect(() => {
    const onTyping = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.conversation_id === conversationId) {
        setIsTyping(detail.is_typing);
      }
    };
    window.addEventListener("inbox:typing", onTyping);
    return () => window.removeEventListener("inbox:typing", onTyping);
  }, [conversationId]);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [aiSuggest, { isLoading: aiLoading }] = useAiSuggestMutation();
  const [closeConversation] = useCloseConversationMutation();
  const [reopenConversation] = useReopenConversationMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ type: "error", title: "File too large (max 10 MB)" });
      return;
    }
    uploadAttachment({ id: conversationId, file })
      .unwrap()
      .then(() => toast({ type: "success", title: "File sent" }))
      .catch((err: any) => {
        toast({ type: "error", title: err?.data?.error?.message || "Upload failed" });
      });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage({ id: conversationId, content: message })
      .unwrap()
      .then(() => setMessage(""))
      .catch((err: any) => {
        toast({ type: "error", title: err?.data?.error?.message || "Failed to send message" });
      });
  };

  const handleAiSuggest = () => {
    aiSuggest(conversationId)
      .unwrap()
      .then((res: any) => {
        const sug = res?.suggestion || res?.message || "";
        setAiSuggestion(sug);
        setMessage(sug);
      })
      .catch(() => {
        toast({ type: "error", title: "AI suggestion failed" });
      });
  };

  const handleClose = () => {
    closeConversation(conversationId)
      .unwrap()
      .then(() => toast({ type: "success", title: "Conversation closed" }))
      .catch(() => toast({ type: "error", title: "Failed to close" }));
  };

  const handleReopen = () => {
    reopenConversation(conversationId)
      .unwrap()
      .then(() => toast({ type: "success", title: "Conversation reopened" }))
      .catch(() => toast({ type: "error", title: "Failed to reopen" }));
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
              { label: "Close conversation", icon: X, onClick: handleClose },
              { label: "Reopen", icon: Check, onClick: handleReopen },
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
                {Array.isArray(msg.attachments) && msg.attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-1 block text-xs underline opacity-80 hover:opacity-100"
                  >
                    {att.file_type === "image" ? "🖼" : "📎"} {att.file_name || "Attachment"}
                  </a>
                ))}
                <MessageContent content={msg.content || ""} />
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
      {aiSuggestion && (
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
              onClick={() => setMessage(aiSuggestion)}
            >
              Use
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.mp3,.mp4,.zip"
            onChange={handleFileSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            title="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={handleAiSuggest}
            disabled={aiLoading}
            title="Get AI suggestion"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </Button>
          <Button type="submit" size="icon" disabled={!message.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
