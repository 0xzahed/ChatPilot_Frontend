"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  useGetCustomersQuery, useCreateCustomerMutation, useUpdateCustomerMutation,
} from "@/redux/api/customerApi";
import { useGetLabelsQuery } from "@/redux/api/conversationApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
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
  Users,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Crown,
  Pencil,
} from "lucide-react";
import {
  cn,
  formatCurrency,
  formatDate,
  getInitials,
} from "@/lib/utils";

const PAGE_SIZE = 20;

const CHANNEL_COLORS: Record<string, string> = {
  facebook: "bg-blue-100 text-blue-700",
  instagram: "bg-pink-100 text-pink-700",
  whatsapp: "bg-green-100 text-green-700",
  website: "bg-indigo-100 text-indigo-700",
  webchat: "bg-purple-100 text-purple-700",
};

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  language?: string;
  channels?: string[];
  orders_count?: number;
  total_spent?: number;
  is_vip?: boolean;
  labels?: { id: string; name: string; color: string }[];
  created_at: string;
}

interface CustomerListResponse {
  results: Customer[];
  count: number;
  next: string | null;
  previous: string | null;
}

function CustomersContent() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    language: "en",
  });
  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
    email: "",
    language: "en",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    if (page !== 1) params.set("page", "1");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data: rawData, isLoading, isError } = useGetCustomersQuery(
    { workspace_id: workspace?.id, search: debouncedSearch || undefined, page, limit: PAGE_SIZE } as any,
    { skip: !workspace }
  );
  const data = rawData as any;

  const { data: labelsData } = useGetLabelsQuery(undefined as any, { skip: !workspace });
  const labels: any[] = (labelsData as any)?.results || (labelsData as any) || [];

  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateCustomer({ id, data })
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Customer updated successfully" });
          setSelectedCustomer(null);
        })
        .catch(() => toast({ type: "error", title: "Failed to update customer" }));
    },
    mutateAsync: async ({ id, data }: { id: string; data: any }) => {
      try {
        await updateCustomer({ id, data }).unwrap();
        toast({ type: "success", title: "Customer updated successfully" });
        setSelectedCustomer(null);
      } catch {
        toast({ type: "error", title: "Failed to update customer" });
      }
    },
  };

  const createMutation = {
    isPending: isCreating,
    mutate: (data: any) => {
      createCustomer(data)
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Customer created successfully" });
          setShowAddDialog(false);
          setAddForm({ name: "", phone: "", email: "", language: "en" });
        })
        .catch(() => toast({ type: "error", title: "Failed to create customer" }));
    },
    mutateAsync: async (data: any) => {
      try {
        await createCustomer(data).unwrap();
        toast({ type: "success", title: "Customer created successfully" });
        setShowAddDialog(false);
        setAddForm({ name: "", phone: "", email: "", language: "en" });
      } catch {
        toast({ type: "error", title: "Failed to create customer" });
      }
    },
  };

  const customers = data?.results || [];
  const hasMore = !!data?.next;
  const hasPrev = !!data?.previous || page > 1;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  const openEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      language: customer.language || "en",
    });
  };

  const handleUpdate = () => {
    if (!selectedCustomer) return;
    updateMutation.mutate({ id: selectedCustomer.id, data: editForm });
  };

  const handleCreate = () => {
    if (!addForm.name.trim()) {
      toast({ type: "warning", title: "Name is required" });
      return;
    }
    createMutation.mutate({ ...addForm, workspace_id: workspace?.id });
  };

  const labelColorMap = useMemo(
    () => ({
      blue: "bg-blue-100 text-blue-700",
      red: "bg-red-100 text-red-700",
      green: "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      yellow: "bg-yellow-100 text-yellow-700",
      orange: "bg-orange-100 text-orange-700",
      indigo: "bg-indigo-100 text-indigo-700",
      emerald: "bg-emerald-100 text-emerald-700",
      rose: "bg-rose-100 text-rose-700",
    }),
    []
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track your customer relationships
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-muted-foreground" />
            All Customers
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
              icon={Users}
              title="Failed to load customers"
              description="Something went wrong. Please try again."
            />
          ) : customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers found"
              description={
                debouncedSearch
                  ? "Try adjusting your search terms."
                  : "Get started by adding your first customer."
              }
              action={
                !debouncedSearch && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                )
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer: any) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => openEdit(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {getInitials(customer.name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">
                              {customer.name}
                            </span>
                            {customer.is_vip && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.phone || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(customer.channels || []).length > 0 ? (
                            customer.channels!.map((ch: any) => (
                              <span
                                key={ch}
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                                  CHANNEL_COLORS[ch] ||
                                    "bg-muted text-muted-foreground"
                                )}
                              >
                                {ch}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {customer.orders_count ?? 0}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.total_spent || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(customer.labels || []).slice(0, 2).map((label: any) => (
                            <span
                              key={label.id}
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                labelColorMap[label.color as keyof typeof labelColorMap] ||
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {label.name}
                            </span>
                          ))}
                          {(customer.labels || []).length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{(customer.labels || []).length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page}
                  {data?.count != null && ` of ${Math.ceil(data.count / PAGE_SIZE)}`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={() => goToPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasMore}
                    onClick={() => goToPage(page + 1)}
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

      {/* Edit / Detail Dialog */}
      <Dialog
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
        description="View and update customer information"
        className="max-w-xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setSelectedCustomer(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg">
                  {getInitials(selectedCustomer.name || "?")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {selectedCustomer.name}
                  </p>
                  {selectedCustomer.is_vip && (
                    <Badge variant="warning" className="gap-1">
                      <Crown className="h-3 w-3" /> VIP
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.orders_count ?? 0} orders ·{" "}
                  {formatCurrency(selectedCustomer.total_spent || 0)} spent
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-language">Language</Label>
                <Select
                  id="edit-language"
                  value={editForm.language}
                  onChange={(e) =>
                    setEditForm({ ...editForm, language: e.target.value })
                  }
                >
                  <option value="en">English</option>
                  <option value="bn">Bengali</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="es">Spanish</option>
                </Select>
              </div>
            </div>

            {selectedCustomer.channels &&
              selectedCustomer.channels.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Channels</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.channels.map((ch) => (
                      <span
                        key={ch}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          CHANNEL_COLORS[ch] ||
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {selectedCustomer.phone || "No phone"}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {selectedCustomer.email || "No email"}
              </span>
            </div>
          </div>
        )}
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add Customer"
        description="Create a new customer record"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Customer"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="add-name">Name *</Label>
            <Input
              id="add-name"
              placeholder="John Doe"
              value={addForm.name}
              onChange={(e) =>
                setAddForm({ ...addForm, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-phone">Phone</Label>
              <Input
                id="add-phone"
                placeholder="+8801XXXXXXXXX"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({ ...addForm, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="john@example.com"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-language">Language</Label>
            <Select
              id="add-language"
              value={addForm.language}
              onChange={(e) =>
                setAddForm({ ...addForm, language: e.target.value })
              }
            >
              <option value="en">English</option>
              <option value="bn">Bengali</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="es">Spanish</option>
            </Select>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
