"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useGetWorkspacesQuery } from "@/redux/api/workspaceApi";
import { useAuth } from "@/providers/app-providers";
import type { Workspace } from "@/types/api";

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  setWorkspace: (ws: Workspace) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data, isLoading: queryLoading } = useGetWorkspacesQuery(undefined, {
    skip: !user,
  });
  const workspaces: Workspace[] = Array.isArray(data)
    ? data
    : (data as { results?: Workspace[] } | undefined)?.results ?? [];

  // Selection is derived state — the chosen id lives in localStorage + state;
  // the resolved workspace falls back to the first available.
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("active_workspace_id") : null
  );

  const workspace =
    workspaces.find((w) => w.id === selectedId) ??
    workspaces[0] ??
    null;

  const setWorkspace = useCallback((ws: Workspace) => {
    setSelectedId(ws.id);
    localStorage.setItem("active_workspace_id", ws.id);
  }, []);

  const isLoading = !!user && queryLoading;

  return (
    <WorkspaceContext.Provider value={{ workspace, workspaces, setWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
