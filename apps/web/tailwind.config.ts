import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // GRAMBONDHON brand tokens
        gb: {
          forest: "#015546",
          "forest-dark": "#011F18",
          "forest-mid": "#0A7A5A",
          "forest-light": "#E8F5EE",
          teal: "#1B6B52",
          lime: "#20C61C",
          amber: "#C8902A",
          "amber-light": "#F5A623",
          cream: "#F8F5EE",
          "text-dark": "#0D1F17",
          "text-muted": "#5A7A6E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        // 'font-sans' resolves to Plus Jakarta Sans via the CSS variable injected by next/font
        sans: ["var(--font-pjs)", "Plus Jakarta Sans", ...fontFamily.sans],
        display: ["var(--font-pjs)", "Plus Jakarta Sans", ...fontFamily.sans],
      },
      backgroundImage: {
        // Hero gradient overlay (Figma style)
        "hero-gradient":
          "linear-gradient(135deg, rgba(1,85,70,0.95) 0%, rgba(1,50,38,0.85) 50%, rgba(0,31,24,0.75) 100%)",
        // Section backgrounds
        "gb-section": "linear-gradient(160deg, #015546 0%, #011F18 100%)",
        "gb-amber": "linear-gradient(135deg, #C8902A 0%, #F5A623 100%)",
        "gb-mint": "linear-gradient(180deg, #F0FAF4 0%, #FAFFF8 100%)",
        // Old compat
        "agri-gradient":
          "linear-gradient(135deg, hsl(166 98% 17%) 0%, hsl(161 60% 22%) 50%, hsl(120 40% 28%) 100%)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(32,198,28,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(32,198,28,0)" },
        },
        "ticker-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-slide-up": "fade-slide-up 0.6s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "ticker-scroll": "ticker-scroll 30s linear infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      boxShadow: {
        "gb-card": "0 4px 24px rgba(1, 85, 70, 0.08)",
        "gb-card-hover": "0 16px 40px rgba(1, 85, 70, 0.16)",
        "gb-amber": "0 8px 24px rgba(200, 144, 42, 0.3)",
        "gb-glow": "0 0 32px rgba(1, 85, 70, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;