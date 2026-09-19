"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/providers/workspace-context";
import { useGetUsageSummaryQuery } from "@/redux/api/usageApi";
import { useGetNotificationsQuery } from "@/redux/api/notificationApi";
import { Bell, Search, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dropdown } from "@/components/ui/dropdown";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [search, setSearch] = useState("");
  const [isDark, setIsDark] = useState(false);

  const { data: usage } = useGetUsageSummaryQuery(workspace!.id, {
    skip: !workspace,
  });

  const { data: notifications } = useGetNotificationsQuery({ is_read: "false" });

  const unreadCount = Array.isArray(notifications)
    ? notifications.length
    : (notifications as { results?: unknown[] } | undefined)?.results?.length || 0;

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/inbox?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="pl-9"
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {usage && usage.message_limit != null && usage.messages_used != null && (
          <Badge variant={(usage.messages_remaining ?? 0) < usage.message_limit * 0.1 ? "warning" : "secondary"}>
            {usage.messages_used.toLocaleString()} / {usage.message_limit.toLocaleString()} messages
          </Badge>
        )}

        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Dropdown
          trigger={
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          }
          items={[
            { label: "View all notifications", onClick: () => router.push("/notifications") },
          ]}
        />
      </div>
    </header>
  );
}
