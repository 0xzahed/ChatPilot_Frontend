"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/app-providers";
import { useWorkspace } from "@/providers/workspace-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { workspace, isLoading: wsLoading } = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Open: mount + animate in
  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    // next tick so the slide-in animation runs
    requestAnimationFrame(() => setSidebarVisible(true));
  }, []);

  // Close: animate out, then unmount
  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
    window.setTimeout(() => setSidebarOpen(false), 250);
  }, []);

  // Lock body scroll while sidebar open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSidebar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  if (authLoading || wsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  if (!workspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium">No workspace found</p>
        <p className="text-sm text-muted-foreground">Create a workspace to get started</p>
        <button
          onClick={() => router.push("/onboarding")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity ease-out"
            style={{ opacity: sidebarVisible ? 1 : 0, transitionDuration: "250ms" }}
            onClick={closeSidebar}
          />
          {/* Panel — slides from left */}
          <aside
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-sidebar shadow-2xl transition-transform ease-out"
            style={{
              transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)",
              transitionDuration: "250ms",
              transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            <Sidebar onNavigate={closeSidebar} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <Topbar onMenuClick={openSidebar} />
        <main className="flex-1 min-h-0 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
