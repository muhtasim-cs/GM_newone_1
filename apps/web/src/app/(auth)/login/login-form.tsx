"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail, Lock, Wallet } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import type { User } from "@/types";

const DEMO_USERS: Record<string, { pass: string; user: User }> = {
  "admin@grambondhon.bd": {
    pass: "admin123",
    user: {
      id: "demo-admin-1",
      email: "admin@grambondhon.bd",
      firstName: "Admin",
      lastName: "Platform",
      role: "ADMIN",
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  "farmer@grambondhon.bd": {
    pass: "farmer123",
    user: {
      id: "demo-farmer-1",
      email: "farmer@grambondhon.bd",
      firstName: "Rahim",
      lastName: "Farmer",
      role: "FARMER",
      businessName: "Green Valley Farm",
      district: "Bogura",
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  "investor@grambondhon.bd": {
    pass: "investor123",
    user: {
      id: "demo-investor-1",
      email: "investor@grambondhon.bd",
      firstName: "Karim",
      lastName: "Investor",
      role: "INVESTOR",
      investorType: "INDIVIDUAL",
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const nativeLogin = useAuthStore((s) => s.nativeLogin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginAs = async (demoEmail: string) => {
    const demo = DEMO_USERS[demoEmail];
    if (!demo) return;

    form.setValue("email", demo.user.email);
    form.setValue("password", demo.pass);
    setIsSubmitting(true);
    setError(null);

    // Instant demo login
    nativeLogin(demo.user, "demo-jwt-token", "demo-jwt-refresh-token");
    toast.success(`স্বাগতম, ${demo.user.firstName}! (${demo.user.role})`);
    setIsSubmitting(false);
    router.push("/dashboard");
  };

  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    setError(null);

    const demo = DEMO_USERS[values.email.toLowerCase()];
    if (demo && demo.pass === values.password) {
      nativeLogin(demo.user, "demo-jwt-token", "demo-jwt-refresh-token");
      toast.success(`Welcome back, ${demo.user.firstName}! (${demo.user.role} Demo)`);
      setIsSubmitting(false);
      router.push("/dashboard");
      return;
    }

    try {
      const res = await authApi.login(values.email, values.password);
      nativeLogin(res.user, res.token, res.refreshToken);
      toast.success(`Welcome back, ${res.user.firstName}!`);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid credentials. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="pl-9"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/5"
          onClick={() => loginAs("investor@grambondhon.bd")}
        >
          <Wallet className="h-4 w-4 text-primary" />
          Connect Web3 Wallet (Base / Sepolia)
        </Button>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-3">
        <p className="font-bold text-foreground text-sm">🎯 Demo Accounts</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="rounded-lg border border-primary/20 bg-white py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all"
            onClick={() => loginAs("admin@grambondhon.bd")}
          >
            Admin
          </button>
          <button
            type="button"
            className="rounded-lg border border-primary/20 bg-white py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all"
            onClick={() => loginAs("farmer@grambondhon.bd")}
          >
            Farmer
          </button>
          <button
            type="button"
            className="rounded-lg border border-primary/20 bg-white py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all"
            onClick={() => loginAs("investor@grambondhon.bd")}
          >
            Investor
          </button>
        </div>
        <p className="text-muted-foreground text-[11px]">
          Email: <span className="font-mono font-semibold text-primary">admin@grambondhon.bd</span> | Pass: <span className="font-mono font-semibold text-primary">admin123</span>
        </p>
      </div>
    </div>
  );
}