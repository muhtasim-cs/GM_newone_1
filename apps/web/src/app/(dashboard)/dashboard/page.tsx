"use client";

import Link from "next/link";
import { PlusCircle, Handshake, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "./_hooks/useDashboardData";
import { StatsRow } from "./_components/StatsRow";
import { RevenueChart } from "./_components/RevenueChart";
import { InvestmentBreakdownChart } from "./_components/InvestmentBreakdownChart";
import { ActivityFeed } from "./_components/ActivityFeed";
import { QuickActionsCard } from "./_components/QuickActionsCard";
import { DashboardSkeleton } from "./_components/DashboardSkeleton";

export default function DashboardPage() {
  const {
    user,
    role,
    isFarmer,
    isInvestor,
    data,
    isLoading,
    isError,
    overviewData,
    statCards,
    revenueData,
    breakdown,
  } = useDashboardData();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {(isError || !data) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>
              API server is offline. Displaying preview data for <strong>{role}</strong> workspace.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your {role.toLowerCase()} workspace today.
          </p>
        </div>
        <div className="flex gap-2">
          {isFarmer && (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <PlusCircle className="mr-1 h-4 w-4" /> New Project
              </Link>
            </Button>
          )}
          {isInvestor && (
            <Button asChild>
              <Link href="/dashboard/deals">
                <Handshake className="mr-1 h-4 w-4" /> Browse Deals
              </Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/documents">
              <FileText className="mr-1 h-4 w-4" /> Documents
            </Link>
          </Button>
        </div>
      </div>

      <StatsRow cards={statCards} />

      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart data={revenueData} />
        <InvestmentBreakdownChart data={breakdown} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityFeed items={overviewData.recentActivity} />
        <QuickActionsCard role={role} />
      </div>
    </div>
  );
}