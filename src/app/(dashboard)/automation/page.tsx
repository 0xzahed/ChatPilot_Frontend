"use client";

import { useState } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  useGetRulesQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetCommentsQuery,
} from "@/redux/api/automationApi";
import {
  Zap, Plus, Pencil, Trash2, MessageSquare, Bot,
} from "lucide-react";

const TRIGGER_TYPES = [
  { value: "new_message", label: "New Message" },
  { value: "keyword_match", label: "Keyword Match" },
  { value: "complaint_detected", label: "Complaint Detected" },
  { value: "order_created", label: "Order Created" },
];

const ACTION_TYPES = [
  { value: "auto_reply", label: "Auto Reply" },
  { value: "assign_agent", label: "Assign Agent" },
  { value: "add_label", label: "Add Label" },
  { value: "escalate", label: "Escalate" },
];

interface RuleForm {
  name: string;
  trigger_type: string;
  trigger_value: string;
  action_type: string;
  action_value: string;
  is_active: boolean;
}

const EMPTY_FORM: RuleForm = {
  name: "",
  trigger_type: "new_message",
  trigger_value: "",
  action_type: "auto_reply",
  action_value: "",
  is_active: true,
};

export default function AutomationPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);

  const { data: rawData, isLoading } = useGetRulesQuery(undefined, { skip: !workspace });
  const data = rawData as any;
  const rules: any[] = data?.results || data || [];

  const { data: commentsRawData, isLoading: commentsLoading } = useGetCommentsQuery(undefined, { skip: !workspace });
  const commentsData = commentsRawData as any;
  const comments: any[] = commentsData?.results || commentsData || [];

  const [createRule, { isLoading: isCreating }] = useCreateRuleMutation();
  const createMutation = {
    isPending: isCreating,
    mutate: (payload: any) => {
      createRule({ ...payload, workspace_id: workspace!.id }).unwrap().then(() => {
        toast({ type: "success", title: "Rule created", description: "Your automation rule has been created." });
        setDialogOpen(false);
      }).catch(() => toast({ type: "error", title: "Failed to create rule" }));
    },
  };

  const [updateRule, { isLoading: isUpdating }] = useUpdateRuleMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, payload }: { id: string; payload: any }) => {
      updateRule({ id, data: payload }).unwrap().then(() => {
        toast({ type: "success", title: "Rule updated", description: "Your automation rule has been updated." });
        setDialogOpen(false);
      }).catch(() => toast({ type: "error", title: "Failed to update rule" }));
    },
  };

  const [deleteRule, { isLoading: isDeleting }] = useDeleteRuleMutation();
  const deleteMutation = {
    isPending: isDeleting,
    mutate: (id: string) => {
      deleteRule(id).unwrap().then(() => {
        toast({ type: "success", title: "Rule deleted" });
      }).catch(() => toast({ type: "error", title: "Failed to delete rule" }));
    },
  };

  const toggleMutation = {
    isPending: false,
    mutate: ({ id, is_active }: { id: string; is_active: boolean }) => {
      updateRule({ id, data: { is_active } }).unwrap().catch(() =>
        toast({ type: "error", title: "Failed to update rule" })
      );
    },
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name || "",
      trigger_type: rule.trigger_type || "new_message",
      trigger_value: rule.trigger_value || "",
      action_type: rule.action_type || "auto_reply",
      action_value: rule.action_value || "",
      is_active: rule.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ type: "warning", title: "Name required", description: "Please enter a rule name." });
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;
  const labelFor = (val: string, list: { value: string; label: string }[]) =>
    list.find((t) => t.value === val)?.label || val;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Automation Rules</h1>
          <p className="text-sm text-muted-foreground">
            Automate responses and workflows based on triggers.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Rules list */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No automation rules yet"
          description="Create your first rule to automate replies, assignments, and escalations."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Rule
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rules.map((rule: any) => (
            <Card key={rule.id}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge variant={rule.is_active ? "success" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {rule.created_at ? formatDate(rule.created_at) : "—"}
                    </p>
                  </div>
                  <Switch
                    checked={rule.is_active}
                    onChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked })}
                    aria-label="Toggle rule"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">When:</span>
                    <Badge variant="outline">{labelFor(rule.trigger_type, TRIGGER_TYPES)}</Badge>
                    {rule.trigger_value && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">{rule.trigger_value}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Then:</span>
                    <Badge variant="outline">{labelFor(rule.action_type, ACTION_TYPES)}</Badge>
                    {rule.action_value && (
                      <span className="rounded bg-muted px-2 py-0.5 text-xs">{rule.action_value}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(rule)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(rule.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comment automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comment Automation
          </CardTitle>
          <CardDescription>Recent comments handled automatically by your rules.</CardDescription>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No automated comments yet"
              description="Comments automatically replied to by your rules will appear here."
            />
          ) : (
            <div className="space-y-3">
              {comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{comment.comment || comment.message || comment.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="capitalize">
                        {comment.platform || comment.source || "auto"}
                      </Badge>
                      <span>{comment.created_at ? timeAgo(comment.created_at) : "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit Rule" : "Create Rule"}
        description="Define a trigger and the action to perform automatically."
        className="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Auto-reply to order queries"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger</Label>
              <Select
                id="trigger-type"
                value={form.trigger_type}
                onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
              >
                {TRIGGER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger-value">Trigger Value</Label>
              <Input
                id="trigger-value"
                value={form.trigger_value}
                onChange={(e) => setForm({ ...form, trigger_value: e.target.value })}
                placeholder="e.g. refund, delivery"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="action-type">Action</Label>
              <Select
                id="action-type"
                value={form.action_type}
                onChange={(e) => setForm({ ...form, action_type: e.target.value })}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-value">Action Value</Label>
              <Input
                id="action-value"
                value={form.action_value}
                onChange={(e) => setForm({ ...form, action_value: e.target.value })}
                placeholder="e.g. reply text or agent name"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="rule-active">Active</Label>
              <p className="text-xs text-muted-foreground">Enable this rule immediately.</p>
            </div>
            <Switch
              checked={form.is_active}
              onChange={(checked) => setForm({ ...form, is_active: checked })}
              aria-label="Active"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Spinner size="sm" className="h-4 w-4" />}
              {editingId ? "Save Changes" : "Create Rule"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
