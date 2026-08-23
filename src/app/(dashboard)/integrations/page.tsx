"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetIntegrationsQuery,
  useConnectIntegrationMutation,
  useCompleteIntegrationMutation,
  useDisconnectIntegrationMutation,
  useSyncIntegrationMutation,
  useSetupWhatsAppMutation,
  useGetWebhookEventsQuery,
} from "@/redux/api/integrationApi";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import {
  MessageCircle, Globe, RefreshCw, Plug, Webhook,
} from "lucide-react";

// ─── Brand icons (not available in this lucide version) ───────
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

type IntegrationDef = {
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const INTEGRATIONS: IntegrationDef[] = [
  {
    type: "facebook",
    name: "Facebook",
    description: "Connect your Facebook Page to receive and reply to Messenger messages.",
    icon: FacebookIcon,
    color: "text-[#1877f2]",
  },
  {
    type: "instagram",
    name: "Instagram",
    description: "Link your Instagram Business account to manage DMs and comments.",
    icon: InstagramIcon,
    color: "text-[#e1306c]",
  },
  {
    type: "whatsapp",
    name: "WhatsApp",
    description: "Integrate WhatsApp Business API for customer conversations.",
    icon: MessageCircle,
    color: "text-[#25d366]",
  },
  {
    type: "website",
    name: "Website",
    description: "Add a webchat widget to your website to chat with visitors.",
    icon: Globe,
    color: "text-[#6366f1]",
  },
];

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Spinner className="h-6 w-6" /></div>}>
      <IntegrationsContent />
    </Suspense>
  );
}

