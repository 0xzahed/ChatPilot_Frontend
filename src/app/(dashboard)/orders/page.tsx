"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useGetOrdersQuery } from "@/redux/api/orderApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  ShoppingCart,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  CreditCard,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_VARIANT: Record<string, any> = {
  pending: "warning",
  confirmed: "secondary",
  processing: "secondary",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
};

const PAYMENT_STATUS_VARIANT: Record<string, any> = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
  refunded: "secondary",
  partial: "warning",
};

interface OrderItem {
  id: string;
  product_name?: string;
  product?: { name?: string };
  quantity: number;
  price: number | string;
  total?: number | string;
}

interface Order {
  id: string;
  order_number?: string;
  number?: string;
  customer?: { id: string; name: string; phone?: string; email?: string };
  customer_name?: string;
  items?: OrderItem[];
  total: number | string;
  payment_method?: string;
  payment_status?: string;
  status: string;
  shipping_address?: string;
  created_at: string;
}

interface OrderListResponse {
  results: Order[];
  count: number;
}

export default function OrdersPage() {
  const { workspace } = useWorkspace();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const { data: rawData, isLoading, isError } = useGetOrdersQuery(
    {
      workspace_id: workspace?.id,
      search: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      page,
      limit: PAGE_SIZE,
    },
    { skip: !workspace }
  );
  const data = rawData as any;

  const orders: Order[] = data?.results || [];
  const totalPages = data?.count
    ? Math.ceil(data.count / PAGE_SIZE)
    : 1;
  const hasMore = page < totalPages;
  const hasPrev = page > 1;

  const getOrderNumber = (order: Order) =>
    order.order_number || order.number || `#${order.id.slice(0, 8)}`;

  const getCustomerName = (order: Order) =>
    order.customer?.name || order.customer_name || "Unknown";

  const getItemsCount = (order: Order) =>
    order.items?.length ||
    order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ||
    0;

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and manage customer orders
        </p>
      </div>

      {/* Search + Status Tabs */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs
          tabs={STATUS_TABS}
          activeTab={status}
          onChange={setStatus}
          className="w-fit overflow-x-auto"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            Orders
            {data?.count != null && (
              <span className="text-muted-foreground">({data.count})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              icon={ShoppingCart}
              title="Failed to load orders"
              description="Something went wrong. Please try again."
            />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description={
                debouncedSearch || status !== "all"
                  ? "Try adjusting your filters."
                  : "Orders will appear here once customers place them."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(order)}
                    >
                      <TableCell className="font-medium text-foreground">
                        {getOrderNumber(order)}
                      </TableCell>
                      <TableCell>{getCustomerName(order)}</TableCell>
                      <TableCell className="text-center">
                        {getItemsCount(order)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        {order.payment_method ? (
                          <Badge variant="outline" className="capitalize">
                            {order.payment_method}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.payment_status ? (
                          <Badge
                            variant={
                              PAYMENT_STATUS_VARIANT[order.payment_status] ||
                              "secondary"
                            }
                            className="capitalize"
                          >
                            {order.payment_status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[order.status] || "secondary"}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        description={
          selectedOrder ? `Order ${getOrderNumber(selectedOrder)}` : undefined
        }
        className="max-w-2xl"
        footer={
          <Button variant="outline" onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={STATUS_VARIANT[selectedOrder.status] || "secondary"}
                className="capitalize"
              >
                {selectedOrder.status}
              </Badge>
              {selectedOrder.payment_status && (
                <Badge
                  variant={
                    PAYMENT_STATUS_VARIANT[selectedOrder.payment_status] ||
                    "secondary"
                  }
                  className="capitalize"
                >
                  {selectedOrder.payment_status}
                </Badge>
              )}
              {selectedOrder.payment_method && (
                <Badge variant="outline" className="capitalize">
                  <CreditCard className="mr-1 h-3 w-3" />
                  {selectedOrder.payment_method}
                </Badge>
              )}
            </div>

            {/* Customer info */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                Customer
              </p>
              <p className="mt-1 font-semibold">
                {getCustomerName(selectedOrder)}
              </p>
              {selectedOrder.customer?.phone && (
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.customer.phone}
                </p>
              )}
              {selectedOrder.customer?.email && (
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.customer.email}
                </p>
              )}
            </div>

            {/* Order items */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="h-4 w-4 text-muted-foreground" />
                Order Items
              </div>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="rounded-lg border border-border">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3",
                        idx > 0 && "border-t border-border"
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.product_name || item.product?.name || "Product"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(
                          item.total ||
                            (parseFloat(String(item.price)) || 0) *
                              (item.quantity || 0)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No items available
                </p>
              )}
            </div>

            {/* Shipping address */}
            {selectedOrder.shipping_address && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Shipping Address
                </div>
                <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                  {selectedOrder.shipping_address}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold">
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Created on {formatDate(selectedOrder.created_at)}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
