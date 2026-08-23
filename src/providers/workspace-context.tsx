"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { workspaceApi } from "@/lib/api";
import { useAuth } from "@/providers/app-providers";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

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
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setWorkspaceState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    workspaceApi
      .list()
      .then((res) => {
        setWorkspaces(res.data);
        const savedId = localStorage.getItem("active_workspace_id");
        const saved = res.data.find((w: Workspace) => w.id === savedId);
        setWorkspaceState(saved || res.data[0] || null);
      })
      .catch(() => {
        setWorkspaces([]);
        setWorkspaceState(null);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  const setWorkspace = (ws: Workspace) => {
    setWorkspaceState(ws);
    localStorage.setItem("active_workspace_id", ws.id);
  };

  return (
    <WorkspaceContext.Provider value={{ workspace, workspaces, setWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
