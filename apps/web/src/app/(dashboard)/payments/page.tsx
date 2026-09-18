"use client";

import { useState } from "react";
import { CreditCard, ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, Download, PlusCircle, Smartphone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PaymentGatewayModal, PaymentSuccessData } from "@/components/payments/payment-gateway-modal";

const MOCK_PAYMENTS = [
  {
    id: "pay-101",
    type: "DISTRIBUTION",
    title: "Profit Payout: Boro Rice Harvest #1",
    deal: "Boro Rice Cultivation",
    amount: 14200,
    method: "bKash Direct",
    date: "Mar 12, 2026",
    status: "COMPLETED",
    ref: "TRX-BK892301",
  },
  {
    id: "pay-102",
    type: "INVESTMENT",
    title: "Capital Commitment: Hilsa Aqua Farm",
    deal: "Hilsa Fish Farming",
    amount: 50000,
    method: "Bank Transfer (Islami Bank)",
    date: "Feb 28, 2026",
    status: "COMPLETED",
    ref: "IBBL-9921448",
  },
  {
    id: "pay-103",
    type: "DISTRIBUTION",
    title: "Interim Dividend: Goat Farm Cohort",
    deal: "Black Bengal Goat",
    amount: 6800,
    method: "Nagad Wallet",
    date: "Feb 15, 2026",
    status: "COMPLETED",
    ref: "NGD-4412093",
  },
  {
    id: "pay-104",
    type: "INVESTMENT",
    title: "Capital Commitment: Boro Cycle",
    deal: "Boro Rice Cultivation",
    amount: 35000,
    method: "bKash Direct",
    date: "Jan 10, 2026",
    status: "COMPLETED",
    ref: "TRX-BK771029",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const totalCommitted = payments
    .filter((p) => p.type === "INVESTMENT")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalProfit = payments
    .filter((p) => p.type === "DISTRIBUTION")
    .reduce((sum, p) => sum + p.amount, 0);

  const handlePaymentSuccess = (newPayment: PaymentSuccessData) => {
    setPayments((prev) => [newPayment, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Payments & Distributions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete transaction ledger of capital commitments and halal dividend payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsGatewayOpen(true)}
            className="text-white font-bold text-xs shadow-md gap-1.5"
            style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
          >
            <PlusCircle className="h-4 w-4" /> Deposit / Pay with MFS
          </Button>
          <Button variant="outline" className="text-xs font-semibold">
            <Download className="mr-2 h-4 w-4" /> Download Statement
          </Button>
        </div>
      </div>

      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Capital Committed</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">{formatCurrency(totalCommitted)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across active farming deals</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Profit Received</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">{formatCurrency(totalProfit)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">24.7% blended realized return</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending Distributions</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">৳0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All payouts settled up to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <CardTitle className="text-base font-bold">Transaction History</CardTitle>
          <CardDescription className="text-xs">
            Showing all {payments.length} settled transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Deal / Project</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${p.type === "DISTRIBUTION" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                          {p.type === "DISTRIBUTION" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground block">{p.title}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{p.ref}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{p.deal}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{p.method}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{p.date}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <span className={p.type === "DISTRIBUTION" ? "text-emerald-600" : "text-foreground"}>
                        {p.type === "DISTRIBUTION" ? "+" : "-"}{formatCurrency(p.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Settled
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
