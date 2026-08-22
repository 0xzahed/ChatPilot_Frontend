import Link from "next/link";
import { MessageSquare, Zap, Globe, Shield, BarChart3, Bot } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold">OpenChat</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary" />
            AI-powered omnichannel platform
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Your AI Sales Agent on{" "}
            <span className="text-primary">Facebook, Instagram</span> &{" "}
            <span className="text-primary">WhatsApp</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Let AI talk to your customers, take orders, and close sales — so you
            can focus on growing your business. Multilingual support for Bangla,
            English, and Banglish.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-card px-8 py-3 text-base font-medium hover:bg-accent"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold">Everything you need to automate sales</h2>
            <p className="mt-4 text-muted-foreground">Powerful features that work together</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Bot, title: "AI Auto-Replies", desc: "AI handles customer queries 24/7 across all channels with intelligent responses." },
              { icon: Globe, title: "Multilingual", desc: "Naturally responds in Bangla, English, Banglish, and more — auto-detected." },
              { icon: MessageSquare, title: "Omnichannel Inbox", desc: "All your Facebook, Instagram, WhatsApp, and website messages in one place." },
              { icon: BarChart3, title: "Analytics", desc: "Track conversations, orders, revenue, AI automation rate, and more." },
              { icon: Shield, title: "Complaint Detection", desc: "AI automatically detects complaints and escalates to human agents." },
              { icon: Zap, title: "Image Recognition", desc: "Customers send product photos — AI identifies and recommends matching items." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          OpenChat — AI Omnichannel Sales & Customer Support Platform
        </div>
      </footer>
    </div>
  );
}
