"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Lock,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { zapierApi } from "@/lib/api";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  // Zapier state
  const [zapierStatus, setZapierStatus] = useState<{
    enabled: boolean;
    isConfigured: boolean;
    webhookUrl: string | null;
    hasSecretConfigured: boolean;
    supportedEvents: string[];
  } | null>(null);

  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    zapierApi
      .getStatus()
      .then((res: any) => setZapierStatus(res?.data || res))
      .catch(() => {
        // Fallback status if backend not responding or mock
        setZapierStatus({
          enabled: true,
          isConfigured: false,
          webhookUrl: null,
          hasSecretConfigured: false,
          supportedEvents: [
            "deal.approved",
            "deal.funding.completed",
            "investment.confirmed",
            "payment.failed",
            "harvest.recorded",
            "profit.distributed",
          ],
        });
      });
  }, []);

  const handleTestZapier = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res: any = await zapierApi.sendTestPing(
        testWebhookUrl.trim() ? testWebhookUrl.trim() : undefined,
        "Test webhook from GramBondhon Settings Dashboard"
      );
      const resultObj = res?.result || res?.data?.result;
      if (resultObj?.success) {
        setTestResult({
          success: true,
          message: "Test event successfully received by Zapier webhook!",
        });
      } else {
        setTestResult({
          success: false,
          message: resultObj?.error || "Failed to dispatch test event.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Could not send test ping to backend.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Account & Integrations
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal profile, notification preferences, and third-party automation tools
        </p>
      </div>

      {/* Profile Details */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Profile Details</CardTitle>
              <CardDescription className="text-xs">
                Your registered platform credentials and verification status
              </CardDescription>
            </div>
            <Badge className="bg-primary text-white text-xs">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified ({user?.role ?? "FARMER"})
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name</Label>
              <Input defaultValue={user?.firstName ?? "User"} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input defaultValue={user?.lastName ?? "Account"} className="text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Email Address</Label>
            <Input defaultValue={user?.email ?? "user@grambondhon.bd"} disabled className="text-sm bg-muted/40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">District</Label>
              <Input defaultValue={user?.district ?? "Bogura"} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number</Label>
              <Input defaultValue="+880 1712-345678" className="text-sm" />
            </div>
          </div>

          <div className="pt-2">
            <Button
              className="text-white font-semibold text-xs"
              style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
            >
              Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zapier & Automations Integration Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600" />
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">Zapier & Webhook Automations</CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20">
                    7,000+ Apps
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Connect GramBondhon events to SMS (Twilio), WhatsApp, Google Sheets, QuickBooks, or Slack without writing custom code.
                </CardDescription>
              </div>
            </div>

            <a
              href="https://zapier.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Open Zapier
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Integration Status bar */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Status:</span>
                {zapierStatus?.isConfigured ? (
                  <Badge className="bg-emerald-600 text-white text-[11px] hover:bg-emerald-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Webhook Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px] text-muted-foreground">
                    <AlertCircle className="h-3 w-3 mr-1" /> Not Configured in .env
                  </Badge>
                )}
              </div>

              {zapierStatus?.webhookUrl && (
                <span className="text-xs text-muted-foreground font-mono">
                  Target: {zapierStatus.webhookUrl}
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">How it works:</span> When deals, investments, or harvests are updated, the platform dispatches a real-time JSON webhook with cryptographic verification to your Zapier Catch Hook.
            </div>
          </div>

          {/* Supported Events */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Automated Triggers Emitted
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "deal.approved", desc: "Deal verified & launched" },
                { name: "deal.funding.completed", desc: "100% target funded" },
                { name: "investment.confirmed", desc: "New investment registered" },
                { name: "harvest.recorded", desc: "Harvest logged by farmer" },
                { name: "profit.distributed", desc: "Escrow payout dispatched" },
                { name: "payment.failed", desc: "Failed payment notification" },
              ].map((ev) => (
                <div
                  key={ev.name}
                  className="rounded-md border border-border/60 bg-background/80 px-2.5 py-1 text-xs"
                  title={ev.desc}
                >
                  <span className="font-mono font-medium text-primary">{ev.name}</span>
                  <span className="text-muted-foreground text-[10px] ml-1.5 hidden sm:inline">({ev.desc})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Ping Tool */}
          <div className="border-t border-border/60 pt-4 space-y-3">
            <div>
              <Label className="text-xs font-semibold text-foreground">Test Zapier Catch Hook</Label>
              <p className="text-xs text-muted-foreground">
                Paste your Zapier Webhook URL (from "Catch Hook in Webhooks by Zapier") or leave blank to test the default configured server URL.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="https://hooks.zapier.com/hooks/catch/12345/abcdef/ (Optional)"
                value={testWebhookUrl}
                onChange={(e) => setTestWebhookUrl(e.target.value)}
                className="text-xs font-mono"
              />
              <Button
                onClick={handleTestZapier}
                disabled={isTesting}
                size="sm"
                className="shrink-0 gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Test Event
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                  testResult.success
                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
