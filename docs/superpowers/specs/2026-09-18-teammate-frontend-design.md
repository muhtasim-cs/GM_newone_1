# Teammate Frontend Integration Design Spec (GramBondhon)

- **Date**: 2026-09-18
- **Project**: AgriPlatform (`apps/web` Next.js frontend, `apps/api` NestJS backend)
- **Source Location**: Location 2 (`Z:\GramBandhan-TASFI part two\GramBandhan-TASFI part 2`)
- **Target Location**: `Z:\GM_part2\apps\web`

---

## 1. Executive Summary & Goals

This specification defines the migration and integration of the authentic Bangladeshi rural frontend designed by teammates into the existing Next.js 14 AgriPlatform web application (`apps/web`).

### Objectives
1. **Pixel-Perfect & Aesthetic Parity**: Integrate the exact Bangladesh rural color palette (Forest Green `#0A2C22`, `#0E392B`, Sand `#D6CCA8`, Warm Cream `#F7F4EC`, and Dark Black-Green `#061D15`), photography assets, continuous 2.0s hero crossfade slideshow, and luxury minimal profit cards.
2. **Preserve Advanced Blockchain & Platform Systems**: Keep all existing Web3 / blockchain functionality (Base Sepolia testnet contracts, Wagmi wallet connection, immutable on-chain proofs, `/blockchain`, `/deals`, `/portfolio`, and `/dashboard`).
3. **Interactive Modals & Simulators**: Bring in the 3 core modal systems:
   - Real-time Investment Return Simulator (calculates BDT returns).
   - Farmer & Rural Women Producer Portal (1-click demo logins for Md. Rafiqul Islam & Fatima Begum with verified producer dashboard).
   - Authentic Village Marketplace with all 49 authentic agricultural and craft items.

---

## 2. Visual & Architectural Design

### 2.1 Asset Ingestion
All assets from Location 2 (`public/images/`) are mapped to `apps/web/public/images/`:
- **18 Hero & Project Photos**: High-resolution authentic imagery including rice planting (`farmer-rice-planting.jpg`), chili drying, jute weaving, tea terraces, and cattle hubs.
- **49 Rural Marketplace Products**: Under `public/images/products/` including Kalijira rice, Himsagar mangoes, Nakshi Kantha, artisan ghee, and freshwater fish.

### 2.2 Color System & Design Tokens
Defined in `apps/web/src/app/globals.css` and Tailwind theme:
- Primary Forest Green: `#0A2C22` / `#0E392B`
- Warm Sand: `#D6CCA8`
- Soft Cream Background: `#F7F4EC`
- Luxury Dark Card Base: `#061D15`
- Mint Accent: `#34D399`
- Emerald Tag: `#0D382A`

### 2.3 Landing Page Structure (`apps/web/src/app/page.tsx`)
1. **Header / Navbar**:
   - Logo with GramBondhon branding (`🌾 গ্রাম বন্ধন`).
   - Links: Home, Active Projects, How It Works, Why Us, Marketplace, Farmers & Women.
   - Quick action pill buttons: "Farmers & Women", "Explore Ledger", and RainbowKit "Connect Wallet".
2. **Hero Section**:
   - 2.0s continuous automatic slideshow crossfading through 6 authentic photographs without hover pause.
   - High-contrast direct white text overlay: *"Empowering Rural Growth Through Ethical Investment"*.
   - Two distinct CTA buttons: "Join as Farmer" (Forest Green) and "Become an Investor" (Sand).
   - Floating live advisory support indicator.
3. **Blockchain Trust Banner (`BlockchainBanner`)**:
   - Base Sepolia Testnet badge, contract address (`0x4F12...8230`), and 12,480+ on-chain proof logs counter linking to `/blockchain`.
4. **Active Projects & Profit Cards**:
   - 16 verified Bangladeshi projects with bilingual titles, BDT pricing, and Mudarabah split (e.g. *65% Grower / 35% Investor*).
   - Interactive "Invest Now" opening the simulator.
5. **Interactive Investment Return Simulator Modal**:
   - Live dynamic calculation for BDT amounts.
6. **Dual-Track How It Works**:
   - Tabs for "For Investors" and "For Farmers & Village Women".
7. **Farmer & Rural Women Portal Modal**:
   - Tabbed producer registration with 1-click demos for farmer and artisan.
8. **Village Marketplace Modal & Preview Cards**:
   - 49 village items with category filter, search, and working shopping bag counter.
9. **Footer**:
   - Ecosystem links, Shariah compliance statements, and contact details.

---

## 3. Data Flow & State Management

- **Client State**:
  - `activeProjectModal`: currently selected project for the investment simulator.
  - `isFarmerPortalOpen`: boolean for the farmer & women producer modal.
  - `isMarketplaceOpen`: boolean for the 49-product village craft market modal.
  - `shoppingBag`: items added from the marketplace.
- **Route Interoperability**:
  - Clicking "Explore Public Ledger" or contract details routes to `/blockchain`.
  - Authenticated investor actions can seamlessly link to `/dashboard` or `/deals`.

---

## 4. Verification Plan

1. **Asset Integrity**: Verify all 67 images (18 hero/project photos + 49 product photos) render without 404s.
2. **Visual Verification (`iris`)**:
   - Inspect `http://localhost:3000` to verify the 2.0s hero crossfade, typography, spacing, luxury dark profit cards, and color harmony.
   - Inspect modal opens: Simulator, Farmer Portal, Marketplace.
3. **Build & Type Check**:
   - Run `pnpm run build` or `next build` inside `apps/web` to confirm zero TypeScript compilation errors.
