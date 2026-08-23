"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { Search, Building2, Pause, Play, Trash2, Edit, Users } from "lucide-react";
import {
  useGetAdminWorkspacesQuery,
  useUpdateAdminWorkspaceMutation,
  useDeleteAdminWorkspaceMutation,
} from "@/redux/api/adminApi";

export default function AdminWorkspacesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data: rawData, isLoading } = useGetAdminWorkspacesQuery({ search, page, page_size: 20 });
  const data = rawData as any;

  const [updateAdminWorkspace, { isLoading: isUpdating }] = useUpdateAdminWorkspaceMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateAdminWorkspace({ id, data }).unwrap().then(() => {
        toast({ type: "success", title: "Workspace updated" });
        setEditing(null);
      }).catch((e: any) => toast({ type: "error", title: "Failed to update workspace", description: e?.data?.detail }));
    },
  };

  const [deleteAdminWorkspace, { isLoading: isDeleting }] = useDeleteAdminWorkspaceMutation();
  const deleteMutation = {
    isPending: isDeleting,
    mutate: (id: string) => {
      deleteAdminWorkspace(id).unwrap().then(() => {
        toast({ type: "success", title: "Workspace deleted" });
      }).catch((e: any) => toast({ type: "error", title: "Failed to delete workspace", description: e?.data?.detail }));
    },
  };

  const openEdit = (ws: any) => {
    setEditing(ws);
    setEditForm({
      is_suspended: ws.is_suspended ?? false,
      name: ws.name,
    });
  };

  const workspaces = data?.results || data || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <p className="text-sm text-muted-foreground">Manage all platform workspaces.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Workspaces</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No workspaces found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    workspaces.map((w: any) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{w.slug}</TableCell>
                        <TableCell className="text-sm">{w.owner_email || "—"}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            {w.member_count ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {w.plan_name ? <Badge variant="secondary">{w.plan_name}</Badge> : "—"}
                        </TableCell>
                        <TableCell>
                          {w.is_suspended ? (
                            <Badge variant="destructive" className="gap-1">
                              <Pause className="h-3 w-3" /> Suspended
                            </Badge>
                          ) : (
                            <Badge variant="success" className="gap-1">
                              <Play className="h-3 w-3" /> Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {w.created_at ? new Date(w.created_at).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(w)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Delete workspace ${w.name}? This cannot be undone.`)) {
                                  deleteMutation.mutate(w.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Edit Workspace — ${editing?.name || ""}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              onClick={() => updateMutation.mutate({ id: editing.id, data: editForm })}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Name</Label>
              <Input
                id="ws-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Pause className="h-5 w-5 text-rose-600" />
                <div>
                  <Label>Suspended</Label>
                  <p className="text-xs text-muted-foreground">Block all access to this workspace</p>
                </div>
              </div>
              <Switch
                checked={editForm.is_suspended}
                onChange={(v: boolean) => setEditForm({ ...editForm, is_suspended: v })}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
