"use client";

import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { timeAgo } from "@/lib/utils";
import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "@/redux/api/notificationApi";
import {
  Bell, CheckCheck, Check, MessageSquare, ShoppingCart,
  AlertTriangle, UserPlus, Info,
} from "lucide-react";

const ICON_BY_TYPE: Record<string, React.ComponentType<{ className?: string }>> = {
  new_message: MessageSquare,
  conversation_assigned: UserPlus,
  complaint: AlertTriangle,
  order: ShoppingCart,
  integration_failed: AlertTriangle,
  ai_escalation: AlertTriangle,
  system: Info,
  message: MessageSquare,
  team: UserPlus,
  info: Info,
};

export default function NotificationsPage() {
  const { toast } = useToast();

  const { data: rawData, isLoading } = useGetNotificationsQuery(undefined);
  const data = rawData as any;
  const notifications: any[] = data?.results || data || [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const [markRead, { isLoading: isMarking }] = useMarkReadMutation();
  const markReadMutation = {
    isPending: isMarking,
    mutate: (id: string) => {
      markRead(id).unwrap().catch(() => toast({ type: "error", title: "Failed to mark as read" }));
    },
  };

  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const markAllMutation = {
    isPending: isMarkingAll,
    mutate: () => {
      markAllRead().unwrap().then(() => {
        toast({ type: "success", title: "All notifications marked as read" });
      }).catch(() => toast({ type: "error", title: "Failed to mark all as read" }));
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            {markAllMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You don't have any notifications yet. They'll appear here when there's new activity."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const Icon = ICON_BY_TYPE[n.notification_type || n.type] || Bell;
            return (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${n.is_read ? "" : "border-primary/30"}`}
                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.is_read ? "bg-muted" : "bg-primary/10 text-primary"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="default">New</Badge>}
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="text-xs text-muted-foreground">{n.created_at ? timeAgo(n.created_at) : ""}</p>
                  </div>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate(n.id);
                      }}
                      disabled={markReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
