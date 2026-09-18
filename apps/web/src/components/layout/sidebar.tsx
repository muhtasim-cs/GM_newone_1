"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sprout,
  FolderKanban,
  Handshake,
  Wallet,
  FileText,
  Settings,
  Users,
  CreditCard,
  Blocks,
  BarChart3,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navConfig: Record<string, NavItem[]> = {
  FARMER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Farms", href: "/dashboard/farms", icon: Sprout },
    { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { label: "Deals", href: "/dashboard/deals", icon: Handshake },
    { label: "Investments", href: "/dashboard/investments", icon: Wallet },
    { label: "Documents", href: "/dashboard/documents", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  INVESTOR: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Browse Deals", href: "/dashboard/deals", icon: Handshake },
    { label: "My Investments", href: "/dashboard/investments", icon: Wallet },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: BarChart3 },
    { label: "Documents", href: "/dashboard/documents", icon: FileText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Farmers", href: "/dashboard/farmers", icon: Users },
    { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
    { label: "Deals", href: "/dashboard/deals", icon: Handshake },
    { label: "Investments", href: "/dashboard/investments", icon: Wallet },
    { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { label: "Blockchain", href: "/dashboard/blockchain", icon: Blocks },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Audit", href: "/dashboard/audit", icon: ScrollText },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role ?? ("FARMER" as const);
  const items = navConfig[role] ?? navConfig.FARMER;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <div
        className={cn("flex h-16 items-center gap-2 px-4 border-b border-white/10", collapsed && "justify-center px-2")}
        style={{ background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" }}
      >
        {!collapsed && (
          <>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 border border-white/25 shrink-0">
              <Sprout className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0">
              <span className="block text-sm font-bold tracking-tight text-white leading-none truncate">GRAMBONDHON</span>
              <span className="block text-[9px] text-white/50 leading-none mt-0.5">গ্রামবন্ধন</span>
            </div>
          </>
        )}
        {collapsed && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 border border-white/25">
            <Sprout className="h-5 w-5 text-white" />
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {!collapsed && (
          <>
            <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {role.toLowerCase()} workspace
            </p>
            <Separator className="mb-2" />
          </>
        )}
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href)) ||
            (item.href.startsWith("/dashboard/") && pathname === item.href.replace("/dashboard", ""));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
                active
                  ? "text-white shadow-md"
                  : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
              )}
              style={active ? { background: "linear-gradient(135deg, #015546 0%, #0A7A5A 100%)" } : {}}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </Button>
        {!collapsed && user && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-secondary/50 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#015546,#0A7A5A)" }}>
              {(user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mt-3 flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              {(user?.firstName?.[0] ?? "U") + (user?.lastName?.[0] ?? "")}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 px-4" style={{ background: "linear-gradient(135deg,#015546,#0A7A5A)" }}>
        <Skeleton className="h-9 w-9 rounded-lg bg-white/20" />
        <Skeleton className="h-5 w-28 bg-white/20" />
      </div>
      <nav className="flex-1 space-y-2 p-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;