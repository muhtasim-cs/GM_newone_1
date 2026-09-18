"use client";

import { ScrollText, ShieldCheck, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_AUDIT_LOGS = [
  {
    id: "aud-1",
    action: "FARMER_VERIFICATION",
    actor: "Admin (Mohammad Islam)",
    target: "Golam Mostafa (Padma Fishery)",
    detail: "Land deed and National ID verified with Bangladesh Land Ministry portal.",
    timestamp: "Today at 10:45 AM",
    status: "APPROVED",
  },
  {
    id: "aud-2",
    action: "DEAL_SHARIAH_APPROVAL",
    actor: "Shariah Board (Dr. M. Harun)",
    target: "Boro Rice Cycle 1",
    detail: "Mudarabah contract clauses vetted for zero interest (Riba) and clear risk sharing.",
    timestamp: "Yesterday at 04:20 PM",
    status: "APPROVED",
  },
  {
    id: "aud-3",
    action: "PAYOUT_DISBURSEMENT",
    actor: "Automated Treasury",
    target: "18 Boro Rice Investors",
    detail: "৳14,200 batch profit distribution executed via bKash Enterprise API.",
    timestamp: "Mar 12, 2026",
    status: "SUCCESS",
  },
];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Platform Security & Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed immutable event logs for administrative actions, farmer vetting, and financial compliance
        </p>
      </div>

      {/* Logs Card */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <CardTitle className="text-base font-bold">Activity Log</CardTitle>
          <CardDescription className="text-xs">
            Tamper-evident system activity trail
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 text-xs">
            {MOCK_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="p-4 hover:bg-muted/20 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{log.action}</span>
                  <span className="text-muted-foreground">{log.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span>{log.actor} &rarr; {log.target}</span>
                </div>
                <p className="text-muted-foreground">{log.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