function IntegrationsContent() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { data: rawData, isLoading } = useGetIntegrationsQuery(undefined, { skip: !workspace });
  const data = rawData as any;
  const { data: rawWebhookData, isLoading: webhooksLoading } = useGetWebhookEventsQuery(undefined, { skip: !workspace });
  const webhookData = rawWebhookData as any;

  const integrations: any[] = data?.results || data || [];
  const webhookEvents: any[] = webhookData?.results || webhookData || [];

  const findByType = (type: string) =>
    integrations.find((i) => i.integration_type === type);

  const [connectIntegration, { isLoading: isConnecting }] = useConnectIntegrationMutation();
  const [completeIntegration] = useCompleteIntegrationMutation();
  const [setupWhatsApp, { isLoading: isSettingUpWhatsApp }] = useSetupWhatsAppMutation();
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappForm, setWhatsappForm] = useState({ accessToken: "", phoneNumberId: "" });

  const connectMutation = {
    isPending: isConnecting,
    variables: undefined as string | undefined,
    mutate: (type: string) => {
      connectMutation.variables = type;
      connectIntegration({ type, workspaceId: workspace!.id }).unwrap().then((res) => {
        if (res?.requires_manual_setup) {
          // WhatsApp — open manual setup modal
          setWhatsappModalOpen(true);
        } else if (res?.auth_url) {
          window.location.href = res.auth_url;
        } else {
          toast({ type: "success", title: "Integration connected", description: "Your channel is now connected." });
        }
      }).catch((err: any) => {
        toast({
          type: "error",
          title: "Connection failed",
          description: err?.data?.error || err?.response?.data?.error || "Could not connect the integration. Please try again.",
        });
      });
    },
  };

  const handleWhatsAppSubmit = () => {
    if (!whatsappForm.accessToken || !whatsappForm.phoneNumberId) {
      toast({ type: "error", title: "Missing fields", description: "Please fill in all fields." });
      return;
    }
    setupWhatsApp({
      workspaceId: workspace!.id,
      accessToken: whatsappForm.accessToken,
      phoneNumberId: whatsappForm.phoneNumberId,
    }).unwrap().then(() => {
      toast({ type: "success", title: "WhatsApp connected", description: "Your WhatsApp Business account is now connected." });
      setWhatsappModalOpen(false);
      setWhatsappForm({ accessToken: "", phoneNumberId: "" });
    }).catch((err: any) => {
      toast({
        type: "error",
        title: "Setup failed",
        description: err?.data?.error || "Could not connect WhatsApp. Check your credentials.",
      });
    });
  };

  const [disconnectIntegration, { isLoading: isDisconnecting }] = useDisconnectIntegrationMutation();
  const disconnectMutation = {
    isPending: isDisconnecting,
    mutate: (id: string) => {
      disconnectIntegration(id).unwrap().then(() => {
        toast({ type: "success", title: "Disconnected", description: "The integration has been disconnected." });
      }).catch(() => {
        toast({ type: "error", title: "Disconnect failed", description: "Could not disconnect the integration." });
      });
    },
  };

  const [syncIntegration] = useSyncIntegrationMutation();
  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncIntegration(id).unwrap();
      toast({ type: "success", title: "Sync started", description: "Your data is being synced." });
    } catch {
      toast({ type: "error", title: "Sync failed", description: "Could not start syncing." });
    } finally {
      setSyncingId(null);
    }
  };

  // Handle OAuth callback redirect from backend
  useEffect(() => {
    const callbackType = searchParams.get("callback");
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      toast({ type: "error", title: "Connection failed", description: error });
      router.replace("/integrations");
      return;
    }

    if (callbackType && code && state) {
      completeIntegration({ type: callbackType, code, state })
        .unwrap()
        .then(() => {
          toast({ type: "success", title: "Integration connected", description: "Your channel is now connected." });
          router.replace("/integrations");
        })
        .catch((err: any) => {
          toast({
            type: "error",
            title: "Connection failed",
            description: err?.data?.error || "Could not complete the connection.",
          });
          router.replace("/integrations");
        });
    }
  }, [searchParams, toast, router, completeIntegration]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect your channels and manage webhook events.
        </p>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          : INTEGRATIONS.map((def) => {
              const existing = findByType(def.type);
              const connected = existing?.status === "connected" || existing?.is_active;
              const Icon = def.icon;
              return (
                <Card key={def.type}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${def.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant={connected ? "success" : "secondary"}>
                        {connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold">{def.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{def.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {connected ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(existing.id)}
                            disabled={syncingId === existing.id}
                          >
                            {syncingId === existing.id ? (
                              <Spinner size="sm" className="h-4 w-4" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                            Sync
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => disconnectMutation.mutate(existing.id)}
                            disabled={disconnectMutation.isPending}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => connectMutation.mutate(def.type)}
                          disabled={connectMutation.isPending}
                        >
                          {connectMutation.isPending && connectMutation.variables === def.type ? (
                            <Spinner size="sm" className="h-4 w-4" />
                          ) : (
                            <Plug className="h-4 w-4" />
                          )}
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* WhatsApp setup modal */}
      <Dialog
        open={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        title="Connect WhatsApp Business"
        description="Enter your WhatsApp Cloud API credentials from Meta Business Manager."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wa-token">Access Token</Label>
            <Input
              id="wa-token"
              type="password"
              value={whatsappForm.accessToken}
              onChange={(e) => setWhatsappForm({ ...whatsappForm, accessToken: e.target.value })}
              placeholder="EAAG..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa-phone">Phone Number ID</Label>
            <Input
              id="wa-phone"
              value={whatsappForm.phoneNumberId}
              onChange={(e) => setWhatsappForm({ ...whatsappForm, phoneNumberId: e.target.value })}
              placeholder="123456789012"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Get these from Meta Business Manager → WhatsApp → API Setup.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWhatsappModalOpen(false)}>Cancel</Button>
            <Button onClick={handleWhatsAppSubmit} disabled={isSettingUpWhatsApp}>
              {isSettingUpWhatsApp ? <Spinner size="sm" className="h-4 w-4" /> : "Connect"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Webhook events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Recent Webhook Events
          </CardTitle>
          <CardDescription>Latest events received from your connected channels.</CardDescription>
        </CardHeader>
        <CardContent>
          {webhooksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : webhookEvents.length === 0 ? (
            <EmptyState
              icon={Webhook}
              title="No webhook events yet"
              description="Webhook events from your connected integrations will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents.map((event: any) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium capitalize">{event.source || event.integration_type || "—"}</TableCell>
                    <TableCell className="capitalize">{event.event_type || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={event.status === "success" ? "success" : event.status === "failed" ? "destructive" : "secondary"}>
                        {event.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.created_at ? formatDateTime(event.created_at) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
