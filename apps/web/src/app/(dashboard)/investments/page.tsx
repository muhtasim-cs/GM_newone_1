"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  useBlockchainWallet,
  type Investment,
  type ProfitDistribution,
} from "@/lib/blockchain-hooks";
import { getExplorerUrl } from "@/lib/wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ExternalLink,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  CONFIRMED: { label: "Confirmed", variant: "secondary", icon: <CheckCircle2 className="h-3 w-3" /> },
  COMPLETED: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  REFUNDED: { label: "Refunded", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
};

export default function InvestmentsPage() {
  const { address, isConnected, chainId, shortAddress, formattedBalance } = useBlockchainWallet();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [profitDistributions, setProfitDistributions] = useState<ProfitDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvestments = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const [investmentsRes, profitsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/investments?investorAddress=${address}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/profits?investorAddress=${address}`),
      ]);

      if (investmentsRes.ok) {
        const data = await investmentsRes.json();
        setInvestments(data.investments ?? data ?? []);
      }

      if (profitsRes.ok) {
        const data = await profitsRes.json();
        setProfitDistributions(data.distributions ?? data ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch investments:", error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && address) {
      fetchInvestments();
    }
  }, [isConnected, address, fetchInvestments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInvestments();
    setRefreshing(false);
  };

  const totalInvested = useMemo(
    () => investments.reduce((sum, inv) => sum + BigInt(inv.amount ?? "0"), 0n),
    [investments],
  );

  const totalProfit = useMemo(
    () =>
      profitDistributions.reduce(
        (sum, dist) =>
          sum +
          dist.payments.reduce(
            (pSum, p) => pSum + BigInt(p.amount ?? "0"),
            0n,
          ),
        0n,
      ),
    [profitDistributions],
  );

  const pendingInvestments = useMemo(
    () => investments.filter((inv) => inv.status === "PENDING").length,
    [investments],
  );

  const confirmedInvestments = useMemo(
    () => investments.filter((inv) => inv.status === "CONFIRMED" || inv.status === "COMPLETED").length,
    [investments],
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Wallet className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="mt-2 text-muted-foreground">
            Connect your wallet to view your investments and profit distributions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Investments</h1>
          <p className="text-muted-foreground">
            Wallet: {shortAddress} &middot; Balance: {parseFloat(formattedBalance).toFixed(4)} ETH
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEther(totalInvested)} ETH</div>
            <p className="text-xs text-muted-foreground">
              Across {investments.length} investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit Earned</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatEther(totalProfit)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              From profit distributions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvestments}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedInvestments}</div>
            <p className="text-xs text-muted-foreground">On-chain verified</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="investments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="profits">Profit Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="investments" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : investments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No investments yet</p>
                <p className="text-sm text-muted-foreground">
                  Browse available deals to start investing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {investments.map((investment) => {
                const statusConfig = STATUS_CONFIG[investment.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <Card key={investment.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {investment.units} units
                            </p>
                            <Badge variant={statusConfig.variant}>
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatEther(BigInt(investment.amount ?? "0"))} ETH
                            {investment.deal && (
                              <span className="ml-2">
                                &middot; Deal #{investment.dealId.slice(0, 10)}...
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(investment.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {investment.blockchainTxHash && chainId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={getExplorerUrl(chainId, investment.blockchainTxHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {investment.profitPaid && (
                          <Badge variant="default" className="bg-emerald-600">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            Profit Paid
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profits" className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : profitDistributions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No profit distributions yet</p>
                <p className="text-sm text-muted-foreground">
                  Profit distributions will appear here once declared.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {profitDistributions.map((dist) => (
                <Card key={dist.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            Profit Distribution
                          </p>
                          <Badge
                            variant={
                              dist.status === "DISTRIBUTED"
                                ? "default"
                                : dist.status === "DECLARED"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {dist.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatEther(BigInt(dist.totalAmount ?? "0"))} ETH
                          &middot; Your share: {formatEther(BigInt(dist.investorShare ?? "0"))} ETH
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(dist.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {dist.payments
                        .filter(
                          (p) =>
                            p.investorAddress?.toLowerCase() ===
                            address?.toLowerCase(),
                        )
                        .map((payment) => (
                          <div key={payment.id} className="text-right">
                            <p className="text-lg font-bold text-emerald-600">
                              +{formatEther(BigInt(payment.amount ?? "0"))} ETH
                            </p>
                            {payment.txHash && chainId && (
                              <a
                                href={getExplorerUrl(chainId, payment.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View on Explorer
                                <ExternalLink className="ml-1 inline h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
