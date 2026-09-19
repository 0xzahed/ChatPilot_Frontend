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
import { Search, ShieldCheck, ShieldOff, UserCheck, UserX, Trash2, Edit } from "lucide-react";
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/redux/api/adminApi";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const { data: rawData, isLoading } = useGetAdminUsersQuery({ search, page, page_size: 20 });
  const data = rawData as any;

  const [updateAdminUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateAdminUser({ id, data }).unwrap().then(() => {
        toast({ type: "success", title: "User updated" });
        setEditing(null);
      }).catch((e: any) => toast({ type: "error", title: "Failed to update user", description: e?.data?.detail }));
    },
  };

  const [deleteAdminUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();
  const deleteMutation = {
    isPending: isDeleting,
    mutate: (id: string) => {
      deleteAdminUser(id).unwrap().then(() => {
        toast({ type: "success", title: "User deleted" });
      }).catch((e: any) => toast({ type: "error", title: "Failed to delete user", description: e?.data?.detail }));
    },
  };

  const openEdit = (user: any) => {
    setEditing(user);
    setEditForm({
      is_active: user.is_active,
      is_platform_admin: user.is_platform_admin,
      is_staff: user.is_staff,
    });
  };

  const users = data?.results || data || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u: any) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.workspace_name || "—"}
                        </TableCell>
                        <TableCell>
                          {u.is_active ? (
                            <Badge variant="success" className="gap-1">
                              <UserCheck className="h-3 w-3" /> Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <UserX className="h-3 w-3" /> Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="space-x-1">
                          {u.is_platform_admin && (
                            <Badge variant="destructive" className="gap-1">
                              <ShieldCheck className="h-3 w-3" /> Platform Admin
                            </Badge>
                          )}
                          {u.is_staff && <Badge variant="secondary">Staff</Badge>}
                          {!u.is_platform_admin && !u.is_staff && (
                            <span className="text-xs text-muted-foreground">User</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm(`Delete user ${u.email}? This cannot be undone.`)) {
                                  deleteMutation.mutate(u.id);
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
        title={`Edit User — ${editing?.email || ""}`}
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">User can log in</p>
                </div>
              </div>
              <Switch
                checked={editForm.is_active}
                onChange={(v: boolean) => setEditForm({ ...editForm, is_active: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                <div>
                  <Label>Platform Admin</Label>
                  <p className="text-xs text-muted-foreground">Full platform-wide access</p>
                </div>
              </div>
              <Switch
                checked={editForm.is_platform_admin}
                onChange={(v: boolean) => setEditForm({ ...editForm, is_platform_admin: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <ShieldOff className="h-5 w-5 text-amber-600" />
                <div>
                  <Label>Staff</Label>
                  <p className="text-xs text-muted-foreground">Django admin access</p>
                </div>
              </div>
              <Switch
                checked={editForm.is_staff}
                onChange={(v: boolean) => setEditForm({ ...editForm, is_staff: v })}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
