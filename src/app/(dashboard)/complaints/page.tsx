"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  useGetComplaintsQuery,
  useUpdateComplaintMutation,
} from "@/redux/api/complaintApi";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  MessageSquareWarning,
  Search,
  ChevronLeft,
  ChevronRight,
  Bot,
  User,
  AlertTriangle,
} from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";

const PAGE_SIZE = 20;

const PRIORITY_VARIANT: Record<string, any> = {
  urgent: "destructive",
  high: "warning",
  medium: "secondary",
  low: "secondary",
};

const STATUS_VARIANT: Record<string, any> = {
  open: "warning",
  in_progress: "secondary",
  resolved: "success",
  closed: "secondary",
  pending: "warning",
};

const PRIORITY_FILTERS = [
  { value: "", label: "All priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

interface Complaint {
  id: string;
  title: string;
  description?: string;
  customer?: { id: string; name: string };
  customer_name?: string;
  priority: string;
  status: string;
  assigned_to?: { id: string; name: string } | null;
  detected_by_ai?: boolean;
  created_at: string;
}

interface ComplaintListResponse {
  results: Complaint[];
  count: number;
}

export default function ComplaintsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, priority, status]);

  const {
    data: rawData,
    isLoading,
    isError,
  } = useGetComplaintsQuery(
    {
      workspace_id: workspace?.id,
      search: debouncedSearch || undefined,
      priority: priority || undefined,
      status: status || undefined,
      page,
      limit: PAGE_SIZE,
    },
    { skip: !workspace }
  );
  const data = rawData as any;

  const [updateComplaint, { isLoading: isUpdating }] = useUpdateComplaintMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateComplaint({ id, data })
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Complaint status updated" });
          setSelectedComplaint(null);
        })
        .catch(() => {
          toast({ type: "error", title: "Failed to update complaint" });
        });
    },
  };

  const complaints: Complaint[] = data?.results || [];
  const totalPages = data?.count
    ? Math.ceil(data.count / PAGE_SIZE)
    : 1;
  const hasMore = page < totalPages;
  const hasPrev = page > 1;

  const getCustomerName = (complaint: Complaint) =>
    complaint.customer?.name || complaint.customer_name || "Unknown";

  const openDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
  };

  const handleStatusUpdate = () => {
    if (!selectedComplaint) return;
    updateMutation.mutate({
      id: selectedComplaint.id,
      data: { status: newStatus },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and resolve customer complaints
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-44"
        >
          {PRIORITY_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-44"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareWarning className="h-5 w-5 text-muted-foreground" />
            Complaints
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
              icon={MessageSquareWarning}
              title="Failed to load complaints"
              description="Something went wrong. Please try again."
            />
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquareWarning}
              title="No complaints found"
              description={
                debouncedSearch || priority || status
                  ? "Try adjusting your filters."
                  : "All clear! No complaints have been filed."
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>AI Detected</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow
                      key={complaint.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(complaint)}
                    >
                      <TableCell className="font-medium text-foreground max-w-xs truncate">
                        {complaint.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {getInitials(getCustomerName(complaint))}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {getCustomerName(complaint)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={PRIORITY_VARIANT[complaint.priority] || "secondary"}
                          className="capitalize"
                        >
                          {complaint.priority === "urgent" && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[complaint.status] || "secondary"}
                          className="capitalize"
                        >
                          {complaint.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {complaint.assigned_to ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(complaint.assigned_to.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {complaint.assigned_to.name || "Unassigned"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {complaint.detected_by_ai ? (
                          <Badge variant="default" className="gap-1">
                            <Bot className="h-3 w-3" />
                            AI
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(complaint.created_at)}
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

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Complaint Details"
        description={selectedComplaint?.title}
        className="max-w-xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setSelectedComplaint(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={
                updateMutation.isPending ||
                newStatus === selectedComplaint?.status
              }
            >
              {updateMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </>
        }
      >
        {selectedComplaint && (
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={PRIORITY_VARIANT[selectedComplaint.priority] || "secondary"}
                className="capitalize"
              >
                {selectedComplaint.priority === "urgent" && (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                )}
                {selectedComplaint.priority} priority
              </Badge>
              <Badge
                variant={STATUS_VARIANT[selectedComplaint.status] || "secondary"}
                className="capitalize"
              >
                {selectedComplaint.status.replace(/_/g, " ")}
              </Badge>
              {selectedComplaint.detected_by_ai && (
                <Badge variant="default" className="gap-1">
                  <Bot className="h-3 w-3" />
                  Detected by AI
                </Badge>
              )}
            </div>

            {/* Customer */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(getCustomerName(selectedComplaint))}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {getCustomerName(selectedComplaint)}
                </p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm text-foreground">
                  {selectedComplaint.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Assigned agent */}
            <div className="space-y-1.5">
              <Label>Assigned Agent</Label>
              {selectedComplaint.assigned_to ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(selectedComplaint.assigned_to.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {selectedComplaint.assigned_to.name || "Unassigned"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </div>

            {/* Status update */}
            <div className="space-y-1.5">
              <Label htmlFor="status-update">Update Status</Label>
              <Select
                id="status-update"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              Created on {formatDate(selectedComplaint.created_at)}
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
