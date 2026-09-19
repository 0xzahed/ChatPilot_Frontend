"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { ReduxProvider } from "@/redux";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProviders");
  return ctx;
}

/**
 * Minimal cookie-auth fetch helpers. Tokens live in HttpOnly cookies —
 * JavaScript never sees them. The X-Requested-With header satisfies the
 * backend's CSRF check for cookie-authenticated requests.
 */
async function authFetch(path: string, init?: RequestInit) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(init?.headers || {}),
    },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (body && (body.message || body.error?.message)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body?.data ?? body;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Bootstrap: the access cookie is HttpOnly — just call /me and let the
  // backend tell us whether the session is valid.
  useEffect(() => {
    authFetch("/auth/me/")
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authFetch("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password, cookie_mode: true }),
    });
    setUser(data?.user ?? null);
  }, []);

  const logout = useCallback(() => {
    authFetch("/auth/logout/", { method: "POST", body: "{}" }).catch(() => {});
    setUser(null);
    // Full reload intentionally resets all client state (RTK cache, contexts)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }, []);

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthContext.Provider
            value={{ user, isLoading, isAuthenticated: !!user, login, logout, setUser }}
          >
            {children}
          </AuthContext.Provider>
        </ToastProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
