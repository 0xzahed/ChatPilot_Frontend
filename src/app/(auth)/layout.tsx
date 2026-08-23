import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">ChatPilot</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            AI-powered sales & support across every channel
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Facebook • Instagram • WhatsApp • Website — all in one intelligent inbox
          </p>
        </div>
        <div className="text-sm text-primary-foreground/60">
          © 2026 ChatPilot. All rights reserved.
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">ChatPilot</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
