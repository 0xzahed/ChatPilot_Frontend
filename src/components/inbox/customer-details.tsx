"use client";

import {
  useGetConversationQuery,
} from "@/redux/api/conversationApi";
import {
  useGetCustomerQuery,
  useGetCustomerTimelineQuery,
} from "@/redux/api/customerApi";
import { useGetOrdersQuery } from "@/redux/api/orderApi";
import { cn, formatCurrency, formatDate, timeAgo, getInitials } from "@/lib/utils";
import { ChannelBadge } from "./channel-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone, Mail, MapPin, ShoppingCart, Clock, Tag,
  AlertTriangle, MessageSquare,
} from "lucide-react";

interface CustomerDetailsProps {
  conversationId: string;
}

export function CustomerDetails({ conversationId }: CustomerDetailsProps) {
  const { data: conversation } = useGetConversationQuery(conversationId);

  const customerId = (conversation as any)?.customer;

  const { data: rawCustomer, isLoading } = useGetCustomerQuery(customerId, {
    skip: !customerId,
  });
  // iedu-proxied conversations have no local customer row — build one from
  // the conversation's own fields instead
  const isIedu = String(conversationId).startsWith("iedu_");
  const customer = (rawCustomer as any) || (isIedu && conversation ? {
    name: conversation.customer_name,
    phone: conversation.customer_phone,
    avatar: conversation.customer_avatar,
    email: null,
    location: null,
    language: conversation.language,
    is_vip: false,
    created_at: conversation.created_at,
    channels: [{ id: "iedu", channel: "website", display_name: "iedu Support" }],
    labels: conversation.labels || [],
  } : null);
  const { data: ordersData } = useGetOrdersQuery(
    { customer: customerId },
    { skip: !customerId }
  );
  const { data: timelineData } = useGetCustomerTimelineQuery(customerId, {
    skip: !customerId,
  });

  const orders: any[] = (ordersData as any)?.results || (ordersData as any) || [];
  const timeline: any[] = (timelineData as any)?.results || (timelineData as any) || [];

  if (isLoading || !customer) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
      {/* Customer header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20">
          {customer.avatar && <AvatarImage src={customer.avatar} />}
          <AvatarFallback className="text-lg">{getInitials(customer.name)}</AvatarFallback>
        </Avatar>
        <h3 className="mt-3 font-semibold">{customer.name}</h3>
        {customer.is_vip && <Badge variant="default" className="mt-1">VIP Customer</Badge>}
        <p className="mt-1 text-xs text-muted-foreground">
          Customer since {formatDate(customer.created_at)}
        </p>
      </div>

      {/* Contact info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{customer.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{customer.language || "en"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Channels */}
      {customer.channels && customer.channels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customer.channels.map((ch: any) => (
              <div key={ch.id} className="flex items-center justify-between">
                <ChannelBadge channel={ch.channel} />
                <span className="text-xs text-muted-foreground">{ch.display_name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Labels */}
      {customer.labels && customer.labels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" /> Labels
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {customer.labels.map((label: any) => (
              <Badge
                key={label.id}
                variant="secondary"
                className={cn({
                  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300": label.color === "blue",
                  "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300": label.color === "red",
                  "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300": label.color === "green",
                  "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300": label.color === "purple",
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300": label.color === "yellow",
                  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300": label.color === "orange",
                })}
              >
                {label.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent orders */}
      {orders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-2">
                <div>
                  <p className="text-xs font-medium">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{formatCurrency(order.total)}</p>
                  <Badge
                    variant={
                      order.status === "delivered" ? "success" :
                      order.status === "cancelled" ? "destructive" :
                      "secondary"
                    }
                    className="text-[10px]"
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" /> Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.slice(0, 10).map((event: any, idx: number) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    {event.event_type === "order_created" ? (
                      <ShoppingCart className="h-3 w-3" />
                    ) : event.event_type === "complaint" ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <MessageSquare className="h-3 w-3" />
                    )}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="h-full w-px bg-border" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <p className="text-xs font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(event.created_at)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
