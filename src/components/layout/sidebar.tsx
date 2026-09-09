"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/app-providers";
import { useWorkspace } from "@/providers/workspace-context";
import {
  LayoutDashboard, Inbox, Users, ShoppingCart,
  AlertTriangle, Zap, BarChart3, Settings, Plug, Tag,
  MessageSquare, ChevronDown, LogOut, User, ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/complaints", label: "Complaints", icon: AlertTriangle },
  { href: "/automation", label: "Automation", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/team", label: "Team", icon: Users },
  { href: "/labels", label: "Labels", icon: Tag },
];

const settingsItems = [
  { href: "/settings", label: "General", icon: Settings },
  { href: "/settings/ai", label: "AI Settings", icon: MessageSquare },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

const adminItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit Logs", icon: AlertTriangle },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspace, workspaces, setWorkspace } = useWorkspace();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageSquare className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold">ChatPilot</span>
      </div>

      {/* Workspace selector */}
      <div className="border-b border-sidebar-border p-3">
        <Dropdown
          trigger={
            <button className="flex w-full items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm font-medium hover:bg-accent">
              <span className="truncate">{workspace?.name || "Select workspace"}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          }
          items={workspaces.map((ws) => ({
            label: ws.name,
            onClick: () => setWorkspace(ws),
          }))}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="my-4 border-t border-sidebar-border" />

        <div className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground">Settings</p>
          {settingsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {user?.is_platform_admin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            <div className="space-y-1">
              <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Platform Admin
              </p>
              {adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User menu */}
      <div className="border-t border-sidebar-border p-3">
        <Dropdown
          trigger={
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.email || "U")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          }
          items={[
            { label: "Profile", icon: User, onClick: () => router.push("/settings") },
            { label: "Sign out", icon: LogOut, onClick: logout },
          ]}
        />
      </div>
    </div>
  );
}
