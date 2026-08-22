"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  workspaceApi, aiApi, billingApi, webchatApi, notificationApi,
} from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { timeAgo } from "@/lib/utils";
import {
  Settings, Bot, CreditCard, MessageSquare, Bell, Save, Check, CheckCheck,
} from "lucide-react";

const TABS = [
  { id: "general", label: "General" },
  { id: "ai", label: "AI Settings" },
  { id: "billing", label: "Billing" },
  { id: "webchat", label: "Webchat" },
  { id: "notifications", label: "Notifications" },
];

export default function SettingsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace configuration.</p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "general" && <GeneralTab />}
      {activeTab === "ai" && <AITab />}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "webchat" && <WebchatTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </div>
  );

  // ─── General Tab ───────────────────────────────────────────
  function GeneralTab() {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const { data, isLoading } = useQuery({
      queryKey: ["workspace-settings", workspace?.id],
      queryFn: () => workspaceApi.settings(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    useEffect(() => {
      if (data) {
        setName(data.name || workspace?.name || "");
        setSlug(data.slug || workspace?.slug || "");
      } else if (workspace) {
        setName(workspace.name);
        setSlug(workspace.slug);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const saveMutation = useMutation({
      mutationFn: () => workspaceApi.updateSettings(workspace!.id, { name, slug }),
      onSuccess: () => {
        toast({ type: "success", title: "Settings saved", description: "Workspace settings updated." });
        queryClient.invalidateQueries({ queryKey: ["workspace-settings", workspace?.id] });
      },
      onError: () => toast({ type: "error", title: "Failed to save", description: "Could not update settings." }),
    });

    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General
          </CardTitle>
          <CardDescription>Update your workspace name and URL slug.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="ws-name">Workspace Name</Label>
                <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ws-slug">Slug</Label>
                <Input id="ws-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <p className="text-xs text-muted-foreground">Used in URLs: /{slug || "your-slug"}</p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ─── AI Settings Tab ───────────────────────────────────────
  function AITab() {
    const [settings, setSettings] = useState<any>({
      ai_mode: "hybrid",
      provider: "openai",
      model_name: "",
      api_key: "",
      temperature: 0.7,
    });
    const [instructions, setInstructions] = useState<any>({
      business_name: "",
      description: "",
      tone: "",
      greeting: "",
      delivery_policy: "",
      payment_policy: "",
      return_policy: "",
      faqs: "",
    });

    const { data: settingsData, isLoading: settingsLoading } = useQuery({
      queryKey: ["ai-settings", workspace?.id],
      queryFn: () => aiApi.settings(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    const { data: instructionsData, isLoading: instrLoading } = useQuery({
      queryKey: ["ai-instructions", workspace?.id],
      queryFn: () => aiApi.instructions(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    useEffect(() => {
      if (settingsData) setSettings((prev: any) => ({ ...prev, ...settingsData }));
    }, [settingsData]);

    useEffect(() => {
      if (instructionsData) setInstructions((prev: any) => ({ ...prev, ...instructionsData }));
    }, [instructionsData]);

    const saveSettingsMutation = useMutation({
      mutationFn: () => aiApi.updateSettings(workspace!.id, settings),
      onSuccess: () => {
        toast({ type: "success", title: "AI settings saved" });
        queryClient.invalidateQueries({ queryKey: ["ai-settings", workspace?.id] });
      },
      onError: () => toast({ type: "error", title: "Failed to save AI settings" }),
    });

    const saveInstructionsMutation = useMutation({
      mutationFn: () => aiApi.updateInstructions(workspace!.id, instructions),
      onSuccess: () => {
        toast({ type: "success", title: "AI instructions saved" });
        queryClient.invalidateQueries({ queryKey: ["ai-instructions", workspace?.id] });
      },
      onError: () => toast({ type: "error", title: "Failed to save instructions" }),
    });

    const loading = settingsLoading || instrLoading;

    return (
      <div className="space-y-6 max-w-3xl">
        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>Configure how the AI assistant behaves.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ai-mode">AI Mode</Label>
                    <Select id="ai-mode" value={settings.ai_mode} onChange={(e) => setSettings({ ...settings, ai_mode: e.target.value })}>
                      <option value="ai_only">AI Only</option>
                      <option value="human_only">Human Only</option>
                      <option value="hybrid">Hybrid</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ai-provider">Provider</Label>
                    <Select id="ai-provider" value={settings.provider} onChange={(e) => setSettings({ ...settings, provider: e.target.value })}>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="ollama">Ollama</option>
                      <option value="mock">Mock</option>
                      <option value="openrouter">OpenRouter</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-model">Model Name</Label>
                  <Input id="ai-model" value={settings.model_name || ""} onChange={(e) => setSettings({ ...settings, model_name: e.target.value })} placeholder="e.g. gpt-4o, claude-3-sonnet" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-key">API Key</Label>
                  <Input id="ai-key" type="password" value={settings.api_key || ""} onChange={(e) => setSettings({ ...settings, api_key: e.target.value })} placeholder="sk-..." />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-temp">Temperature: {settings.temperature}</Label>
                  </div>
                  <input
                    id="ai-temp"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature ?? 0.7}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-muted-foreground">Lower values are more focused; higher values are more creative.</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending || loading}>
              {saveSettingsMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save AI Settings
            </Button>
          </CardFooter>
        </Card>

        {/* AI Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Instructions
            </CardTitle>
            <CardDescription>Tell the AI about your business so it can respond accurately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="biz-name">Business Name</Label>
                    <Input id="biz-name" value={instructions.business_name || ""} onChange={(e) => setInstructions({ ...instructions, business_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biz-tone">Tone</Label>
                    <Input id="biz-tone" value={instructions.tone || ""} onChange={(e) => setInstructions({ ...instructions, tone: e.target.value })} placeholder="e.g. friendly, professional" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-desc">Business Description</Label>
                  <Textarea id="biz-desc" value={instructions.description || ""} onChange={(e) => setInstructions({ ...instructions, description: e.target.value })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-greeting">Greeting Message</Label>
                  <Textarea id="biz-greeting" value={instructions.greeting || ""} onChange={(e) => setInstructions({ ...instructions, greeting: e.target.value })} rows={2} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-policy">Delivery Policy</Label>
                    <Textarea id="delivery-policy" value={instructions.delivery_policy || ""} onChange={(e) => setInstructions({ ...instructions, delivery_policy: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-policy">Payment Policy</Label>
                    <Textarea id="payment-policy" value={instructions.payment_policy || ""} onChange={(e) => setInstructions({ ...instructions, payment_policy: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-policy">Return Policy</Label>
                    <Textarea id="return-policy" value={instructions.return_policy || ""} onChange={(e) => setInstructions({ ...instructions, return_policy: e.target.value })} rows={3} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faqs">FAQs</Label>
                  <Textarea id="faqs" value={instructions.faqs || ""} onChange={(e) => setInstructions({ ...instructions, faqs: e.target.value })} rows={5} placeholder="Q: ...&#10;A: ..." />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => saveInstructionsMutation.mutate()} disabled={saveInstructionsMutation.isPending || loading}>
              {saveInstructionsMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save Instructions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Billing Tab ───────────────────────────────────────────
  function BillingTab() {
    const { data: plansData, isLoading: plansLoading } = useQuery({
      queryKey: ["billing-plans"],
      queryFn: () => billingApi.plans().then((r) => r.data),
    });

    const { data: subData, isLoading: subLoading } = useQuery({
      queryKey: ["billing-subscription", workspace?.id],
      queryFn: () => billingApi.subscription(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    const { data: usageData, isLoading: usageLoading } = useQuery({
      queryKey: ["billing-usage", workspace?.id],
      queryFn: () => billingApi.usage(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    const subscribeMutation = useMutation({
      mutationFn: (planId: string) => billingApi.subscribe(workspace!.id, planId),
      onSuccess: () => {
        toast({ type: "success", title: "Plan updated", description: "Your subscription has been updated." });
        queryClient.invalidateQueries({ queryKey: ["billing-subscription", workspace?.id] });
      },
      onError: () => toast({ type: "error", title: "Failed to update plan" }),
    });

    const plans: any[] = plansData?.results || plansData || [];
    const currentPlan = subData?.plan?.name || subData?.plan_name;

    const usageStats = [
      { label: "Messages Used", value: usageData?.messages_used, limit: usageData?.message_limit },
      { label: "AI Requests", value: usageData?.ai_requests_used, limit: usageData?.ai_requests_limit },
      { label: "Storage Used", value: usageData?.storage_used, limit: usageData?.storage_limit },
    ];

    return (
      <div className="space-y-6">
        {/* Current plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : subData ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{currentPlan || "Free"}</p>
                  <p className="text-sm text-muted-foreground">
                    {subData.billing_cycle ? `${subData.billing_cycle} billing` : "Active subscription"}
                  </p>
                </div>
                <Badge variant={subData.status === "active" ? "success" : "secondary"}>
                  {subData.status || "active"}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription.</p>
            )}
          </CardContent>
        </Card>

        {/* Plan selection */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Choose a Plan</h3>
          {plansLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <EmptyState icon={CreditCard} title="No plans available" description="Billing plans will appear here once configured." />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {plans.map((plan: any) => {
                const isCurrent = currentPlan === plan.name;
                return (
                  <Card key={plan.id} className={isCurrent ? "border-primary" : ""}>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold">{plan.name}</h4>
                        <p className="text-2xl font-bold">
                          {plan.price ? `$${plan.price}` : "Free"}
                          {plan.price && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm">
                        {(plan.features || []).map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-success" />
                            {f}
                          </li>
                        ))}
                        {(!plan.features || plan.features.length === 0) && (
                          <li className="text-muted-foreground">Standard features included.</li>
                        )}
                      </ul>
                      <Button
                        className="w-full"
                        variant={isCurrent ? "secondary" : "default"}
                        disabled={isCurrent || subscribeMutation.isPending}
                        onClick={() => subscribeMutation.mutate(plan.id)}
                      >
                        {isCurrent ? "Current Plan" : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Usage stats */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Period</CardTitle>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {usageStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium">
                        {stat.value ?? 0} / {stat.limit ?? "∞"}
                      </span>
                    </div>
                    {stat.limit && (
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(((stat.value || 0) / stat.limit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Webchat Tab ───────────────────────────────────────────
  function WebchatTab() {
    const [config, setConfig] = useState<any>({
      title: "",
      greeting: "",
      position: "bottom_right",
      color: "#6366f1",
      is_active: true,
    });

    const { data, isLoading } = useQuery({
      queryKey: ["webchat-config", workspace?.id],
      queryFn: () => webchatApi.config(workspace!.id).then((r) => r.data),
      enabled: !!workspace,
    });

    useEffect(() => {
      if (data) setConfig((prev: any) => ({ ...prev, ...data }));
    }, [data]);

    const saveMutation = useMutation({
      mutationFn: () => webchatApi.updateConfig(workspace!.id, config),
      onSuccess: () => {
        toast({ type: "success", title: "Webchat config saved" });
        queryClient.invalidateQueries({ queryKey: ["webchat-config", workspace?.id] });
      },
      onError: () => toast({ type: "error", title: "Failed to save webchat config" }),
    });

    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Webchat Widget
          </CardTitle>
          <CardDescription>Customize the chat widget on your website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="wc-title">Widget Title</Label>
                <Input id="wc-title" value={config.title || ""} onChange={(e) => setConfig({ ...config, title: e.target.value })} placeholder="Chat with us" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wc-greeting">Greeting Message</Label>
                <Textarea id="wc-greeting" value={config.greeting || ""} onChange={(e) => setConfig({ ...config, greeting: e.target.value })} rows={2} placeholder="Hi! How can we help you today?" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wc-position">Position</Label>
                  <Select id="wc-position" value={config.position} onChange={(e) => setConfig({ ...config, position: e.target.value })}>
                    <option value="bottom_right">Bottom Right</option>
                    <option value="bottom_left">Bottom Left</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wc-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="wc-color"
                      type="color"
                      value={config.color || "#6366f1"}
                      onChange={(e) => setConfig({ ...config, color: e.target.value })}
                      className="h-10 w-14 cursor-pointer rounded-md border border-input"
                    />
                    <Input value={config.color || ""} onChange={(e) => setConfig({ ...config, color: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <Label htmlFor="wc-active">Active</Label>
                  <p className="text-xs text-muted-foreground">Show the widget on your website.</p>
                </div>
                <Switch checked={config.is_active} onChange={(checked) => setConfig({ ...config, is_active: checked })} aria-label="Active" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
            {saveMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            Save Webchat Config
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // ─── Notifications Tab ─────────────────────────────────────
  function NotificationsTab() {
    const { data, isLoading } = useQuery({
      queryKey: ["settings-notifications"],
      queryFn: () => notificationApi.list().then((r) => r.data),
    });

    const notifications: any[] = data?.results || data || [];

    const markReadMutation = useMutation({
      mutationFn: (id: string) => notificationApi.markRead(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings-notifications"] }),
    });

    const markAllMutation = useMutation({
      mutationFn: () => notificationApi.markAllRead(),
      onSuccess: () => {
        toast({ type: "success", title: "All notifications marked as read" });
        queryClient.invalidateQueries({ queryKey: ["settings-notifications"] });
      },
    });

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Recent activity and alerts.</CardDescription>
            </div>
            {notifications.some((n) => !n.is_read) && (
              <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${n.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="default">New</Badge>}
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="text-xs text-muted-foreground">{n.created_at ? timeAgo(n.created_at) : ""}</p>
                  </div>
                  {!n.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n.id)} disabled={markReadMutation.isPending}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
}
