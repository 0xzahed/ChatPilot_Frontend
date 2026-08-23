"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/providers/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateWorkspaceMutation } from "@/redux/api/workspaceApi";

export default function OnboardingPage() {
  const router = useRouter();
  const { setWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [createWorkspace, { isLoading: isCreating }] = useCreateWorkspaceMutation();
  const isLoading = isCreating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const workspace = await createWorkspace({ name, slug }).unwrap();
      setWorkspace(workspace);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.data?.error?.message || err.data?.detail || "Failed to create workspace");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold">Create your workspace</h2>
        <p className="mt-2 text-sm text-muted-foreground">Set up a workspace to get started.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
              }}
              placeholder="My Store"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-store"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="h-4 w-4" /> : "Create Workspace"}
          </Button>
        </form>
      </div>
    </div>
  );
}
