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
import { Search, ShieldCheck, Filter } from "lucide-react";
import { useGetAdminAuditLogsQuery } from "@/redux/api/adminApi";

export default function AdminAuditPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const { data: rawData, isLoading } = useGetAdminAuditLogsQuery(
    { search, action: action || undefined, page, page_size: 25 },
  );
  const data = rawData as any;

  const logs: any[] = data?.results || data || [];
  const totalPages = data?.total_pages || 1;

  const actionBadge = (a: string) => {
    const map: Record<string, "success" | "secondary" | "destructive" | "warning"> = {
      create: "success",
      update: "secondary",
      delete: "destructive",
      login: "success",
      logout: "secondary",
      suspend: "warning",
      activate: "success",
    };
    return map[a?.toLowerCase()] || "secondary";
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Track all platform-wide actions.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <div className="relative w-40">
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <select
                  value={action}
                  onChange={(e) => {
                    setAction(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm"
                >
                  <option value="">All actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="suspend">Suspend</option>
                  <option value="activate">Activate</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No audit logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log: any, i: number) => (
                      <TableRow key={log.id ?? i}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {log.user_email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={actionBadge(log.action)} className="capitalize">
                            {log.action || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.resource_type && log.resource_id
                            ? `${log.resource_type} #${log.resource_id}`
                            : log.description || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.workspace_name || "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {log.ip_address || "—"}
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
    </div>
  );
}
