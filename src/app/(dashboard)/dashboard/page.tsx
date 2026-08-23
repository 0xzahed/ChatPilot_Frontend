"use client";

import { useState } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useGetDashboardQuery, useGetChartsQuery } from "@/redux/api/analyticsApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, Users, ShoppingCart, DollarSign, Bot,
  Clock, AlertTriangle, TrendingUp, Zap,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CHANNEL_COLORS: Record<string, string> = {
  facebook: "#1877f2",
  instagram: "#e1306c",
  whatsapp: "#25d366",
  website: "#6366f1",
};

const DATE_FILTERS = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export default function DashboardPage() {
  const { workspace } = useWorkspace();
  const [days, setDays] = useState(30);

  const { data: stats, isLoading } = useGetDashboardQuery(
    { workspaceId: workspace!.id, days },
    { skip: !workspace }
  );

  const { data: charts } = useGetChartsQuery(
    { workspaceId: workspace!.id, days },
    { skip: !workspace }
  );

  const statCards = [
    { label: "Total Conversations", value: stats?.total_conversations, icon: MessageSquare, color: "text-blue-500" },
    { label: "Open Conversations", value: stats?.open_conversations, icon: MessageSquare, color: "text-orange-500" },
    { label: "Unread Messages", value: stats?.unread_messages, icon: MessageSquare, color: "text-red-500" },
    { label: "Total Customers", value: stats?.total_customers, icon: Users, color: "text-purple-500" },
    { label: "Orders", value: stats?.total_orders, icon: ShoppingCart, color: "text-green-500" },
    { label: "Revenue", value: stats?.revenue ? formatCurrency(stats.revenue) : null, icon: DollarSign, color: "text-emerald-500" },
    { label: "AI Handled", value: stats?.ai_handled, icon: Bot, color: "text-indigo-500" },
    { label: "Human Handled", value: stats?.human_handled, icon: Users, color: "text-cyan-500" },
    { label: "AI Automation", value: stats?.ai_automation_rate ? `${stats.ai_automation_rate}%` : null, icon: Zap, color: "text-yellow-500" },
    { label: "Conversion Rate", value: stats?.conversion_rate ? `${stats.conversion_rate}%` : null, icon: TrendingUp, color: "text-pink-500" },
    { label: "Avg Response", value: stats?.avg_response_time_seconds ? `${Math.round(stats.avg_response_time_seconds)}s` : null, icon: Clock, color: "text-teal-500" },
    { label: "Complaints", value: stats?.total_complaints, icon: AlertTriangle, color: "text-rose-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your business performance</p>
        </div>
        <div className="flex gap-2">
          {DATE_FILTERS.map((f) => (
            <Button
              key={f.days}
              variant={days === f.days ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(f.days)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Usage banner */}
      {stats && stats.message_limit != null && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Message Usage</p>
                <p className="text-xs text-muted-foreground">
                  {(stats.messages_used ?? 0).toLocaleString()} / {stats.message_limit.toLocaleString()} messages used this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(((stats.messages_used ?? 0) / stats.message_limit) * 100, 100)}%` }}
                />
              </div>
              <Badge variant={(stats.messages_remaining ?? 0) < stats.message_limit * 0.1 ? "warning" : "secondary"}>
                {(stats.messages_remaining ?? 0).toLocaleString()} remaining
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div className="mt-2">
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{card.value ?? "—"}</p>
                )}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Conversations over time */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={charts?.conversations_over_time || []}>
                <defs>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#convGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders over time */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts?.orders_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={charts?.channel_performance || []}
                  dataKey="count"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(e: any) => e.channel}
                >
                  {(charts?.channel_performance || []).map((entry: any) => (
                    <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || "#6366f1"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <FunnelChart>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                <Funnel dataKey="value" data={charts?.conversion_funnel || []} isAnimationActive>
                  <LabelList position="right" fill="var(--foreground)" stroke="none" dataKey="stage" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart full width */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={charts?.revenue_over_time || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
