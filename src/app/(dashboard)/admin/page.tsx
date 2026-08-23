"use client";

import { useGetAdminStatsQuery } from "@/redux/api/adminApi";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users, Building2, MessageSquare, ShoppingCart, TrendingUp,
  ShieldCheck, UserCheck, UserX, AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminStatsQuery();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform Admin</h1>
          <p className="text-sm text-muted-foreground">Platform-wide overview & management.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data || {};

  const statCards = [
    {
      label: "Total Users",
      value: stats.users?.total ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
      sub: `${stats.users?.active ?? 0} active · ${stats.users?.new_7d ?? 0} new (7d)`,
      link: "/admin/users",
    },
    {
      label: "Workspaces",
      value: stats.workspaces?.total ?? 0,
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-950",
      sub: `${stats.workspaces?.active ?? 0} active · ${stats.workspaces?.suspended ?? 0} suspended`,
      link: "/admin/workspaces",
    },
    {
      label: "Conversations",
      value: stats.conversations?.total ?? 0,
      icon: MessageSquare,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
      sub: `${stats.conversations?.open ?? 0} open · ${stats.conversations?.new_7d ?? 0} new (7d)`,
    },
    {
      label: "Customers",
      value: stats.customers?.total ?? 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
      sub: "Across all workspaces",
    },
    {
      label: "Orders",
      value: stats.orders?.total ?? 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950",
      sub: "Across all workspaces",
    },
    {
      label: "Platform Admins",
      value: stats.users?.platform_admins ?? 0,
      icon: ShieldCheck,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-950",
      sub: "Users with platform-wide access",
      link: "/admin/users?is_platform_admin=true",
    },
    {
      label: "Active Users",
      value: stats.users?.active ?? 0,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-950",
      sub: `${stats.users?.inactive ?? 0} inactive`,
    },
    {
      label: "Suspended Workspaces",
      value: stats.workspaces?.suspended ?? 0,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-950",
      sub: "Currently suspended",
      link: "/admin/workspaces?is_suspended=true",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Admin</h1>
        <p className="text-sm text-muted-foreground">Platform-wide overview & management.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <span className="text-3xl font-bold">{card.value}</span>
                </div>
                <p className="mt-3 text-sm font-medium">{card.label}</p>
                <p className="text-xs text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          );
          return card.link ? (
            <Link key={card.label} href={card.link}>{content}</Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Plan distribution */}
      {(stats.plan_distribution?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Subscription Distribution
            </CardTitle>
            <CardDescription>Active subscriptions across workspaces.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {(stats.plan_distribution ?? []).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
                  <span className="font-medium">{p.plan}</span>
                  <Badge variant={p.status === "active" ? "success" : "secondary"}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/users">
          <Card className="transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Manage Users</p>
                <p className="text-sm text-muted-foreground">View, edit, suspend users</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/workspaces">
          <Card className="transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold">Manage Workspaces</p>
                <p className="text-sm text-muted-foreground">Suspend, edit workspaces</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/audit">
          <Card className="transition-all hover:border-primary hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold">Audit Logs</p>
                <p className="text-sm text-muted-foreground">Track all platform actions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
