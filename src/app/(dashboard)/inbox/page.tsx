"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatInterface } from "@/components/inbox/chat-interface";
import { CustomerDetails } from "@/components/inbox/customer-details";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function InboxContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [showDetails, setShowDetails] = useState(true);
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Column 1: Conversation list — full-width on mobile, fixed on desktop */}
      <div
        className={cn(
          "w-full shrink-0 border-r border-border bg-card lg:w-96",
          selectedId ? "hidden lg:block" : "block"
        )}
      >
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Column 2: Chat — hidden on mobile until a conversation is picked */}
      <div className={cn("flex-1 min-w-0", selectedId ? "block" : "hidden lg:block")}>
        {selectedId ? (
          <ChatInterface
            conversationId={selectedId}
            onBack={() => setSelectedId(null)}
            onShowDetails={() => setMobileDetailsOpen(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Select a conversation</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a conversation from the list to start chatting
            </p>
          </div>
        )}
      </div>

      {/* Column 3: Customer details — inline on xl+, slide-over below xl */}
      {selectedId && (
        <>
          <div className="hidden w-80 shrink-0 border-l border-border bg-card xl:block">
            <div className="flex items-center justify-between border-b border-border p-3">
              <h3 className="text-sm font-semibold">Customer Details</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowDetails(!showDetails)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {showDetails && <CustomerDetails conversationId={selectedId} />}
          </div>

          {mobileDetailsOpen && (
            <div className="fixed inset-0 z-50 xl:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileDetailsOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] border-l border-border bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b border-border p-3">
                  <h3 className="text-sm font-semibold">Customer Details</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMobileDetailsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CustomerDetails conversationId={selectedId} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}
