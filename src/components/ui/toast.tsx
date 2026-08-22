"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastConfig: Record<
  ToastType,
  { icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-success/50 text-success",
  },
  error: {
    icon: XCircle,
    className: "border-destructive/50 text-destructive",
  },
  info: {
    icon: Info,
    className: "border-primary/50 text-primary",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/50 text-warning",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timeoutsRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (newToast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...newToast, id }]);
      const timeout = setTimeout(() => dismiss(id), 3000);
      timeoutsRef.current.set(id, timeout);
    },
    [dismiss]
  );

  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[400px]">
        {toasts.map((t) => {
          const config = toastConfig[t.type];
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={cn(
                "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border bg-card p-4 pr-8 shadow-lg animate-slide-in-right",
                config.className
              )}
              role="alert"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-foreground">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-sm text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="absolute right-2 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { ToastProvider as Toast };
