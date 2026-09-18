import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, Leaf, ShieldCheck, TrendingUp } from "lucide-react";
import { RegisterForm } from "./register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join GRAMBONDHON as a farmer or ethical investor and start your halal agricultural investment journey.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(160deg, #015546 0%, #011F18 100%)" }}>
      {/* Decorative background */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative flex min-h-screen w-full items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 border border-white/25">
                <Sprout className="h-7 w-7 text-white" />
              </span>
              <div className="text-left">
                <span className="block text-lg font-bold text-white tracking-tight leading-none">
                  GRAMBONDHON
                </span>
                <span className="block text-[11px] text-white/50 mt-0.5">গ্রামবন্ধন</span>
              </div>
            </Link>
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold">Join GRAMBONDHON</h1>
              <p className="text-sm text-white/65 mt-1">
                Create your account and start your halal investment journey
              </p>
            </div>
            {/* Trust signals */}
            <div className="flex gap-4 flex-wrap justify-center">
              {[
                { icon: ShieldCheck, text: "Shariah Certified" },
                { icon: TrendingUp, text: "18–25% Returns" },
                { icon: Leaf, text: "Support Farmers" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-white/60">
                  <Icon className="h-3.5 w-3.5 text-green-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <Card className="border border-white/10 shadow-2xl" style={{ background: "rgba(255,255,255,0.97)" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Tell us a little about yourself — it takes under two minutes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
              <div className="mt-6 space-y-4 border-t pt-4">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}