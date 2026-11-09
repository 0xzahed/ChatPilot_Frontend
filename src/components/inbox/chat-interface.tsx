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
  useMarkUnreadMutation,
  conversationApi,
} from "@/redux/api/conversationApi";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux";
import { useInboxWebSocket } from "@/hooks/useInboxWebSocket";
import { useRole } from "@/hooks/useRole";
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
  MoreVertical, Check, X, Paperclip, ArrowLeft, Info, Mic, Square, MailOpen, FileText,
} from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string;
  onBack?: () => void;
  onShowDetails?: () => void;
}

const HTML_RE = /<[a-z][^>]*>/i;

/** Translate common Meta/Graph API rejection reasons into something an
 * agent can act on, instead of raw API error text. */
function friendlyChannelError(raw?: string): string {
  if (!raw) return "The channel rejected this message.";
  if (/outside the allowed window|\(#10\)/i.test(raw)) {
    return "Can't send — it's been over 24 hours since the customer's last message. Messenger only allows replies within that window; wait for them to message again.";
  }
  return raw;
}

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

/** Renders one message attachment: inline image / audio player / video player / file link. */
function MessageAttachmentView({ att }: { att: any }) {
  const url: string = att.file_url;
  const name: string = att.file_name || "Attachment";
  const type: string = att.file_type || "file";
  const mime: string = att.mime_type || "";

  if (type === "image" || mime.startsWith("image/")) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-1 block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          loading="lazy"
          className="max-h-64 max-w-full rounded-md object-contain"
        />
      </a>
    );
  }
  if (type === "audio" || mime.startsWith("audio/")) {
    return (
      <div className="mb-1">
        <audio controls preload="metadata" src={url} className="h-10 w-60 max-w-full" />
      </div>
    );
  }
  if (type === "video" || mime.startsWith("video/")) {
    return (
      <div className="mb-1">
        <video controls preload="metadata" src={url} className="max-h-72 max-w-full rounded-md bg-black" />
      </div>
    );
  }
  return (
    <a
      href={`${url}?download=1`}
      target="_blank"
      rel="noreferrer"
      className="mb-1 flex items-center gap-2 rounded-md bg-background/20 px-2 py-1.5 text-xs underline"
    >
      <FileText className="h-4 w-4 shrink-0" /> <span className="truncate">{name}</span>
    </a>
  );
}

