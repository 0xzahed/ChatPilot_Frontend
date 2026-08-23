import Link from "next/link";
import { MessageSquare, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-2xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <MessageSquare className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">ChatPilot</span>
        </div>

        {/* 404 big number */}
        <div className="relative">
          <h1 className="select-none text-[10rem] font-extrabold leading-none tracking-tighter text-transparent sm:text-[14rem]"
              style={{ WebkitTextStroke: "2px var(--primary)", opacity: 0.25 }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-border bg-card/80 px-6 py-2 shadow-sm backdrop-blur">
              <span className="text-sm font-medium text-muted-foreground">Page not found</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="mt-8 text-2xl font-bold text-foreground sm:text-3xl">
          Oops! This page took a coffee break
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry, let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Link>
        </div>

        {/* Helper links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/inbox" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
            <MessageSquare className="h-3.5 w-3.5" />
            Inbox
          </Link>
          <Link href="/customers" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
            <Search className="h-3.5 w-3.5" />
            Customers
          </Link>
          <Link href="/analytics" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
            <Search className="h-3.5 w-3.5" />
            Analytics
          </Link>
          <Link href="/settings" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
            <Search className="h-3.5 w-3.5" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
