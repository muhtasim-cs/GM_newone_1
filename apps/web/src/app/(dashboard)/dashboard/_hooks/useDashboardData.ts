"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sprout,
  Wallet as WalletIcon,
  TrendingUp,
  Handshake,
  FolderKanban,
  Bell,
} from "lucide-react";
import { dashboardApi, MOCK_DASHBOARD_DATA } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { formatDate } from "@/lib/utils";
import type { Role, RevenuePoint, ActivityItem } from "@/types";

export interface PlaceholderSlice {
  name: string;
  value: number;
}

export interface StatCardItem {
  label: string;
  value: number | string;
  icon: any;
  suffix?: string;
}

export const CHART_COLORS = ["#166534", "#22c55e", "#65a30d", "#a3e635", "#84cc16", "#4d7c0f"];

export const placeholderRevenue = [
  { date: "Jan", amount: 12500 },
  { date: "Feb", amount: 15200 },
  { date: "Mar", amount: 14800 },
  { date: "Apr", amount: 18400 },
  { date: "May", amount: 17300 },
  { date: "Jun", amount: 21500 },
  { date: "Jul", amount: 23900 },
  { date: "Aug", amount: 22600 },
  { date: "Sep", amount: 26400 },
  { date: "Oct", amount: 28500 },
  { date: "Nov", amount: 31200 },
  { date: "Dec", amount: 35100 },
];

export const placeholderBreakdown: PlaceholderSlice[] = [
  { name: "Crops", value: 42000 },
  { name: "Livestock", value: 27000 },
  { name: "Horticulture", value: 18000 },
  { name: "Aquaculture", value: 9000 },
  { name: "Equipment", value: 14000 },
];

export const placeholderActivity: ActivityItem[] = [
  {
    id: "act-1",
    title: "Distribution paid — Maize Harvest 2025",
    description: "Quarterly profit share for Deal #DS-1184 transferred on-chain.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    type: "DISTRIBUTION",
    amount: 1840,
  } as any,
  {
    id: "act-2",
    title: "Investment confirmed — Tomato Greenhouse",
    description: "Investment of $5,000 recorded and escrowed in smart contract.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: "INVESTMENT",
    amount: 5000,
  } as any,
  {
    id: "act-3",
    title: "Deal approved — Poultry Expansion",
    description: "Administrative review completed, deal is now open to investors.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    type: "APPROVAL",
  } as any,
  {
    id: "act-4",
    title: "Payout processed — Organic Veg Plot",
    description: "Season-end profit distribution of $2,310 sent to investors.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    type: "PAYMENT",
    amount: 2310,
  } as any,
];

const fallbackStats = {
  totalInvestmentAmount: 85000,
  totalReturns: 14200,
  activeDeals: 5,
  engagementScore: 92,
  totalProjects: 8,
  totalRevenue: 64500,
  pendingApprovals: 2,
};

export function useDashboardData() {
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "FARMER") as Role;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.overview,
    // Serve mock data instantly — zero loading skeleton on first paint.
    // The query still runs in the background and swaps in live data if the API responds.
    initialData: MOCK_DASHBOARD_DATA,
    staleTime: 0,
    retry: false,
  });

  const overviewData = data ?? {
    stats: fallbackStats,
    revenueSeries: [],
    investmentBreakdown: [],
    recentActivity: [],
  };

  const stats = overviewData.stats;
  const isFarmer = role === "FARMER";
  const isInvestor = role === "INVESTOR";

  const statCards: StatCardItem[] = isInvestor
    ? [
        {
          label: "Portfolio Value",
          value: stats.totalInvestmentAmount,
          icon: WalletIcon,
        },
        { label: "Total Returns", value: stats.totalReturns, icon: TrendingUp },
        { label: "Active Deals", value: stats.activeDeals, icon: Handshake },
        { label: "Engagement", value: stats.engagementScore, icon: Sprout, suffix: "" },
      ]
    : isFarmer
      ? [
          { label: "Projects", value: stats.totalProjects, icon: FolderKanban },
          { label: "Investments Received", value: stats.totalInvestmentAmount, icon: WalletIcon },
          { label: "Revenue", value: stats.totalRevenue, icon: TrendingUp },
          { label: "Pending Approvals", value: stats.pendingApprovals, icon: Bell },
        ]
      : [
          { label: "Total Farmers", value: stats.totalProjects, icon: Sprout },
          { label: "Active Deals", value: stats.activeDeals, icon: Handshake },
          { label: "Volume Invested", value: stats.totalInvestmentAmount, icon: WalletIcon },
          { label: "Returns Paid", value: stats.totalReturns, icon: TrendingUp },
        ];

  const revenueData = overviewData.revenueSeries.length
    ? overviewData.revenueSeries.map((p: RevenuePoint) => ({
        ...p,
        date: formatDate(p.date, "MMM"),
      }))
    : placeholderRevenue;

  const breakdown: PlaceholderSlice[] = overviewData.investmentBreakdown.length
    ? overviewData.investmentBreakdown.map((item) => ({
        name: item.category,
        value: item.amount,
      }))
    : placeholderBreakdown;

  return {
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
  };
}
