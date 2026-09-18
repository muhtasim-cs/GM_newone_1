"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sidebar, SidebarSkeleton } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Sprout } from "lucide-react";

// Dynamically load WalletsProvider on client only — avoids bundling 11,000 crypto modules during server compile
const DynamicWalletsProvider = dynamic(
  () => import("@/lib/wallets-provider").then((mod) => mod.WalletsProvider),
  {
    ssr: false,
    loading: ({ children }: any) => <>{children}</>,
  }
);

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Only check redirect after client has hydrated localStorage auth
    if (hydrated && !isAuthenticated && !redirected.current) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  // Show minimal skeleton while auth check happens — not a full white screen
  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-surface/50">
        <SidebarSkeleton />
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Loading bar at top */}
          <div className="h-16 border-b bg-background/95 flex items-center px-6">
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "linear-gradient(135deg,#015546,#0A7A5A)" }}
              >
                <Sprout className="h-4 w-4 text-white" />
              </span>
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            </div>
          </div>
          {/* Content skeleton */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-4">
            <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-muted animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <DynamicWalletsProvider>
      <div className="flex min-h-screen bg-surface/50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto space-y-6 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DynamicWalletsProvider>
  );
}