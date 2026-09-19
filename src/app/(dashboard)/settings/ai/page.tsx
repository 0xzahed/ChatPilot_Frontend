"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import {
  useGetAISettingsQuery,
  useUpdateAISettingsMutation,
  useGetAIInstructionsQuery,
  useUpdateAIInstructionsMutation,
  useTestAIMutation,
} from "@/redux/api/aiApi";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import {
  Bot, MessageSquare, Save, Sparkles, Shield, Zap, Eye, Languages,
  AlertTriangle, UserCheck, Thermometer, Cpu, KeyRound, Building2,
  Clock, FileText, HelpCircle, Send, RefreshCw,
} from "lucide-react";

const TABS = [
  { id: "config", label: "Configuration" },
  { id: "instructions", label: "Business Instructions" },
  { id: "features", label: "AI Features" },
  { id: "test", label: "Test & Preview" },
];

const PROVIDERS = [
  { value: "openai", label: "OpenCode Zen (Free)", models: [
    "mimo-v2.5-free", "big-pickle", "hy3-free", "nemotron-3-ultra-free", "custom",
  ]},
  { value: "anthropic", label: "Anthropic (Claude)", models: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"] },
  { value: "openrouter", label: "OpenRouter", models: ["auto", "openai/gpt-4o", "anthropic/claude-3.5-sonnet"] },
  { value: "ollama", label: "Ollama (Local)", models: ["llama3", "mistral", "qwen2.5", "phi3"] },
  { value: "mock", label: "Mock (Testing)", models: ["mock-gpt"] },
];

const MODES = [
  { value: "off", label: "Off", description: "AI is disabled. All messages handled by humans." },
  { value: "suggest_only", label: "Suggest Only", description: "AI suggests replies; agents send them." },
  { value: "auto_reply", label: "Auto Reply", description: "AI replies automatically to all messages." },
  { value: "hybrid", label: "Hybrid", description: "AI handles simple queries; complex ones go to humans." },
];

export default function AISettingsPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bot className="h-7 w-7 text-primary" />
            AI Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI assistant to automate customer conversations.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by ChatPilot AI
        </Badge>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "config" && <ConfigTab />}
      {activeTab === "instructions" && <InstructionsTab />}
      {activeTab === "features" && <FeaturesTab />}
      {activeTab === "test" && <TestTab />}
    </div>
  );

  // ─── Configuration Tab ──────────────────────────────────────
  function ConfigTab() {
    const [settings, setSettings] = useState<any>({
      mode: "suggest_only",
      provider: "mock",
      model_name: "gpt-4o-mini",
      base_url: "",
      temperature: 0.7,
      max_tokens: 2048,
      confidence_threshold: 0.7,
    });
    const [apiKey, setApiKey] = useState("");

    const { data: rawData, isLoading } = useGetAISettingsQuery(workspace?.id || "", { skip: !workspace });
    const data = rawData as any;

    useEffect(() => {
      if (data) {
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    }, [data]);

    const [updateAISettings, { isLoading: isSaving }] = useUpdateAISettingsMutation();
    const saveMutation = {
      isPending: isSaving,
      mutate: () => {
        updateAISettings({
          workspaceId: workspace!.id,
          data: { ...settings, api_key: apiKey || undefined },
        }).unwrap().then(() => {
          toast({ type: "success", title: "AI configuration saved", description: "Your AI assistant settings have been updated." });
          setApiKey("");
        }).catch(() => toast({ type: "error", title: "Save failed", description: "Could not update AI settings." }));
      },
    };

    const selectedProvider = PROVIDERS.find((p) => p.value === settings.provider);

    return (
      <div className="space-y-6 max-w-3xl">
        {/* AI Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              AI Mode
            </CardTitle>
            <CardDescription>Choose how the AI assistant interacts with customers.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSettings({ ...settings, mode: mode.value })}
                    className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50 ${
                      settings.mode === mode.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold">{mode.label}</span>
                      {settings.mode === mode.value && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-primary-foreground">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{mode.description}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider & Model */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              Model Provider
            </CardTitle>
            <CardDescription>Select the AI provider and model for generating responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="flex items-center gap-1.5">
                      <Cpu className="h-4 w-4" />
                      Provider
                    </Label>
                    <Select
                      id="provider"
                      value={settings.provider}
                      onChange={(e) => {
                        const provider = e.target.value;
                        const defaultModel = PROVIDERS.find((p) => p.value === provider)?.models[0] || "";
                        setSettings({ ...settings, provider, model_name: defaultModel });
                      }}
                    >
                      {PROVIDERS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    {selectedProvider && selectedProvider.models.length > 1 && settings.model_name !== "custom" ? (
                      <>
                        <Select
                          id="model"
                          value={settings.model_name}
                          onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                        >
                          {selectedProvider.models.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </Select>
                        {settings.model_name && !selectedProvider.models.includes(settings.model_name) && (
                          <p className="text-xs text-muted-foreground">
                            Current: <code className="rounded bg-muted px-1">{settings.model_name}</code>
                          </p>
                        )}
                      </>
                    ) : (
                      <Input
                        id="model"
                        value={settings.model_name || ""}
                        onChange={(e) => setSettings({ ...settings, model_name: e.target.value })}
                        placeholder="e.g. gpt-4o-mini, deepseek-v3"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key" className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4" />
                    API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API key (stored encrypted)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your key is encrypted at rest. Leave blank to keep the existing key.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base-url">Custom Base URL (optional)</Label>
                  <Input
                    id="base-url"
                    value={settings.base_url || ""}
                    onChange={(e) => setSettings({ ...settings, base_url: e.target.value })}
                    placeholder="https://opencode.ai/zen/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    OpenCode: <code className="rounded bg-muted px-1">https://opencode.ai/zen/v1</code> · Leave blank to use server default.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Generation Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-primary" />
              Generation Parameters
            </CardTitle>
            <CardDescription>Fine-tune how the AI generates responses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4" />
                      Temperature
                    </Label>
                    <Badge variant="secondary">{settings.temperature?.toFixed(1)}</Badge>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature ?? 0.7}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Precise (0)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative (2)</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Max Tokens</Label>
                    <Badge variant="secondary">{settings.max_tokens}</Badge>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={settings.max_tokens ?? 2048}
                    onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-muted-foreground">Maximum length of AI-generated responses.</p>
                </div>

                {/* Confidence Threshold */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Confidence Threshold</Label>
                    <Badge variant="secondary">{(settings.confidence_threshold ?? 0.7).toFixed(2)}</Badge>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.05"
                    value={settings.confidence_threshold ?? 0.7}
                    onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum AI confidence to auto-reply. Below this, the message is routed to a human agent.
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
              {saveMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Business Instructions Tab ──────────────────────────────
  function InstructionsTab() {
    const [instructions, setInstructions] = useState<any>({
      business_name: "",
      business_description: "",
      tone: "polite, professional",
      language: "en",
      greeting: "",
      delivery_policy: "",
      payment_policy: "",
      return_policy: "",
      refund_policy: "",
      cancellation_policy: "",
      sales_strategy: "",
      custom_instructions: "",
    });
    const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

    const { data: rawData, isLoading } = useGetAIInstructionsQuery(workspace?.id || "", { skip: !workspace });
    const data = rawData as any;

    useEffect(() => {
      if (data) {
        setInstructions((prev: any) => ({ ...prev, ...data }));
        if (Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
      }
    }, [data]);

    const [updateAIInstructions, { isLoading: isSaving }] = useUpdateAIInstructionsMutation();
    const saveMutation = {
      isPending: isSaving,
      mutate: () => {
        updateAIInstructions({
          workspaceId: workspace!.id,
          data: { ...instructions, faqs },
        }).unwrap().then(() => {
          toast({ type: "success", title: "Instructions saved", description: "AI business instructions updated." });
        }).catch(() => toast({ type: "error", title: "Save failed", description: "Could not save instructions." }));
      },
    };

    const addFaq = () => {
      if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
      setFaqs([...faqs, { ...newFaq }]);
      setNewFaq({ question: "", answer: "" });
    };

    const removeFaq = (index: number) => {
      setFaqs(faqs.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-6 max-w-3xl">
        {/* Business Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Business Identity
            </CardTitle>
            <CardDescription>Tell the AI about your business so it can represent you accurately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="biz-name">Business Name</Label>
                    <Input
                      id="biz-name"
                      value={instructions.business_name || ""}
                      onChange={(e) => setInstructions({ ...instructions, business_name: e.target.value })}
                      placeholder="e.g. Acme Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="biz-language">Response Language</Label>
                    <Select
                      id="biz-language"
                      value={instructions.language || "en"}
                      onChange={(e) => setInstructions({ ...instructions, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="bn">Bengali (বাংলা)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="es">Spanish (Español)</option>
                      <option value="fr">French (Français)</option>
                      <option value="ar">Arabic (العربية)</option>
                      <option value="ur">Urdu (اردو)</option>
                      <option value="auto">Auto-detect</option>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-desc">Business Description</Label>
                  <Textarea
                    id="biz-desc"
                    value={instructions.business_description || ""}
                    onChange={(e) => setInstructions({ ...instructions, business_description: e.target.value })}
                    rows={3}
                    placeholder="What does your business do? What products/services do you offer?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-tone">Tone of Voice</Label>
                  <Input
                    id="biz-tone"
                    value={instructions.tone || ""}
                    onChange={(e) => setInstructions({ ...instructions, tone: e.target.value })}
                    placeholder="e.g. friendly, professional, casual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-greeting">Greeting Message</Label>
                  <Textarea
                    id="biz-greeting"
                    value={instructions.greeting || ""}
                    onChange={(e) => setInstructions({ ...instructions, greeting: e.target.value })}
                    rows={2}
                    placeholder="Hi! Welcome to Acme Store. How can I help you today?"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Policies
            </CardTitle>
            <CardDescription>Provide your business policies so the AI can answer policy questions accurately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery-policy">Delivery Policy</Label>
                  <Textarea
                    id="delivery-policy"
                    value={instructions.delivery_policy || ""}
                    onChange={(e) => setInstructions({ ...instructions, delivery_policy: e.target.value })}
                    rows={3}
                    placeholder="Delivery timeframes, areas covered, charges..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-policy">Payment Policy</Label>
                  <Textarea
                    id="payment-policy"
                    value={instructions.payment_policy || ""}
                    onChange={(e) => setInstructions({ ...instructions, payment_policy: e.target.value })}
                    rows={3}
                    placeholder="Accepted payment methods, installment options..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-policy">Return Policy</Label>
                  <Textarea
                    id="return-policy"
                    value={instructions.return_policy || ""}
                    onChange={(e) => setInstructions({ ...instructions, return_policy: e.target.value })}
                    rows={3}
                    placeholder="Return window, conditions, process..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refund-policy">Refund Policy</Label>
                  <Textarea
                    id="refund-policy"
                    value={instructions.refund_policy || ""}
                    onChange={(e) => setInstructions({ ...instructions, refund_policy: e.target.value })}
                    rows={3}
                    placeholder="Refund timeline, conditions..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                  <Textarea
                    id="cancellation-policy"
                    value={instructions.cancellation_policy || ""}
                    onChange={(e) => setInstructions({ ...instructions, cancellation_policy: e.target.value })}
                    rows={3}
                    placeholder="Order cancellation rules..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sales-strategy">Sales Strategy</Label>
                  <Textarea
                    id="sales-strategy"
                    value={instructions.sales_strategy || ""}
                    onChange={(e) => setInstructions({ ...instructions, sales_strategy: e.target.value })}
                    rows={3}
                    placeholder="Upselling, cross-selling, discount offers..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>Add common Q&A pairs the AI should know about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <>
                {faqs.length > 0 && (
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="rounded-lg border border-border p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">Q: {faq.question}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFaq(i)}
                          >
                            ×
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="rounded-lg border-2 border-dashed border-border p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="faq-q">New Question</Label>
                    <Input
                      id="faq-q"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      placeholder="What are your business hours?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faq-a">Answer</Label>
                    <Textarea
                      id="faq-a"
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      rows={2}
                      placeholder="We're open Saturday to Thursday, 10 AM to 8 PM."
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={addFaq}>
                    + Add FAQ
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Custom Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Custom Instructions
            </CardTitle>
            <CardDescription>Any additional instructions for the AI assistant.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Textarea
                value={instructions.custom_instructions || ""}
                onChange={(e) => setInstructions({ ...instructions, custom_instructions: e.target.value })}
                rows={5}
                placeholder="Add any special instructions, rules, or context for the AI..."
              />
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
              {saveMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save Instructions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── AI Features Tab ────────────────────────────────────────
  function FeaturesTab() {
    const [settings, setSettings] = useState<any>({
      enable_vision: true,
      enable_complaint_detection: true,
      enable_language_detection: true,
      enable_human_handoff: true,
      safety_rules: [],
    });
    const [newRule, setNewRule] = useState("");

    const { data: rawData, isLoading } = useGetAISettingsQuery(workspace?.id || "", { skip: !workspace });
    const data = rawData as any;

    useEffect(() => {
      if (data) {
        setSettings((prev: any) => ({ ...prev, ...data }));
      }
    }, [data]);

    const [updateAISettings, { isLoading: isSaving }] = useUpdateAISettingsMutation();
    const saveMutation = {
      isPending: isSaving,
      mutate: () => {
        updateAISettings({
          workspaceId: workspace!.id,
          data: settings,
        }).unwrap().then(() => {
          toast({ type: "success", title: "Features saved", description: "AI feature toggles updated." });
        }).catch(() => toast({ type: "error", title: "Save failed", description: "Could not update features." }));
      },
    };

    const features = [
      {
        key: "enable_vision",
        icon: Eye,
        title: "Image Understanding (Vision)",
        description: "Allow AI to analyze images sent by customers (products, screenshots, receipts).",
      },
      {
        key: "enable_complaint_detection",
        icon: AlertTriangle,
        title: "Complaint Detection",
        description: "Automatically detect complaints and flag them for priority handling.",
      },
      {
        key: "enable_language_detection",
        icon: Languages,
        title: "Language Detection",
        description: "Detect customer language and respond in the same language.",
      },
      {
        key: "enable_human_handoff",
        icon: UserCheck,
        title: "Human Handoff",
        description: "Automatically route complex or sensitive conversations to human agents.",
      },
    ];

    const addRule = () => {
      if (!newRule.trim()) return;
      const rules = Array.isArray(settings.safety_rules) ? settings.safety_rules : [];
      setSettings({ ...settings, safety_rules: [...rules, newRule.trim()] });
      setNewRule("");
    };

    const removeRule = (index: number) => {
      const rules = Array.isArray(settings.safety_rules) ? settings.safety_rules : [];
      setSettings({ ...settings, safety_rules: rules.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="space-y-6 max-w-3xl">
        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Capabilities
            </CardTitle>
            <CardDescription>Enable or disable individual AI features.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.key}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={!!settings[feature.key]}
                      onChange={(checked) => setSettings({ ...settings, [feature.key]: checked })}
                    />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Safety Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Safety Rules
            </CardTitle>
            <CardDescription>Rules the AI must always follow. Violations trigger human handoff.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                {Array.isArray(settings.safety_rules) && settings.safety_rules.length > 0 && (
                  <div className="space-y-2">
                    {settings.safety_rules.map((rule: string, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                        <span className="text-sm">{rule}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRule(i)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                    placeholder="e.g. Never share pricing below cost"
                  />
                  <Button variant="outline" onClick={addRule}>+ Add</Button>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || isLoading}>
              {saveMutation.isPending ? <Spinner size="sm" className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              Save Features
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ─── Test & Preview Tab ─────────────────────────────────────
  function TestTab() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");
    const [meta, setMeta] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    const [testAI] = useTestAIMutation();

    const handleTest = async () => {
      if (!message.trim()) return;
      setTesting(true);
      setResponse("");
      setMeta(null);
      try {
        const data = await testAI({ workspaceId: workspace!.id, message }).unwrap();
        setResponse(data?.response || data?.suggestion || "No response received.");
        setMeta(data);
      } catch (err: any) {
        setResponse(`Error: ${err?.data?.error || err?.message || "Test failed."}`);
        setMeta({ error: true });
      } finally {
        setTesting(false);
      }
    };

    const sampleMessages = [
      "What are your business hours?",
      "Do you offer home delivery?",
      "I want to return a product, what's your policy?",
      "Can I get a discount on bulk orders?",
      "আপনাদের দোকানের নাম কি?",
    ];

    return (
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Test AI Assistant
            </CardTitle>
            <CardDescription>
              Send a test message to see how your AI assistant would respond with current settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sample messages */}
            <div className="flex flex-wrap gap-2">
              {sampleMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(msg)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Type a customer message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleTest();
                  }
                }}
              />
            </div>
            <Button onClick={handleTest} disabled={testing || !message.trim()}>
              {testing ? <Spinner size="sm" className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              Test Response
            </Button>

            {/* Response */}
            {response && (
              <div className={`rounded-lg border p-4 ${meta?.error ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className={`h-4 w-4 ${meta?.error ? "text-destructive" : "text-primary"}`} />
                    <span className="text-sm font-medium">
                      {meta?.error ? "AI Error" : "AI Response"}
                    </span>
                  </div>
                  {meta && !meta.error && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {meta.model && <Badge variant="secondary">{meta.model}</Badge>}
                      {meta.tokens_input != null && meta.tokens_output != null && (
                        <span>{meta.tokens_input} in / {meta.tokens_output} out</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{response}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Tips for better AI responses</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Fill out Business Instructions for more accurate responses</li>
                  <li>Add FAQs for common customer questions</li>
                  <li>Set appropriate safety rules to prevent unwanted responses</li>
                  <li>Use Hybrid mode for best balance of automation and human oversight</li>
                  <li>Adjust confidence threshold to control auto-reply aggressiveness</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
