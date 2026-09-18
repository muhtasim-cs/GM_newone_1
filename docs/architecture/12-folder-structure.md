# Folder Structure

## Overview

The Agriculture Profit-Sharing Platform is a monorepo managed by Turborepo. It contains the Next.js frontend, NestJS backend, shared packages, smart contracts, infrastructure configuration, and documentation.

---

## Complete Folder Structure

```
agri-platform/
|
|-- apps/
|   |-- web/                              # Next.js 14 Frontend
|   |   |-- src/
|   |   |   |-- app/                      # App Router (file-based routing)
|   |   |   |   |-- layout.tsx            # Root layout (providers, theme, fonts)
|   |   |   |   |-- page.tsx              # Landing page (/)
|   |   |   |   |-- loading.tsx           # Global loading state
|   |   |   |   |-- error.tsx             # Global error boundary
|   |   |   |   |-- not-found.tsx         # 404 page
|   |   |   |   |-- (marketing)/          # Public marketing pages
|   |   |   |   |   |-- layout.tsx        # Marketing layout (no auth)
|   |   |   |   |   |-- about/page.tsx
|   |   |   |   |   |-- how-it-works/page.tsx
|   |   |   |   |   |-- contact/page.tsx
|   |   |   |   |   |-- terms/page.tsx
|   |   |   |   |   |-- privacy/page.tsx
|   |   |   |   |
|   |   |   |   |-- (auth)/               # Authentication pages
|   |   |   |   |   |-- layout.tsx        # Auth layout (centered card)
|   |   |   |   |   |-- login/page.tsx
|   |   |   |   |   |-- register/page.tsx
|   |   |   |   |   |-- forgot-password/page.tsx
|   |   |   |   |   |-- reset-password/page.tsx
|   |   |   |   |
|   |   |   |   |-- (platform)/           # Authenticated platform pages
|   |   |   |   |   |-- layout.tsx        # Platform layout (sidebar, header)
|   |   |   |   |   |-- dashboard/page.tsx
|   |   |   |   |   |-- deals/
|   |   |   |   |   |   |-- page.tsx      # Deal listings (/deals)
|   |   |   |   |   |   |-- [id]/
|   |   |   |   |   |       |-- page.tsx           # Deal detail
|   |   |   |   |   |       |-- invest/page.tsx    # Investment form
|   |   |   |   |   |       |-- manage/page.tsx    # Deal management
|   |   |   |   |   |       |-- edit/page.tsx      # Edit deal
|   |   |   |   |   |-- farms/
|   |   |   |   |   |   |-- page.tsx      # Farm listings
|   |   |   |   |   |   |-- [id]/
|   |   |   |   |   |       |-- page.tsx           # Farm detail
|   |   |   |   |   |       |-- edit/page.tsx      # Edit farm
|   |   |   |   |   |       |-- documents/page.tsx # Farm documents
|   |   |   |   |   |-- investments/
|   |   |   |   |   |   |-- page.tsx      # Investment portfolio
|   |   |   |   |   |   |-- [id]/
|   |   |   |   |   |       |-- page.tsx           # Investment detail
|   |   |   |   |   |-- wallet/
|   |   |   |   |   |   |-- page.tsx      # Wallet management
|   |   |   |   |   |-- notifications/
|   |   |   |   |   |   |-- page.tsx      # Notification center
|   |   |   |   |   |-- settlements/
|   |   |   |   |   |   |-- page.tsx      # Settlement history
|   |   |   |   |   |-- settings/
|   |   |   |   |       |-- page.tsx      # User settings
|   |   |   |   |
|   |   |   |   |-- (farmer)/             # Farmer-only pages
|   |   |   |   |   |-- layout.tsx        # Farmer layout
|   |   |   |   |   |-- farms/
|   |   |   |   |   |   |-- new/page.tsx           # Create farm
|   |   |   |   |   |-- projects/
|   |   |   |   |   |   |-- page.tsx               # My projects
|   |   |   |   |   |   |-- new/page.tsx           # Create project
|   |   |   |   |   |   |-- [id]/
|   |   |   |   |   |       |-- page.tsx           # Project detail
|   |   |   |   |   |       |-- manage/page.tsx    # Manage project
|   |   |   |   |   |-- profile/
|   |   |   |   |       |-- page.tsx      # Farmer profile
|   |   |   |   |
|   |   |   |   |-- (investor)/           # Investor-only pages
|   |   |   |   |   |-- layout.tsx        # Investor layout
|   |   |   |   |   |-- portfolio/page.tsx
|   |   |   |   |   |-- kyc/page.tsx
|   |   |   |   |   |-- profile/page.tsx
|   |   |   |   |
|   |   |   |   |-- (admin)/              # Admin-only pages
|   |   |   |   |   |-- layout.tsx        # Admin layout
|   |   |   |   |   |-- dashboard/page.tsx
|   |   |   |   |   |-- farmers/page.tsx
|   |   |   |   |   |-- investors/page.tsx
|   |   |   |   |   |-- deals/page.tsx
|   |   |   |   |   |-- investments/page.tsx
|   |   |   |   |   |-- reconciliation/page.tsx
|   |   |   |   |   |-- audit-logs/page.tsx
|   |   |   |   |   |-- financial-reports/page.tsx
|   |   |   |   |   |-- blockchain/page.tsx
|   |   |   |   |   |-- settings/page.tsx
|   |   |   |   |
|   |   |   |   |-- api/                  # Next.js API routes (proxy)
|   |   |   |       |-- auth/
|   |   |   |           |-- [...nextauth]/route.ts
|   |   |   |
|   |   |   |-- components/               # Shared React components
|   |   |   |   |-- ui/                   # shadcn/ui components
|   |   |   |   |   |-- button.tsx
|   |   |   |   |   |-- card.tsx
|   |   |   |   |   |-- dialog.tsx
|   |   |   |   |   |-- dropdown-menu.tsx
|   |   |   |   |   |-- form.tsx
|   |   |   |   |   |-- input.tsx
|   |   |   |   |   |-- label.tsx
|   |   |   |   |   |-- select.tsx
|   |   |   |   |   |-- table.tsx
|   |   |   |   |   |-- textarea.tsx
|   |   |   |   |   |-- toast.tsx
|   |   |   |   |   |-- tooltip.tsx
|   |   |   |   |   |-- badge.tsx
|   |   |   |   |   |-- avatar.tsx
|   |   |   |   |   |-- separator.tsx
|   |   |   |   |   |-- skeleton.tsx
|   |   |   |   |   |-- tabs.tsx
|   |   |   |   |   |-- alert.tsx
|   |   |   |   |   |-- progress.tsx
|   |   |   |   |   |-- scroll-area.tsx
|   |   |   |   |   |-- sheet.tsx
|   |   |   |   |   |-- command.tsx
|   |   |   |   |   |-- popover.tsx
|   |   |   |   |   |-- calendar.tsx
|   |   |   |   |   |-- data-table.tsx
|   |   |   |   |   |-- pagination.tsx
|   |   |   |   |
|   |   |   |   |-- layout/               # Layout components
|   |   |   |   |   |-- header.tsx
|   |   |   |   |   |-- sidebar.tsx
|   |   |   |   |   |-- footer.tsx
|   |   |   |   |   |-- nav-items.tsx
|   |   |   |   |   |-- user-menu.tsx
|   |   |   |   |   |-- notification-bell.tsx
|   |   |   |   |   |-- mobile-nav.tsx
|   |   |   |   |
|   |   |   |   |-- deals/                # Deal-specific components
|   |   |   |   |   |-- deal-card.tsx
|   |   |   |   |   |-- deal-detail.tsx
|   |   |   |   |   |-- deal-funding-progress.tsx
|   |   |   |   |   |-- deal-timeline.tsx
|   |   |   |   |   |-- deal-terms-display.tsx
|   |   |   |   |   |-- deal-milestones.tsx
|   |   |   |   |
|   |   |   |   |-- investments/          # Investment components
|   |   |   |   |   |-- investment-form.tsx
|   |   |   |   |   |-- investment-card.tsx
|   |   |   |   |   |-- payment-method-selector.tsx
|   |   |   |   |   |-- ownership-breakdown.tsx
|   |   |   |   |
|   |   |   |   |-- farms/                # Farm components
|   |   |   |   |   |-- farm-card.tsx
|   |   |   |   |   |-- farm-form.tsx
|   |   |   |   |   |-- farm-map.tsx
|   |   |   |   |   |-- document-upload.tsx
|   |   |   |   |
|   |   |   |   |-- wallet/               # Wallet components
|   |   |   |   |   |-- connect-wallet-button.tsx
|   |   |   |   |   |-- wallet-info.tsx
|   |   |   |   |   |-- transaction-history.tsx
|   |   |   |   |
|   |   |   |   |-- charts/               # Data visualization
|   |   |   |   |   |-- investment-chart.tsx
|   |   |   |   |   |-- profit-chart.tsx
|   |   |   |   |   |-- portfolio-allocation.tsx
|   |   |   |   |   |-- revenue-trend.tsx
|   |   |   |   |
|   |   |   |   |-- forms/                # Complex form components
|   |   |   |   |   |-- deal-creation-form.tsx
|   |   |   |   |   |-- project-creation-form.tsx
|   |   |   |   |   |-- kyc-form.tsx
|   |   |   |   |   |-- withdrawal-form.tsx
|   |   |   |   |
|   |   |   |   |-- providers/            # React context providers
|   |   |   |   |   |-- wallet-provider.tsx     # Wagmi/RainbowKit
|   |   |   |   |   |-- auth-provider.tsx
|   |   |   |   |   |-- theme-provider.tsx
|   |   |   |   |   |-- query-provider.tsx     # TanStack Query
|   |   |   |   |   |-- toast-provider.tsx
|   |   |   |   |
|   |   |   |   |-- shared/               # Generic reusable components
|   |   |   |       |-- page-header.tsx
|   |   |   |       |-- empty-state.tsx
|   |   |   |       |-- loading-spinner.tsx
|   |   |   |       |-- error-boundary.tsx
|   |   |   |       |-- confirm-dialog.tsx
|   |   |   |       |-- data-table-toolbar.tsx
|   |   |   |       |-- file-upload-zone.tsx
|   |   |   |       |-- status-badge.tsx
|   |   |   |       |-- currency-display.tsx
|   |   |   |       |-- address-display.tsx
|   |   |   |
|   |   |   |-- hooks/                    # Custom React hooks
|   |   |   |   |-- use-auth.ts
|   |   |   |   |-- use-wallet.ts
|   |   |   |   |-- use-deal.ts
|   |   |   |   |-- use-investment.ts
|   |   |   |   |-- use-farm.ts
|   |   |   |   |-- use-pagination.ts
|   |   |   |   |-- use-debounce.ts
|   |   |   |   |-- use-local-storage.ts
|   |   |   |   |-- use-media-query.ts
|   |   |   |
|   |   |   |-- lib/                      # Utility libraries
|   |   |   |   |-- api-client.ts          # Axios instance with interceptors
|   |   |   |   |-- auth.ts               # Auth utility functions
|   |   |   |   |-- utils.ts              # General utilities (cn, formatDate, etc.)
|   |   |   |   |-- validations.ts        # Zod schemas for forms
|   |   |   |   |-- constants.ts          # App constants
|   |   |   |   |-- currencies.ts         # Currency formatting
|   |   |   |   |-- blockchain.ts         # Blockchain utility functions
|   |   |   |
|   |   |   |-- stores/                   # Zustand stores
|   |   |   |   |-- auth-store.ts
|   |   |   |   |-- ui-store.ts
|   |   |   |   |-- deal-filter-store.ts
|   |   |   |   |-- cart-store.ts         # Investment "cart"
|   |   |   |
|   |   |   |-- types/                    # TypeScript type definitions
|   |   |   |   |-- api.ts               # API response types
|   |   |   |   |-- models.ts            # Domain model types
|   |   |   |   |-- forms.ts             # Form input types
|   |   |   |   |-- blockchain.ts        # Blockchain-related types
|   |   |   |
|   |   |   |-- config/                   # Configuration
|   |   |       |-- site.ts              # Site metadata
|   |   |       |-- navigation.ts        # Navigation structure
|   |   |       |-- chains.ts            # Supported blockchain chains
|   |   |       |-- contracts.ts         # Contract addresses
|   |   |
|   |   |-- public/                       # Static assets
|   |   |   |-- images/
|   |   |   |-- icons/
|   |   |   |-- fonts/
|   |   |   |-- favicon.ico
|   |   |
|   |   |-- next.config.ts               # Next.js configuration
|   |   |-- tailwind.config.ts           # Tailwind CSS configuration
|   |   |-- postcss.config.js
|   |   |-- tsconfig.json
|   |   |-- package.json
|   |
|   |-- api/                              # NestJS Backend
|       |-- src/
|       |   |-- main.ts                   # Application entry point
|       |   |-- app.module.ts             # Root module
|       |   |-- app.controller.ts         # Root controller (health check)
|       |   |-- app.service.ts            # Root service
|       |   |
|       |   |-- auth/                     # Authentication module
|       |   |   |-- auth.module.ts
|       |   |   |-- auth.controller.ts
|       |   |   |-- auth.service.ts
|       |   |   |-- strategies/
|       |   |   |   |-- jwt.strategy.ts
|       |   |   |   |-- local.strategy.ts
|       |   |   |   |-- wallet.strategy.ts
|       |   |   |-- guards/
|       |   |   |   |-- jwt-auth.guard.ts
|       |   |   |   |-- local-auth.guard.ts
|       |   |   |   |-- wallet-auth.guard.ts
|       |   |   |   |-- roles.guard.ts
|       |   |   |-- decorators/
|       |   |   |   |-- roles.decorator.ts
|       |   |   |   |-- current-user.decorator.ts
|       |   |   |   |-- idempotent.decorator.ts
|       |   |   |-- dto/
|       |   |   |   |-- register.dto.ts
|       |   |   |   |-- login.dto.ts
|       |   |   |   |-- refresh-token.dto.ts
|       |   |   |   |-- wallet-login.dto.ts
|       |   |   |   |-- forgot-password.dto.ts
|       |   |   |   |-- reset-password.dto.ts
|       |   |
|       |   |-- users/                    # Users module
|       |   |   |-- users.module.ts
|       |   |   |-- users.controller.ts
|       |   |   |-- users.service.ts
|       |   |   |-- dto/
|       |   |   |   |-- update-profile.dto.ts
|       |   |   |   |-- user-filter.dto.ts
|       |   |   |-- events/
|       |   |       |-- user.events.ts
|       |   |
|       |   |-- farmers/                  # Farmer module
|       |   |   |-- farmers.module.ts
|       |   |   |-- farmers.controller.ts
|       |   |   |-- farmers.service.ts
|       |   |   |-- dto/
|       |   |       |-- create-farmer-profile.dto.ts
|       |   |       |-- update-farmer-profile.dto.ts
|       |   |       |-- upload-document.dto.ts
|       |   |
|       |   |-- investors/                # Investor module
|       |   |   |-- investors.module.ts
|       |   |   |-- investors.controller.ts
|       |   |   |-- investors.service.ts
|       |   |   |-- dto/
|       |   |       |-- create-investor-profile.dto.ts
|       |   |       |-- submit-kyc.dto.ts
|       |   |
|       |   |-- farms/                    # Farm module
|       |   |   |-- farms.module.ts
|       |   |   |-- farms.controller.ts
|       |   |   |-- farms.service.ts
|       |   |   |-- dto/
|       |   |       |-- create-farm.dto.ts
|       |   |       |-- update-farm.dto.ts
|       |   |       |-- farm-filter.dto.ts
|       |   |
|       |   |-- crops/                    # Crop module
|       |   |   |-- crops.module.ts
|       |   |   |-- crops.controller.ts
|       |   |   |-- crops.service.ts
|       |   |
|       |   |-- projects/                 # Project module
|       |   |   |-- projects.module.ts
|       |   |   |-- projects.controller.ts
|       |   |   |-- projects.service.ts
|       |   |   |-- dto/
|       |   |       |-- create-project.dto.ts
|       |   |       |-- create-milestone.dto.ts
|       |   |
|       |   |-- deals/                    # Deal module (core)
|       |   |   |-- deals.module.ts
|       |   |   |-- deals.controller.ts
|       |   |   |-- deals.service.ts
|       |   |   |-- dto/
|       |   |   |   |-- create-deal.dto.ts
|       |   |   |   |-- update-deal.dto.ts
|       |   |   |   |-- deal-filter.dto.ts
|       |   |   |-- events/
|       |   |   |   |-- deal.events.ts
|       |   |   |-- state-machine/
|       |   |       |-- deal-state-machine.ts
|       |   |       |-- deal.transitions.ts
|       |   |
|       |   |-- investments/              # Investment module
|       |   |   |-- investments.module.ts
|       |   |   |-- investments.controller.ts
|       |   |   |-- investments.service.ts
|       |   |   |-- dto/
|       |   |   |   |-- create-investment.dto.ts
|       |   |   |-- events/
|       |   |       |-- investment.events.ts
|       |   |
|       |   |-- payments/                 # Payment module
|       |   |   |-- payments.module.ts
|       |   |   |-- payments.controller.ts
|       |   |   |-- payments.service.ts
|       |   |   |-- providers/
|       |   |   |   |-- stripe.provider.ts
|       |   |   |   |-- paypal.provider.ts
|       |   |   |-- dto/
|       |   |   |   |-- create-payment.dto.ts
|       |   |   |-- events/
|       |   |       |-- payment.events.ts
|       |   |
|       |   |-- wallets/                  # Wallet module
|       |   |   |-- wallets.module.ts
|       |   |   |-- wallets.controller.ts
|       |   |   |-- wallets.service.ts
|       |   |   |-- dto/
|       |   |       |-- connect-wallet.dto.ts
|       |   |
|       |   |-- ledger/                   # Ledger module (double-entry)
|       |   |   |-- ledger.module.ts
|       |   |   |-- ledger.controller.ts
|       |   |   |-- ledger.service.ts
|       |   |   |-- dto/
|       |   |       |-- create-account.dto.ts
|       |   |       |-- create-transaction.dto.ts
|       |   |       |-- ledger-filter.dto.ts
|       |   |
|       |   |-- escrow/                   # Escrow module
|       |   |   |-- escrow.module.ts
|       |   |   |-- escrow.controller.ts
|       |   |   |-- escrow.service.ts
|       |   |   |-- dto/
|       |   |
|       |   |-- settlements/              # Settlement module
|       |   |   |-- settlements.module.ts
|       |   |   |-- settlements.controller.ts
|       |   |   |-- settlements.service.ts
|       |   |   |-- dto/
|       |   |       |-- withdrawal.dto.ts
|       |   |
|       |   |-- profits/                  # Profit module
|       |   |   |-- profits.module.ts
|       |   |   |-- profits.controller.ts
|       |   |   |-- profits.service.ts
|       |   |   |-- dto/
|       |   |       |-- calculate-profit.dto.ts
|       |   |       |-- record-revenue.dto.ts
|       |   |       |-- record-expense.dto.ts
|       |   |       |-- record-harvest.dto.ts
|       |   |       |-- record-sale.dto.ts
|       |   |
|       |   |-- blockchain/               # Blockchain module
|       |   |   |-- blockchain.module.ts
|       |   |   |-- blockchain.controller.ts
|       |   |   |-- blockchain.service.ts
|       |   |   |-- indexer.service.ts
|       |   |   |-- dto/
|       |   |   |-- events/
|       |   |       |-- blockchain.events.ts
|       |   |
|       |   |-- oracle/                   # Oracle module
|       |   |   |-- oracle.module.ts
|       |   |   |-- oracle.controller.ts
|       |   |   |-- oracle.service.ts
|       |   |   |-- dto/
|       |   |
|       |   |-- notifications/            # Notification module
|       |   |   |-- notifications.module.ts
|       |   |   |-- notifications.controller.ts
|       |   |   |-- notifications.service.ts
|       |   |   |-- providers/
|       |   |   |   |-- email.provider.ts
|       |   |   |   |-- sms.provider.ts
|       |   |   |   |-- push.provider.ts
|       |   |   |-- dto/
|       |   |   |-- templates/
|       |   |       |-- welcome.hbs
|       |   |       |-- investment-confirmed.hbs
|       |   |       |-- profit-distribution.hbs
|       |   |       |-- password-reset.hbs
|       |   |
|       |   |-- audit/                    # Audit module
|       |   |   |-- audit.module.ts
|       |   |   |-- audit.controller.ts
|       |   |   |-- audit.service.ts
|       |   |   |-- dto/
|       |   |
|       |   |-- admin/                    # Admin module
|       |   |   |-- admin.module.ts
|       |   |   |-- admin.controller.ts
|       |   |   |-- admin.service.ts
|       |   |
|       |   |-- common/                   # Shared utilities
|       |   |   |-- decorators/
|       |   |   |   |-- roles.decorator.ts
|       |   |   |   |-- current-user.decorator.ts
|       |   |   |   |-- idempotent.decorator.ts
|       |   |   |   |-- api-paginated.decorator.ts
|       |   |   |-- filters/
|       |   |   |   |-- http-exception.filter.ts
|       |   |   |   |-- prisma-exception.filter.ts
|       |   |   |   |-- blockchain-exception.filter.ts
|       |   |   |-- guards/
|       |   |   |   |-- jwt-auth.guard.ts
|       |   |   |   |-- roles.guard.ts
|       |   |   |   |-- throttler.guard.ts
|       |   |   |-- interceptors/
|       |   |   |   |-- logging.interceptor.ts
|       |   |   |   |-- transform.interceptor.ts
|       |   |   |   |-- timeout.interceptor.ts
|       |   |   |   |-- cache.interceptor.ts
|       |   |   |-- middleware/
|       |   |   |   |-- request-id.middleware.ts
|       |   |   |   |-- cors.middleware.ts
|       |   |   |-- pipes/
|       |   |   |   |-- validation.pipe.ts
|       |   |   |   |-- parse-uuid.pipe.ts
|       |   |   |-- utils/
|       |   |       |-- crypto.util.ts
|       |   |       |-- date.util.ts
|       |   |       |-- pagination.util.ts
|       |   |       |-- blockchain.util.ts
|       |   |
|       |   |-- queue/                    # Queue configuration
|       |   |   |-- queue.module.ts
|       |   |   |-- workers/
|       |   |   |   |-- email.worker.ts
|       |   |   |   |-- blockchain.worker.ts
|       |   |   |   |-- payment.worker.ts
|       |   |   |   |-- settlement.worker.ts
|       |   |   |   |-- notification.worker.ts
|       |   |   |   |-- audit.worker.ts
|       |   |   |   |-- reconciliation.worker.ts
|       |   |   |-- schedulers/
|       |   |       |-- blockchain-indexer.scheduler.ts
|       |   |       |-- reconciliation.scheduler.ts
|       |   |       |-- cleanup.scheduler.ts
|       |   |
|       |   |-- config/                   # Configuration
|       |       |-- database.config.ts
|       |       |-- redis.config.ts
|       |       |-- jwt.config.ts
|       |       |-- blockchain.config.ts
|       |       |-- storage.config.ts
|       |       |-- payment.config.ts
|       |       |-- notification.config.ts
|       |
|       |-- prisma/
|       |   |-- schema.prisma            # Prisma schema (all 48 tables)
|       |   |-- migrations/              # Database migrations
|       |   |   |-- 20240101000000_init/
|       |   |   |-- 20240115000000_add_deals/
|       |   |   |-- 20240120000000_add_investments/
|       |   |   |-- ...
|       |   |-- seed.ts                  # Database seeding
|       |   |-- seed-data/
|       |       |-- roles.ts
|       |       |-- permissions.ts
|       |       |-- crops.ts
|       |       |-- admin-user.ts
|       |
|       |-- test/
|       |   |-- unit/                   # Unit tests
|       |   |   |-- auth/
|       |   |   |-- deals/
|       |   |   |-- investments/
|       |   |   |-- ledger/
|       |   |   |-- ...
|       |   |-- integration/            # Integration tests
|       |   |   |-- auth.integration.spec.ts
|       |   |   |-- deals.integration.spec.ts
|       |   |   |-- investments.integration.spec.ts
|       |   |   |-- payments.integration.spec.ts
|       |   |   |-- ledger.integration.spec.ts
|       |   |   |-- blockchain.integration.spec.ts
|       |   |-- e2e/                    # End-to-end tests
|       |   |   |-- deal-lifecycle.e2e-spec.ts
|       |   |   |-- investment-flow.e2e-spec.ts
|       |   |   |-- payment-flow.e2e-spec.ts
|       |   |-- fixtures/               # Test fixtures
|       |       |-- users.fixture.ts
|       |       |-- deals.fixture.ts
|       |       |-- investments.fixture.ts
|       |
|       |-- Dockerfile                  # Multi-stage Docker build
|       |-- tsconfig.json
|       |-- tsconfig.build.json
|       |-- nest-cli.json
|       |-- package.json
|
|-- packages/                            # Shared packages (Turborepo)
|   |-- ui/                              # Shared UI components
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- button/
|   |   |   |-- card/
|   |   |   |-- dialog/
|   |   |-- package.json
|   |
|   |-- types/                           # Shared TypeScript types
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- user.types.ts
|   |   |   |-- deal.types.ts
|   |   |   |-- investment.types.ts
|   |   |   |-- financial.types.ts
|   |   |   |-- blockchain.types.ts
|   |   |-- package.json
|   |
|   |-- config/                          # Shared configuration
|   |   |-- src/
|   |   |   |-- index.ts
|   |   |   |-- env.ts                  # Environment validation (Zod)
|   |   |   |-- constants.ts
|   |   |-- package.json
|   |
|   |-- blockchain-sdk/                  # Blockchain interaction SDK
|       |-- src/
|       |   |-- index.ts
|       |   |-- client.ts               # Ethereum client (viem)
|       |   |-- contracts/
|       |   |   |-- project-registry.ts
|       |   |   |-- deal-factory.ts
|       |   |   |-- deal-contract.ts
|       |   |   |-- ownership-token.ts
|       |   |   |-- escrow-contract.ts
|       |   |   |-- profit-distribution.ts
|       |   |   |-- oracle.ts
|       |   |-- events/
|       |   |   |-- event-listener.ts
|       |   |   |-- event-parser.ts
|       |   |   |-- event-handlers.ts
|       |   |-- utils/
|       |   |   |-- gas.ts
|       |   |   |-- wallet.ts
|       |   |   |-- ipfs.ts
|       |   |-- abis/                    # Contract ABIs (generated)
|       |       |-- ProjectRegistry.json
|       |       |-- DealFactory.json
|       |       |-- DealContract.json
|       |       |-- OwnershipToken.json
|       |       |-- EscrowContract.json
|       |       |-- ProfitDistribution.json
|       |       |-- Oracle.json
|       |-- package.json
|
|-- contracts/                           # Solidity Smart Contracts
|   |-- src/
|   |   |-- ProjectRegistry.sol
|   |   |-- DealFactory.sol
|   |   |-- DealContract.sol
|   |   |-- OwnershipToken.sol          # ERC-721
|   |   |-- EscrowContract.sol
|   |   |-- ProfitDistribution.sol
|   |   |-- Oracle.sol
|   |   |-- interfaces/
|   |   |   |-- IProjectRegistry.sol
|   |   |   |-- IDealFactory.sol
|   |   |   |-- IDealContract.sol
|   |   |   |-- IOwnershipToken.sol
|   |   |   |-- IEscrowContract.sol
|   |   |   |-- IProfitDistribution.sol
|   |   |   |-- IOracle.sol
|   |   |-- libraries/
|   |   |   |-- Math.sol
|   |   |   |-- Strings.sol
|   |   |-- mocks/
|   |       |-- MockERC20.sol
|   |       |-- MockOracle.sol
|   |
|   |-- test/
|   |   |-- ProjectRegistry.t.sol
|   |   |-- DealFactory.t.sol
|   |   |-- DealContract.t.sol
|   |   |-- OwnershipToken.t.sol
|   |   |-- EscrowContract.t.sol
|   |   |-- ProfitDistribution.t.sol
|   |   |-- Oracle.t.sol
|   |   |-- integration/
|   |   |   |-- DealLifecycle.t.sol
|   |   |   |-- InvestmentFlow.t.sol
|   |   |-- invariant/
|   |       |-- DealInvariant.t.sol
|   |       |-- EscrowInvariant.t.sol
|   |
|   |-- script/
|   |   |-- Deploy.s.sol               # Deployment script
|   |   |-- Upgrade.s.sol              # Upgrade script
|   |   |-- Verify.s.sol               # Etherscan verification
|   |
|   |-- lib/                            # Foundry dependencies
|   |   |-- forge-std/
|   |   |-- openzeppelin-contracts/
|   |
|   |-- foundry.toml                    # Foundry configuration
|   |-- remappings.txt
|
|-- infrastructure/
|   |-- docker/
|   |   |-- docker-compose.yml          # Development
|   |   |-- docker-compose.prod.yml     # Production overrides
|   |   |-- Dockerfile.web              # Next.js multi-stage build
|   |   |-- Dockerfile.api              # NestJS multi-stage build
|   |   |-- Dockerfile.worker           # BullMQ worker build
|   |
|   |-- nginx/
|   |   |-- nginx.conf                  # Main Nginx config
|   |   |-- conf.d/
|   |   |   |-- default.conf            # Server blocks
|   |   |   |-- rate-limit.conf         # Rate limiting zones
|   |   |   |-- security.conf           # Security headers
|   |   |   |-- ssl.conf                # SSL configuration
|   |
|   |-- terraform/                      # Infrastructure as Code
|   |   |-- main.tf
|   |   |-- variables.tf
|   |   |-- outputs.tf
|   |   |-- vpc.tf
|   |   |-- ecs.tf
|   |   |-- rds.tf
|   |   |-- elasticache.tf
|   |   |-- s3.tf
|   |   |-- cloudfront.tf
|   |   |-- route53.tf
|   |   |-- acm.tf
|   |   |-- iam.tf
|   |   |-- secrets.tf
|   |   |-- monitoring.tf
|   |   |-- environments/
|   |       |-- dev.tfvars
|   |       |-- staging.tfvars
|   |       |-- prod.tfvars
|   |
|   |-- monitoring/
|   |   |-- prometheus/
|   |   |   |-- prometheus.yml
|   |   |   |-- alert-rules.yml
|   |   |-- grafana/
|   |       |-- provisioning/
|   |       |   |-- dashboards/
|   |       |   |   |-- api-overview.json
|   |       |   |   |-- database.json
|   |       |   |   |-- blockchain.json
|   |       |   |   |-- business-metrics.json
|   |       |   |-- datasources/
|   |       |       |-- prometheus.yml
|   |       |-- dashboards/
|   |           |-- api-overview.json
|   |           |-- database.json
|   |
|   |-- scripts/
|       |-- setup-dev.sh                # Development setup script
|       |-- seed-db.sh                  # Database seeding
|       |-- backup-db.sh                # Database backup
|       |-- deploy.sh                   # Deployment helper
|
|-- docs/
|   |-- architecture/
|   |   |-- 01-system-architecture.md
|   |   |-- 02-component-architecture.md
|   |   |-- 04-deal-lifecycle.md
|   |   |-- 05-transaction-lifecycle.md
|   |   |-- 06-financial-ledger-model.md
|   |   |-- 08-api-specification.md
|   |   |-- 11-deployment-architecture.md
|   |   |-- 12-folder-structure.md
|   |
|   |-- database/
|   |   |-- 03-er-diagram.md
|   |
|   |-- blockchain/
|   |   |-- 07-smart-contract-architecture.md
|   |
|   |-- security/
|   |   |-- 09-security-architecture.md
|   |   |-- 10-threat-model.md
|   |
|   |-- api/
|       |-- openapi.yaml                # OpenAPI 3.0 spec (auto-generated)
|
|-- .github/
|   |-- workflows/
|   |   |-- ci.yml                      # Main CI pipeline
|   |   |-- deploy-staging.yml          # Staging deployment
|   |   |-- deploy-production.yml       # Production deployment
|   |   |-- contracts-ci.yml            # Smart contract CI
|   |   |-- dependency-review.yml       # Dependency security review
|   |
|   |-- CODEOWNERS
|   |-- pull_request_template.md
|   |-- ISSUE_TEMPLATE/
|       |-- bug_report.md
|       |-- feature_request.md
|
|-- .vscode/
|   |-- settings.json
|   |-- extensions.json
|   |-- launch.json                     # Debug configurations
|
|-- .env.example                        # Environment variable template
|-- .gitignore
|-- .eslintrc.js                        # Root ESLint config
|-- .prettierrc                         # Root Prettier config
|-- turbo.json                          # Turborepo pipeline config
|-- package.json                        # Root package.json (monorepo)
|-- pnpm-workspace.yaml                 # pnpm workspace config
|-- pnpm-lock.yaml
|-- tsconfig.base.json                  # Base TypeScript config
|-- README.md
|-- LICENSE
```

---

## Key File Purposes

| File/Directory | Purpose |
|---|---|
| `turbo.json` | Turborepo pipeline configuration (build, test, lint) |
| `pnpm-workspace.yaml` | Workspace package definitions |
| `tsconfig.base.json` | Shared TypeScript configuration |
| `.env.example` | Template for environment variables |
| `apps/api/prisma/schema.prisma` | Single source of truth for database schema |
| `apps/api/prisma/migrations/` | Versioned database migrations |
| `contracts/foundry.toml` | Solidity compiler and test configuration |
| `infrastructure/terraform/` | Production infrastructure definitions |
| `.github/workflows/ci.yml` | CI pipeline triggered on all PRs |
| `packages/blockchain-sdk/` | Shared blockchain utilities (used by API and contracts) |
| `packages/types/` | Shared TypeScript types (used by web and API) |
