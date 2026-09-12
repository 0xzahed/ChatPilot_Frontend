"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageSquare, RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-warning/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-destructive/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <MessageSquare className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ChatPilot</span>
        </div>

        {/* Error icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 ring-8 ring-warning/5">
          <AlertTriangle className="h-10 w-10 text-warning" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          An unexpected error occurred while loading this page. You can try
          again or head back to safety.
        </p>

        {error?.digest && (
          <p className="mt-4 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        {error?.message && (
          <p className="mt-2 max-w-lg rounded-md bg-destructive/5 px-3 py-1.5 font-mono text-xs text-destructive break-all">
            {error.message}
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
