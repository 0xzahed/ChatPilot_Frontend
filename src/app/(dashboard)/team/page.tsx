"use client";

import { useState } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import { useGetTeamQuery, useInviteMemberMutation, useUpdateMemberMutation } from "@/redux/api/teamApi";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { formatDate, getInitials } from "@/lib/utils";
import { Users, UserPlus, MoreVertical, Mail, Shield, Crown, UserCog } from "lucide-react";

const ROLES = [
  { value: "owner", label: "Owner", variant: "default" as const, icon: Crown },
  { value: "admin", label: "Admin", variant: "secondary" as const, icon: Shield },
  { value: "agent", label: "Agent", variant: "outline" as const, icon: UserCog },
];

const roleVariant = (role: string) =>
  ROLES.find((r) => r.value === role)?.variant || "outline";

export default function TeamPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent");

  const { data: rawData, isLoading } = useGetTeamQuery(undefined, { skip: !workspace });
  const data = rawData as any;
  const members: any[] = data?.results || data || [];

  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();
  const inviteMutation = {
    isPending: isInviting,
    mutate: () => {
      inviteMember({ email, role, workspaceId: workspace!.id }).unwrap().then(() => {
        toast({ type: "success", title: "Invitation sent", description: `An invite has been sent to ${email}.` });
        setInviteOpen(false);
        setEmail("");
        setRole("agent");
      }).catch(() => toast({ type: "error", title: "Invitation failed", description: "Could not send the invite." }));
    },
  };

  const [updateMember, { isLoading: isUpdating }] = useUpdateMemberMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, role }: { id: string; role: string }) => {
      updateMember({ id, role }).unwrap().then(() => {
        toast({ type: "success", title: "Role updated" });
      }).catch(() => toast({ type: "error", title: "Failed to update role" }));
    },
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ type: "warning", title: "Email required" });
      return;
    }
    inviteMutation.mutate();
  };

  const fullName = (m: any) =>
    [m.user?.first_name, m.user?.last_name].filter(Boolean).join(" ") || m.user?.email?.split("@")[0] || "Member";

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to your workspace.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Members table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
          <CardDescription>{members.length} member{members.length !== 1 ? "s" : ""} in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members yet"
              description="Invite your first team member to start collaborating."
              action={
                <Button onClick={() => setInviteOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{getInitials(fullName(member))}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{fullName(member)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.user?.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant(member.role)} className="capitalize">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active === false ? "secondary" : "success"}>
                        {member.is_active === false ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.created_at ? formatDate(member.created_at) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dropdown
                        align="right"
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                        items={ROLES.filter((r) => r.value !== "owner" && r.value !== member.role).map((r) => ({
                          label: `Make ${r.label}`,
                          icon: r.icon,
                          onClick: () => updateMutation.mutate({ id: member.id, role: r.value }),
                        }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        description="Send an invitation to join this workspace."
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="agent">Agent</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && <Spinner size="sm" className="h-4 w-4" />}
              Send Invite
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
