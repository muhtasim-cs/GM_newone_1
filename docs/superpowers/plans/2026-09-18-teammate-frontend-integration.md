# Teammate Frontend Integration Implementation Plan

- **Spec Reference**: `docs/superpowers/specs/2026-09-18-teammate-frontend-design.md`
- **Source Codebase**: `Z:\GramBandhan-TASFI part two\GramBandhan-TASFI part 2`
- **Target Codebase**: `Z:\GM_part2\apps\web`

---

## 1. Overview & File Mapping

This plan breaks down the integration of our teammates' authentic Bangladeshi frontend into our Next.js App Router workspace (`apps/web`). Each task is self-contained, testable, and concludes with verification.

### Files Created or Modified
- **`apps/web/public/images/`** [NEW]: Copy 18 hero/farm images + 49 product images from Location 2.
- **`apps/web/src/data/teammate-data.ts`** [NEW]: Type definitions and structured data for 16 active projects, 49 village products, and authentic farmer/artisan profiles.
- **`apps/web/src/app/globals.css`** [MODIFY]: Bangladesh rural color tokens (`#0A2C22`, `#0E392B`, `#D6CCA8`, `#061D15`, `#34D399`) and smooth crossfade animations.
- **`apps/web/src/components/home/teammate-hero.tsx`** [NEW]: 2.0s rapid continuous crossfade hero slideshow with high-contrast text overlay and dual action buttons.
- **`apps/web/src/components/home/teammate-project-card.tsx`** [NEW]: Dark black-green luxury minimal investor profit cards with bilingual return ratios.
- **`apps/web/src/components/home/investment-simulator-modal.tsx`** [NEW]: Interactive real-time BDT return calculator modal.
- **`apps/web/src/components/home/farmer-portal-modal.tsx`** [NEW]: Producer onboarding portal with 1-click demos for Md. Rafiqul Islam and Fatima Begum.
- **`apps/web/src/components/home/marketplace-modal.tsx`** [NEW]: Full 49-item village craft and farm produce modal with filters and shopping bag.
- **`apps/web/src/app/page.tsx`** [MODIFY]: Assemble all teammate components, preserve `BlockchainBanner` and wallet integration, and wire route links.

---

## 2. Micro-Tasks Breakdown

### Task 1: Ingest Assets & Static Imagery
- **Step 1**: Ensure `apps/web/public/images` and `apps/web/public/images/products` exist.
- **Step 2**: Copy all 18 hero & farm images from `Z:\GramBandhan-TASFI part two\GramBandhan-TASFI part 2\public\images` into `apps/web/public/images/`.
- **Step 3**: Copy all 49 product images from `Z:\GramBandhan-TASFI part two\GramBandhan-TASFI part 2\public\images\products` into `apps/web/public/images/products/`.
- **Step 4**: Verify file counts and presence via terminal.
- **Step 5**: Git commit: `feat(assets): import authentic Bangladeshi farm and marketplace photography`.

### Task 2: Port Types & Structured Authentic Datasets
- **Step 1**: Create `apps/web/src/data/teammate-data.ts`.
- **Step 2**: Port `ACTIVE_PROJECTS` (16 projects with BDT returns and Shariah splits), `HERO_SLIDES` (6 slides), `MARKETPLACE_PRODUCTS` (49 items), and producer profiles.
- **Step 3**: Verify types and export signatures.
- **Step 4**: Git commit: `feat(data): add authentic agricultural projects and marketplace data`.

### Task 3: Design Tokens & CSS Animations
- **Step 1**: Update `apps/web/src/app/globals.css` with color variables:
  - `--rural-green-900: #061D15`
  - `--rural-green-800: #0A2C22`
  - `--rural-green-700: #0E392B`
  - `--rural-sand: #D6CCA8`
  - `--rural-cream: #F7F4EC`
  - `--rural-emerald: #34D399`
- **Step 2**: Add keyframe crossfades and luxury card styling utilities.
- **Step 3**: Git commit: `style(theme): add Bangladesh rural color palette and styling tokens`.

### Task 4: Continuous 2.0s Slideshow Hero Component
- **Step 1**: Create `apps/web/src/components/home/teammate-hero.tsx` (`"use client"`).
- **Step 2**: Implement the continuous 2.0s crossfade timer cycling through the 6 curated photos.
- **Step 3**: Add clean text overlay, "Join as Farmer", "Become an Investor" buttons, and live advisory badge.
- **Step 4**: Test component in isolation.
- **Step 5**: Git commit: `feat(ui): implement continuous crossfade hero component`.

### Task 5: Interactive Modals (Investment Simulator, Farmer Portal, Marketplace)
- **Step 1**: Create `investment-simulator-modal.tsx` with dynamic BDT profit calculations.
- **Step 2**: Create `farmer-portal-modal.tsx` with farmer and artisan 1-click verified producer demos.
- **Step 3**: Create `marketplace-modal.tsx` with 49 products, category pills, search bar, and bag counter.
- **Step 4**: Verify state handling and backdrop dismissing.
- **Step 5**: Git commit: `feat(modals): add investment simulator, farmer portal, and village marketplace`.

### Task 6: Assemble Homepage with Blockchain Interoperability
- **Step 1**: Refactor `apps/web/src/app/page.tsx`:
  - Mount `TeammateHero`.
  - Mount existing `BlockchainBanner` directly below the hero.
  - Mount Active Projects with luxury dark profit cards.
  - Mount Dual-Track "How It Works" and stats.
  - Mount Modals and wire trigger buttons.
  - Connect links to `/blockchain`, `/dashboard`, `/deals`, and wallet connect.
- **Step 2**: Run Next.js build (`pnpm --filter web build` or `next build`) to ensure type safety.
- **Step 3**: Git commit: `feat(web): assemble new landing page with teammate design and blockchain integration`.

### Task 7: Visual Verification (`iris`) & Quality Review
- **Step 1**: Ensure dev server is running on `http://localhost:3000`.
- **Step 2**: Use `iris` MCP tool to capture screenshots of `http://localhost:3000`:
  - Verify hero slideshow crossfade and clean overlay.
  - Verify Base Sepolia blockchain trust bar.
  - Verify dark luxury profit cards and layout responsiveness.
- **Step 3**: Run CodeRabbit / code quality audit.
