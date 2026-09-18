"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Moon, Sun, Menu, Sprout } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/stores/auth.store";
import { notificationApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const WalletButton = dynamic(
  () => import("@/components/layout/wallet-button").then((m) => m.WalletButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-24 rounded-md bg-muted/60 animate-pulse" />,
  }
);
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Header({ title = "Dashboard", onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationApi
      .unreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => setUnreadCount(0));
  }, []);

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      logout();
      toast.success("Signed out", "You have been logged out successfully.");
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      {onMenuClick && (
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary/50 lg:hidden hover:bg-secondary transition-colors"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg,#015546,#0A7A5A)" }}>
          <Sprout className="h-4 w-4 text-white" />
        </span>
        <span className="text-sm font-bold tracking-tight text-foreground">GB</span>
      </div>

      <h1 className="hidden text-lg font-semibold tracking-tight lg:block sm:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-56 pl-8 lg:w-72"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                router.push(
                  `/dashboard/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`
                );
              }
            }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              You&apos;re all caught up
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <WalletButton />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-8 w-8">
                {user?.avatar && <AvatarImage src={user.avatar} alt="avatar" />}
                <AvatarFallback>
                  {(user?.firstName?.[0] ?? "U") + (user?.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.firstName} {user?.lastName}
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Header;