export function ChatInterface({ conversationId, onBack, onShowDetails }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [markUnread] = useMarkUnreadMutation();

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelRecordRef = useRef(false);

  // Live sync — WebSocket invalidates Message/Conversation tags
  useInboxWebSocket(conversationId);

  const { data: rawConversation, isLoading: convLoading } = useGetConversationQuery(conversationId);
  const { data: messagesData, isLoading: msgLoading } = useGetMessagesQuery(conversationId, {
    // Poll every 10s as a backup to WebSocket
    pollingInterval: 10000,
  });
  const conversation = rawConversation as any;

  const messages: any[] = (messagesData as any)?.results || (messagesData as any) || [];

  // Opening a conversation marks it read on the server — refresh the list so the badge clears.
  useEffect(() => {
    if (!messagesData) return;
    const t = setTimeout(() => {
      dispatch(conversationApi.util.invalidateTags(["Conversation"]));
    }, 600);
    return () => clearTimeout(t);
  }, [conversationId, !!messagesData, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const { can } = useRole();
  const canReply = can("agent");
  const [closeConversation] = useCloseConversationMutation();
  const [reopenConversation] = useReopenConversationMutation();
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    sendFile(file);
  };

  const sendFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      toast({ type: "error", title: "File too large (max 25 MB)" });
      return;
    }
    uploadAttachment({ id: conversationId, file })
      .unwrap()
      .then((res: any) => {
        if (res?.status === "failed") {
          toast({ type: "error", title: "Not delivered", description: friendlyChannelError(res?.ai_metadata?.send_error) });
        } else {
          toast({ type: "success", title: "Sent" });
        }
      })
      .catch((err: any) => {
        toast({ type: "error", title: err?.data?.error?.message || err?.data?.message || "Upload failed" });
      });
  };

  const stopTimer = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    recordTimerRef.current = null;
  };

  const startRecording = async () => {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast({ type: "error", title: "Voice recording isn't supported in this browser" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recordChunksRef.current = [];
      cancelRecordRef.current = false;
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordChunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        setIsRecording(false);
        setRecordSeconds(0);
        if (cancelRecordRef.current) return;
        const type = (rec.mimeType || mimeType || "audio/webm").split(";")[0];
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(recordChunksRef.current, { type });
        if (blob.size < 1000) {
          toast({ type: "error", title: "Recording too short" });
          return;
        }
        sendFile(new File([blob], `voice-${Date.now()}.${ext}`, { type }));
      };
      recorderRef.current = rec;
      rec.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((n) => n + 1), 1000);
    } catch {
      toast({ type: "error", title: "Microphone access denied" });
    }
  };

  const stopRecording = (cancel = false) => {
    cancelRecordRef.current = cancel;
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  };

  // Stop the mic if the user leaves the conversation mid-recording
  useEffect(() => {
    return () => {
      cancelRecordRef.current = true;
      if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
      stopTimer();
    };
  }, [conversationId]);

  const handleMarkUnread = () => {
    markUnread(conversationId)
      .unwrap()
      .then(() => {
        toast({ type: "success", title: "Marked as unread" });
        // Leave the chat — an open chat would mark itself read again on the next poll.
        onBack?.();
      })
      .catch(() => toast({ type: "error", title: "Couldn't mark as unread" }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage({ id: conversationId, content: message })
      .unwrap()
      .then((res: any) => {
        setMessage("");
        // The API returns 201 even when the channel send failed (the
        // message is still saved so the agent sees the failed attempt) —
        // status is what actually tells us whether Meta accepted it.
        if (res?.status === "failed") {
          toast({
            type: "error",
            title: "Message not delivered",
            description: friendlyChannelError(res?.ai_metadata?.send_error),
          });
        }
      })
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
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 shrink-0">
            {conversation?.customer_avatar && <AvatarImage src={conversation.customer_avatar} />}
            <AvatarFallback>{getInitials(conversation?.customer_name || "U")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{conversation?.customer_name}</p>
              <ChannelBadge channel={conversation?.channel} />
            </div>
            <p className="text-xs text-muted-foreground">
              {conversation?.customer_phone || "No phone"}
              {conversation?.language && ` • ${conversation.language}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {conversation?.handled_by === "ai" && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
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

          {onShowDetails && (
            <Button variant="ghost" size="icon" className="xl:hidden" onClick={onShowDetails}>
              <Info className="h-4 w-4" />
            </Button>
          )}

          <Dropdown
            trigger={
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            items={[
              ...(canReply
                ? [
                    { label: "Mark as unread", icon: MailOpen, onClick: handleMarkUnread },
                    conversation?.status === "closed"
                      ? { label: "Reopen", icon: Check, onClick: handleReopen }
                      : { label: "Close conversation", icon: X, onClick: handleClose },
                  ]
                : []),
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
                  msg.status === "failed"
                    ? "bg-destructive/10 border border-destructive/40 text-foreground"
                    : msg.sender_type === "customer"
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
                  <MessageAttachmentView key={att.id} att={att} />
                ))}
                {/* Hide the auto-generated file-name caption when the media is already shown */}
                {!(Array.isArray(msg.attachments) && msg.attachments.length > 0
                  && ["image", "audio", "video"].includes(msg.message_type)
                  && (msg.content || "") === (msg.attachments[0]?.file_name || "")) && (
                  <MessageContent content={msg.content || ""} />
                )}
                <p className={cn("mt-1 text-[10px]", msg.status === "failed" ? "text-destructive font-medium" : msg.sender_type === "customer" ? "text-muted-foreground" : "opacity-60")}>
                  {msg.status === "failed" ? (
                    <>
                      <AlertTriangle className="mr-1 inline h-3 w-3" />
                      Not delivered — {friendlyChannelError(msg.ai_metadata?.send_error)}
                    </>
                  ) : (
                    <>
                      {formatTime(msg.created_at)}
                      {msg.sender_type !== "customer" && msg.status === "read" && " • Read"}
                    </>
                  )}
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
      {!canReply && (
        <div className="border-t border-border p-3 text-center text-sm text-muted-foreground">
          You have view-only access to this workspace, so you can&apos;t reply.
        </div>
      )}
      <div className={cn("border-t border-border p-3", !canReply && "hidden")}>
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,audio/*,video/*,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.zip"
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
          {isRecording ? (
            <div className="flex flex-1 items-center gap-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
              <span className="font-medium tabular-nums">
                {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:{String(recordSeconds % 60).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground">Recording…</span>
              <button type="button" className="ml-auto text-xs text-muted-foreground underline" onClick={() => stopRecording(true)}>
                Cancel
              </button>
            </div>
          ) : (
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
          )}
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            type="button"
            disabled={isUploading}
            onClick={() => (isRecording ? stopRecording(false) : startRecording())}
            title={isRecording ? "Stop and send voice message" : "Record a voice message"}
          >
            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
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
