"use client";

import { useState } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetLabelsQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} from "@/redux/api/labelApi";

const COLOR_OPTIONS = [
  "blue",
  "red",
  "green",
  "purple",
  "yellow",
  "orange",
  "indigo",
  "emerald",
  "rose",
];

const COLOR_MAP: Record<string, { dot: string; badge: string }> = {
  blue: { dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  red: { dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  green: { dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  purple: { dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
  yellow: { dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  orange: { dot: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  indigo: { dot: "bg-indigo-500", badge: "bg-indigo-100 text-indigo-700" },
  emerald: { dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  rose: { dot: "bg-rose-500", badge: "bg-rose-100 text-rose-700" },
};

interface LabelItem {
  id: string;
  name: string;
  color: string;
  description?: string;
  usage_count?: number;
}

const emptyForm = {
  name: "",
  color: "blue",
  description: "",
};

export default function LabelsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState<LabelItem | null>(null);

  const { data: rawData, isLoading, isError } = useGetLabelsQuery(undefined, {
    skip: !workspace,
  });
  const data = rawData as any;
  const labels: any[] = data?.results || data || [];

  const [createLabel, { isLoading: isCreating }] = useCreateLabelMutation();
  const createMutation = {
    isPending: isCreating,
    mutate: (payload: any) => {
      createLabel(payload)
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Label created successfully" });
          closeDialog();
        })
        .catch(() => toast({ type: "error", title: "Failed to create label" }));
    },
  };

  const [updateLabel, { isLoading: isUpdating }] = useUpdateLabelMutation();
  const updateMutation = {
    isPending: isUpdating,
    mutate: ({ id, data }: { id: string; data: any }) => {
      updateLabel({ id, data })
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Label updated successfully" });
          closeDialog();
        })
        .catch(() => toast({ type: "error", title: "Failed to update label" }));
    },
  };

  const [deleteLabel, { isLoading: isDeleting }] = useDeleteLabelMutation();
  const deleteMutation = {
    isPending: isDeleting,
    mutate: (id: string) => {
      deleteLabel(id)
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Label deleted" });
          setShowDeleteConfirm(null);
        })
        .catch(() => toast({ type: "error", title: "Failed to delete label" }));
    },
  };

  const openAdd = () => {
    setEditingLabel(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (label: LabelItem) => {
    setEditingLabel(label);
    setForm({
      name: label.name,
      color: label.color,
      description: label.description || "",
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingLabel(null);
    setForm(emptyForm);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ type: "warning", title: "Label name is required" });
      return;
    }
    const payload = {
      ...form,
      workspace_id: workspace?.id,
    };
    if (editingLabel) {
      updateMutation.mutate({ id: editingLabel.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Labels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize conversations and customers with labels
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Create Label
        </Button>
      </div>

      {/* Labels Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Tag}
          title="Failed to load labels"
          description="Something went wrong. Please try again."
        />
      ) : labels.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No labels yet"
          description="Create labels to organize your conversations and customers."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Create Label
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labels.map((label) => {
            const colors = COLOR_MAP[label.color] || COLOR_MAP.blue;
            return (
              <Card
                key={label.id}
                className="group transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          colors.badge
                        )}
                      >
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full",
                            colors.dot
                          )}
                        />
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {label.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {label.usage_count ?? 0}{" "}
                          {label.usage_count === 1 ? "use" : "uses"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(label)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(label)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {label.description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {label.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        colors.badge
                      )}
                    >
                      {label.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={showDialog}
        onClose={closeDialog}
        title={editingLabel ? "Edit Label" : "Create Label"}
        description={
          editingLabel
            ? "Update label information"
            : "Create a new label for organizing items"
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending
                ? "Saving..."
                : editingLabel
                ? "Save Changes"
                : "Create Label"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="label-name">Name *</Label>
            <Input
              id="label-name"
              placeholder="e.g. VIP Customer"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="label-color">Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => {
                const colors = COLOR_MAP[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                      form.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    )}
                    aria-label={color}
                  >
                    <span
                      className={cn(
                        "h-6 w-6 rounded-full",
                        colors.dot
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="label-desc">Description</Label>
            <Textarea
              id="label-desc"
              placeholder="Optional description for this label..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Preview */}
          <div className="space-y-1.5">
            <Label>Preview</Label>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                  (COLOR_MAP[form.color] || COLOR_MAP.blue).badge
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    (COLOR_MAP[form.color] || COLOR_MAP.blue).dot
                  )}
                />
                {form.name || "Label name"}
              </span>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Label"
        description="This action cannot be undone."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                showDeleteConfirm && deleteMutation.mutate(showDeleteConfirm.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            {showDeleteConfirm?.name}
          </span>
          ? This label will be removed from all associated items.
        </p>
      </Dialog>
    </div>
  );
}
