"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
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

/** Set a non-sensitive marker cookie so middleware can gate protected routes. */
function setAuthCookie(hasToken: boolean) {
  document.cookie = `has_access_token=${hasToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AppProviders");
  return ctx;
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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setAuthCookie(true);
      authApi
        .me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setAuthCookie(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setAuthCookie(false);
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    setAuthCookie(true);
    const meRes = await authApi.me();
    setUser(meRes.data);
  }, []);

  const logout = useCallback(() => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) authApi.logout(refresh).catch(() => {});
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthCookie(false);
    setUser(null);
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
