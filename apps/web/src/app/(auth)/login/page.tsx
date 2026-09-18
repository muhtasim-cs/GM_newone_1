import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, CheckCircle2, ShieldCheck, TrendingUp, Leaf } from "lucide-react";
import { LoginForm } from "./login-form";
import { CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your GRAMBONDHON account and start investing in ethical agriculture.",
};

const features = [
  { icon: ShieldCheck, text: "100% Shariah Compliant Investments" },
  { icon: TrendingUp, text: "18–25% Average Annual Returns" },
  { icon: CheckCircle2, text: "Blockchain-Secured Transactions" },
  { icon: Leaf, text: "Directly Uplift Bangladeshi Farmers" },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* ── LEFT PANEL — Brand / Hero ─────────────────────────────────────── */}
      <div
        className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden"
        style={{ background: "linear-gradient(160deg, #015546 0%, #011F18 100%)" }}
      >
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #20C61C 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }} />

        {/* Top: Logo */}
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 border border-white/25">
              <Sprout className="h-6 w-6 text-white" />
            </span>
            <div>
              <span className="block text-base font-bold text-white tracking-tight leading-none">
                GRAMBONDHON
              </span>
              <span className="block text-[11px] text-white/50 mt-0.5">গ্রামবন্ধন</span>
            </div>
          </Link>
        </div>

        {/* Middle: Hero content */}
        <div className="relative z-10 px-10 pb-10">
          {/* Background farm image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 rounded-3xl mx-8"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=900&q=80')",
            }}
          />

          <div className="relative">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Halal Investment, Reimagined
            </div>

            <h1 className="mb-5 text-4xl font-extrabold text-white leading-tight">
              Empowering Rural Growth<br />
              <span style={{ color: "#F5A623" }}>Through Ethical Investment</span>
            </h1>

            <p className="mb-8 text-base text-white/65 leading-relaxed max-w-sm">
              Join 2,400+ ethical investors who are growing their wealth while
              uplifting Bangladeshi farmers through Shariah-compliant profit sharing.
            </p>

            {/* Features list */}
            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80">{text}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { val: "500+", label: "Projects" },
                { val: "2400+", label: "Investors" },
                { val: "100%", label: "Halal" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/8 border border-white/10 p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <p className="text-xl font-extrabold text-white">{s.val}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-center bg-background px-6 py-12 sm:px-10 lg:px-14">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#015546,#0A7A5A)" }}>
            <Sprout className="h-5 w-5 text-white" />
          </span>
          <div>
            <span className="block text-sm font-bold tracking-tight text-foreground leading-none">
              GRAMBONDHON
            </span>
            <span className="block text-[10px] text-muted-foreground mt-0.5">গ্রামবন্ধন</span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          <CardContent className="p-0">
            <LoginForm />
          </CardContent>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              New to GRAMBONDHON?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}