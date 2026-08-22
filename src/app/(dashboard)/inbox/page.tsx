"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ChatInterface } from "@/components/inbox/chat-interface";
import { CustomerDetails } from "@/components/inbox/customer-details";
import { MessageSquare, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InboxPage() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="flex h-full">
      {/* Column 1: Conversation list */}
      <div className="w-80 shrink-0 border-r border-border bg-card lg:w-96">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Column 2: Chat */}
      <div className="flex-1 min-w-0">
        {selectedId ? (
          <ChatInterface conversationId={selectedId} />
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

      {/* Column 3: Customer details */}
      {selectedId && (
        <div className="hidden w-80 shrink-0 border-l border-border bg-card xl:block">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h3 className="text-sm font-semibold">Customer Details</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowDetails(!showDetails)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {showDetails && <CustomerDetails conversationId={selectedId} />}
        </div>
      )}
    </div>
  );
}
