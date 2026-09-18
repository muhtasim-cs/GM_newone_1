import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

// font-display:optional — uses PJS from cache (instant) or falls back to system font
// on first load rather than hiding all text while the font downloads.
const pjs = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "800"],
  variable: "--font-pjs",
  display: "optional",
});

export const metadata: Metadata = {
  title: {
    default: "GRAMBONDHON | গ্রামবন্ধন — Halal Agricultural Investment",
    template: "%s | GRAMBONDHON",
  },
  description:
    "GRAMBONDHON connects ethical investors with verified Bangladeshi farmers through transparent, halal profit-sharing agreements. Empower rural growth, earn real returns.",
  keywords: [
    "grambondhon",
    "gram bondhon",
    "গ্রামবন্ধন",
    "halal investment",
    "agriculture bangladesh",
    "profit sharing",
    "agri-tech",
  ],
  openGraph: {
    type: "website",
    title: "GRAMBONDHON | গ্রামবন্ধন",
    description:
      "Empowering Rural Growth Through Ethical Investment. Halal Agri-Investment Platform for Bangladesh.",
    siteName: "GRAMBONDHON",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#015546" },
    { media: "(prefers-color-scheme: dark)", color: "#011F18" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={pjs.variable}>
      <body className="font-sans min-h-screen bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}