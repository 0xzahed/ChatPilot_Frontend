"use client";

import { useWorkspace } from "@/providers/workspace-context";
import { useToast } from "@/components/ui/toast";
import { useGetPlansQuery, useGetSubscriptionQuery, useGetUsageQuery, useSubscribeMutation } from "@/redux/api/billingApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditCard, Check } from "lucide-react";

export default function BillingPage() {
  const { workspace } = useWorkspace();
  const { toast } = useToast();

  const { data: rawPlansData, isLoading: plansLoading } = useGetPlansQuery();
  const plansData = rawPlansData as any;

  const { data: rawSubData, isLoading: subLoading } = useGetSubscriptionQuery(workspace?.id as string, { skip: !workspace });
  const subData = rawSubData as any;

  const { data: rawUsageData, isLoading: usageLoading } = useGetUsageQuery(workspace?.id as string, { skip: !workspace });
  const usageData = rawUsageData as any;

  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const subscribeMutation = {
    isPending: isSubscribing,
    mutate: (planId: string) => {
      subscribe({ workspaceId: workspace!.id, planId }).unwrap().then(() => {
        toast({ type: "success", title: "Plan updated", description: "Your subscription has been updated." });
      }).catch(() => toast({ type: "error", title: "Failed to update plan" }));
    },
  };

  const plans: any[] = plansData?.results || plansData || [];
  const currentPlan = subData?.plan?.name || subData?.plan_name;

  const usageStats = [
    { label: "Messages Used", value: usageData?.messages_used, limit: usageData?.message_limit },
    { label: "AI Requests", value: usageData?.ai_requests_used, limit: usageData?.ai_requests_limit },
    { label: "Storage Used", value: usageData?.storage_used, limit: usageData?.storage_limit },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and usage.</p>
      </div>

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
