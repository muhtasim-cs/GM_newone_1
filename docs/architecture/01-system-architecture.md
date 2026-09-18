# System Architecture

## Overview

The Agriculture Profit-Sharing Platform is a hybrid Web2+Web3 application that connects farmers seeking capital with investors seeking agricultural returns. The system uses a Next.js frontend, NestJS API backend, PostgreSQL database, and EVM-compatible blockchain for deal contracts and profit distribution.

---

## High-Level System Architecture Diagram

```
SYSTEM ARCHITECTURE DIAGRAM
============================

                        ┌─────────────────────┐
                        │     USERS           │
                        │ Farmers | Investors │
                        │    Admin | Guests   │
                        └──────────┬──────────┘
                                   │
                                   │ HTTPS (443)
                                   │
                        ┌──────────▼──────────┐
                        │   CDN / WAF         │
                        │   Cloudflare        │
                        │                     │
                        │   DDoS Protection   │
                        │   Bot Mitigation    │
                        │   Edge Caching      │
                        │   SSL Termination   │
                        └──────────┬──────────┘
                                   │
                                   │ HTTP/2
                                   │
                        ┌──────────▼──────────┐
                        │   Nginx Gateway     │
                        │                     │
                        │   Rate Limiting     │
                        │   Reverse Proxy     │
                        │   Request Routing   │
                        │   Health Checks     │
                        │   Request Logging   │
                        └──────────┬──────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                 │
                  │ /api/*         │ /app/*          │ /health
                  │                │                 │
         ┌────────▼────────┐              ┌─────────▼─────────┐
         │  Next.js SSR    │              │  NestJS API       │
         │  Frontend       │◄────────────►│  REST API         │
         │                 │   Internal   │  OpenAPI/Swagger  │
         │  App Router     │   HTTP       │  Modular Monolith │
         │  SSR / RSC      │              │  25+ Modules      │
         │  Tailwind/shadcn│              │                   │
         │  Wagmi/Rainbowkit│             │  Passport.js      │
         └────────┬────────┘              └─────────┬─────────┘
                  │                                  │
                  │ Prisma Client / HTTP             │
                  │                                  │
                  │  ┌───────────────────────────────┼───────────────────────────────┐
                  │  │               │               │               │               │
                  │  │               │               │               │               │
         ┌────────▼───┐  ┌──────────▼──┐  ┌────────▼─────┐  ┌──────▼──────┐  ┌─────▼──────────┐
         │ PostgreSQL │  │    Redis    │  │  BullMQ      │  │  S3 / R2    │  │  Blockchain    │
         │            │  │             │  │              │  │  Storage    │  │  Service       │
         │ Primary DB │  │ Cache       │  │  Job Queues  │  │             │  │                │
         │ Read Replica│ │ Locking     │  │  Workers     │  │  Files      │  │  RPC Provider  │
         │            │  │ Sessions    │  │  Schedulers  │  │  Documents  │  │  (Alchemy/     │
         │ Users      │  │ Pub/Sub     │  │              │  │  Images     │  │   Infura)      │
         │ Farms      │  │ Rate Limit  │  │  Email Jobs  │  │  Backups    │  │                │
         │ Deals      │  │ State       │  │  Blockchain  │  │             │  │  EVM Chain     │
         │ Ledger     │  │             │  │  Reconcile   │  │  CDN Origin │  │  (Sepolia/     │
         │ ...        │  │             │  │  Settlement  │  │             │  │   Polygon)     │
         └────────────┘  └─────────────┘  └──────────────┘  └─────────────┘  └────────┬───────┘
                                                                                       │
                                                                              ┌────────▼────────┐
                                                                              │   EVM Chain     │
                                                                              │                 │
                                                                              │  ProjectRegistry│
                                                                              │  DealFactory    │
                                                                              │  DealContract   │
                                                                              │  OwnershipNFT   │
                                                                              │  Escrow         │
                                                                              │  ProfitDistrib. │
                                                                              │  Oracle         │
                                                                              └─────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Technology | Purpose |
|---|---|
| Next.js 14+ (App Router) | SSR/SSG framework, React Server Components |
| React 18 | UI library |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Component library (Radix UI + Tailwind) |
| Wagmi v2 | Ethereum wallet connection hooks |
| RainbowKit | Wallet connect UI modal |
| Viem | TypeScript Ethereum library (used by Wagmi) |
| TanStack Query (React Query) | Server state management, caching |
| Zustand | Client state management |
| Zod | Schema validation |
| React Hook Form | Form management |
| Recharts / D3 | Data visualization (dashboards) |
| next-intl | Internationalization |

### Rendering Strategy

```
RENDERING STRATEGY
==================

┌──────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Server Components (RSC)                                  │
│  ├── Landing page (/)                                     │
│  ├── Deal listings (/deals)                               │
│  ├── Deal detail (/deals/[id])                            │
│  ├── Farm listings (/farms)                               │
│  ├── Dashboard layout (authenticated)                     │
│  └── Admin pages (/admin/*)                               │
│                                                           │
│  Client Components ('use client')                         │
│  ├── Wallet connect button                                │
│  ├── Investment form                                      │
│  ├── Payment forms                                         │
│  ├── Real-time dashboards                                 │
│  ├── Notification center                                  │
│  ├── File upload components                               │
│  └── Interactive data tables                              │
│                                                           │
│  Static Generation (ISR)                                  │
│  ├── Public farm profiles                                 │
│  ├── Crop catalog                                         │
│  ├── Platform terms and conditions                        │
│  └── SEO landing pages                                    │
│                                                           │
│  Dynamic Routes                                           │
│  ├── /dashboard/* - User dashboards                       │
│  ├── /farms/[id]/* - Farm management                      │
│  ├── /deals/[id]/* - Deal management                      │
│  ├── /investments/* - Investment tracking                  │
│  └── /admin/* - Admin panel                               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Wallet Integration Flow

```
WALLET INTEGRATION
==================

User clicks "Connect Wallet"
        │
        ▼
┌───────────────────┐
│  RainbowKit Modal │──── Shows available wallets
│  (Wallet Select)  │     (MetaMask, WalletConnect,
└───────┬───────────┘      Coinbase, etc.)
        │
        │ User selects wallet
        ▼
┌───────────────────┐
│  Wallet Extension │──── Requests connection
│  (e.g., MetaMask) │
└───────┬───────────┘
        │ User approves
        ▼
┌───────────────────┐
│  Wagmi Connector  │──── Provides:
│  (useAccount)     │     - address
│                   │     - chain
│                   │     - isConnected
└───────┬───────────┘     - provider
        │
        │ Backend verification
        ▼
┌───────────────────┐
│  Auth Service     │──── Signs message → verifies →
│  (SIWE / JWT)     │     issues JWT token
└───────────────────┘
```

### Frontend Route Structure

```
src/app/
├── layout.tsx                          # Root layout (providers, theme)
├── page.tsx                            # Landing page (/)
├── (marketing)/
│   ├── about/page.tsx
│   ├── how-it-works/page.tsx
│   └── contact/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (platform)/
│   ├── layout.tsx                      # Authenticated layout
│   ├── dashboard/page.tsx              # Role-based dashboard
│   ├── deals/
│   │   ├── page.tsx                    # Deal listings
│   │   └── [id]/
│   │       ├── page.tsx                # Deal detail
│   │       ├── invest/page.tsx         # Investment form
│   │       └── manage/page.tsx         # Deal management
│   ├── farms/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── investments/page.tsx
│   ├── wallet/page.tsx
│   └── notifications/page.tsx
├── (farmer)/
│   ├── layout.tsx                      # Farmer-only layout
│   ├── farms/
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── projects/
│   │   ├── new/page.tsx
│   │   └── [id]/manage/page.tsx
│   └── profile/page.tsx
├── (investor)/
│   ├── layout.tsx                      # Investor-only layout
│   ├── portfolio/page.tsx
│   ├── kyc/page.tsx
│   └── settlements/page.tsx
├── (admin)/
│   ├── layout.tsx                      # Admin-only layout
│   ├── dashboard/page.tsx
│   ├── farmers/page.tsx
│   ├── deals/page.tsx
│   └── reconciliation/page.tsx
└── api/                                # API routes (proxy/SSR)
    └── auth/[...nextauth]/route.ts
```

---

## API Gateway Layer

### Nginx Configuration

```
NGINX GATEWAY ARCHITECTURE
===========================

Client Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│                   Nginx                          │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐ │
│  │  SSL Termination│   │  Rate Limiting       │ │
│  │  (TLS 1.3)      │   │                      │ │
│  │                 │   │  /api/*: 100 req/min  │ │
│  │  HSTS Headers   │   │  /auth/*: 10 req/min  │ │
│  │  OCSP Stapling  │   │  /upload/*: 20 req/min│ │
│  └─────────────────┘   │  /webhook/*: unlimited│ │
│                         └──────────────────────┘ │
│                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐ │
│  │  Request Logging│   │  Gzip Compression    │ │
│  │  Access Logs    │   │                      │ │
│  │  Error Logs     │   │  text/html           │ │
│  │  Request ID     │   │  application/json    │ │
│  └─────────────────┘   │  application/javascript│ │
│                         └──────────────────────┘ │
│                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐ │
│  │  Security       │   │  Request Routing     │ │
│  │                 │   │                      │ │
│  │  X-Frame-Options│   │  /api/* → api:3000   │ │
│  │  X-Content-Type │   │  /app/* → web:3000   │ │
│  │  CSP Headers    │   │  /ws/*  → api:3000   │ │
│  │  XSS Protection │   │  /health → api:3000  │ │
│  └─────────────────┘   └──────────────────────┘ │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Nginx Upstream Configuration

```nginx
# Upstream definitions
upstream api_backend {
    least_conn;
    server api:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream web_backend {
    least_conn;
    server web:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=20r/m;

# API routes
location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Request-ID $request_id;
    proxy_read_timeout 60s;
    proxy_connect_timeout 10s;
}

# Auth routes (stricter rate limiting)
location /api/v1/auth/ {
    limit_req zone=auth_limit burst=5 nodelay;
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Request-ID $request_id;
}

# Webhook routes (no rate limiting, IP whitelist)
location /api/v1/payments/webhook {
    allow 54.230.192.0/18;    # Stripe
    allow 35.190.247.0/24;    # PayPal
    deny all;
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Frontend routes
location / {
    proxy_pass http://web_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
}

# Health check
location /health {
    access_log off;
    return 200 'OK';
    add_header Content-Type text/plain;
}
```

---

## Backend Architecture

### NestJS Modular Monolith

```
NESTJS MODULAR MONOLITH ARCHITECTURE
=====================================

┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Application                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Request Pipeline                       │   │
│  │                                                           │   │
│  │  Request → Middleware → Guard → Interceptor → Pipe →      │   │
│  │  Controller → Service → Repository → Response             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Global Middleware                       │   │
│  │                                                           │   │
│  │  helmet()          - Security headers                    │   │
│  │  cors()            - Cross-origin policy                 │   │
│  │  compression()     - Gzip compression                    │   │
│  │  morgan()          - HTTP request logging                │   │
│  │  requestId()       - Correlation ID injection            │   │
│  │  swaggerCustomizer - API docs configuration              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Global Guards                          │   │
│  │                                                           │   │
│  │  ThrottlerGuard     - Rate limiting                      │   │
│  │  JwtAuthGuard       - JWT authentication                 │   │
│  │  RolesGuard         - Role-based access control          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Global Filters                         │   │
│  │                                                           │   │
│  │  HttpExceptionFilter - Standardized error responses      │   │
│  │  PrismaFilter       - Database error handling            │   │
│  │  BlockchainFilter   - Blockchain error handling          │   │
│  │  SentryFilter       - Error reporting                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Global Interceptors                    │   │
│  │                                                           │   │
│  │  LoggingInterceptor    - Request/response logging        │   │
│  │  TransformInterceptor  - Response transformation         │   │
│  │  TimeoutInterceptor    - Request timeout handling        │   │
│  │  CacheInterceptor      - Response caching                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Module Registry                        │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Auth    │  │  Users   │  │  Farmer  │  │ Investor ││   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Farm    │  │  Crop    │  │ Project  │  │  Deal    ││   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │Investment│  │ Payment  │  │  Wallet  │  │  Ledger  ││   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Escrow   │  │Settlement│  │  Profit  │  │Blockchain││   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Oracle  │  │  Notif.  │  │  Audit   │  │  Admin   ││   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │  Health  │  │ Schedule │  │  Queue   │              │   │
│  │  │  Module  │  │  Module  │  │  Module  │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Shared Modules                          │   │
│  │                                                           │   │
│  │  PrismaModule        - Database ORM                      │   │
│  │  RedisModule         - Caching, locking, pub/sub         │   │
│  │  BullModule          - Job queues                        │   │
│  │  SentryModule        - Error tracking                    │   │
│  │  ThrottlerModule     - Rate limiting                     │   │
│  │  ScheduleModule      - Cron jobs, delays                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Module Dependency Graph

```
MODULE DEPENDENCY GRAPH
========================

                    ┌──────┐
                    │ Auth │
                    └──┬───┘
                       │
            ┌──────────┼──────────┐
            │          │          │
         ┌──▼──┐   ┌──▼──┐   ┌──▼────────┐
         │Users│   │Audit│   │Notification│
         └──┬──┘   └─────┘   └─────┬──────┘
            │                       │
      ┌─────┼─────┐                 │
      │           │                 │
   ┌──▼────┐  ┌──▼─────┐           │
   │Farmer │  │Investor│           │
   └──┬────┘  └──┬─────┘           │
      │          │                  │
   ┌──▼────┐  ┌──▼─────┐           │
   │ Farms │  │  KYC   │           │
   └──┬────┘  └────────┘           │
      │                            │
   ┌──▼────┐                       │
   │Projects│──────────────────────┤
   └──┬────┘                       │
      │                            │
   ┌──▼────┐  ┌─────────┐          │
   │ Deals │◄─│Blockchain│         │
   └──┬────┘  └────┬────┘          │
      │            │               │
   ┌──▼───────────┐│               │
   │ Investments  ││               │
   └──┬───────────┘│               │
      │            │               │
   ┌──▼────┐  ┌───▼────┐          │
   │Payment│  │ Escrow │          │
   └──┬────┘  └───┬────┘          │
      │           │               │
   ┌──▼────┐  ┌───▼──────┐        │
   │Wallet │  │ Settlement│       │
   └───────┘  └───┬──────┘        │
                  │               │
              ┌───▼──────┐        │
              │  Profit  │────────┘
              │  Ledger  │
              └──────────┘
```

### Request Processing Pipeline

```
REQUEST PROCESSING PIPELINE
=============================

HTTP Request
    │
    ▼
┌────────────────────┐
│ Nginx              │──→ SSL Termination, Rate Limit, Logging
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ NestJS Middleware   │──→ helmet, cors, compression, requestId
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Passport Guard      │──→ JWT Strategy → Extract & Validate Token
│ (JwtAuthGuard)      │──→ Attach User to Request
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Roles Guard         │──→ Check @Roles() decorator against user roles
│ (RolesGuard)        │──→ Throw ForbiddenException if unauthorized
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Interceptor(s)      │──→ Logging: log request start
│                     │──→ Timeout: enforce 30s timeout
│                     │──→ Cache: check cache, return if hit
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Pipe(s)             │──→ ValidationPipe: validate DTO with class-validator
│                     │──→ TransformPipe: parse/transform input
│                     │──→ ParseUUIDPipe: validate UUID params
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Controller          │──→ Route handler
│                     │──→ Extract request data
│                     │──→ Call service method
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Service             │──→ Business logic
│                     │──→ Validate business rules
│                     │──→ Call repository/external services
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Prisma Repository   │──→ Database queries
│ (PrismaService)     │──→ Transaction management
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Response Transform  │──→ Format response to API envelope
│ Interceptor         │──→ { success, data, meta }
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Exception Filter    │──→ Catch any unhandled errors
│                     │──→ Format error response
│                     │──→ Log to Sentry
└─────────┬──────────┘
          │
          ▼
    HTTP Response
```

---

## Data Layer

### PostgreSQL Database

```
POSTGRESQL ARCHITECTURE
========================

┌──────────────────────────────────────────────────────────┐
│                    PostgreSQL Cluster                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐       ┌─────────────────┐          │
│  │   Primary       │──────►│  Read Replica    │          │
│  │   (Read/Write)  │  WAL  │  (Read Only)     │          │
│  │                 │ Share  │                   │          │
│  │  - All writes   │       │  - Dashboard     │          │
│  │  - Transactions │       │  - Reports       │          │
│  │  - Migrations   │       │  - Analytics     │          │
│  └─────────────────┘       └─────────────────┘          │
│                                                           │
│  Connection Pool: PgBouncer                               │
│  ├── Min connections: 5                                   │
│  ├── Max connections: 20                                  │
│  └── Transaction pooling mode                            │
│                                                           │
│  Prisma ORM                                               │
│  ├── Schema-first approach                                │
│  ├── Migrations via prisma migrate                        │
│  ├── Connection pool ( PgBouncer)                         │
│  └── Generated client                                     │
│                                                           │
└──────────────────────────────────────────────────────────┘

Database Schema: 45+ tables
├── Authentication: users, roles, permissions, user_roles
├── Profiles: farmer_profiles, investor_profiles
├── Assets: farms, farm_documents, crops
├── Projects: agricultural_projects, project_documents, project_milestones
├── Deals: deals, deal_terms, deal_participants
├── Investments: investments, investment_units, investment_transactions
├── Payments: payments, payment_attempts, payment_webhooks
├── Wallets: wallets, wallet_transactions
├── Financial: accounts, ledger_entries, ledger_transactions
├── Escrow: escrow_accounts, escrow_transactions
├── Operations: expenses, expense_documents, harvests, sales, revenues
├── Profit: profit_calculations, profit_distributions, settlements, withdrawals
├── Blockchain: blockchain_transactions, blockchain_events, smart_contracts, oracle_attestations
├── System: notifications, audit_logs, idempotency_keys
```

### Redis Architecture

```
REDIS ARCHITECTURE
==================

┌──────────────────────────────────────────────────────────┐
│                    Redis Cluster                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Use Cases:                                               │
│                                                           │
│  1. Session Store                                         │
│     └── Session:{userId} → { user data, expiry }         │
│                                                           │
│  2. Token Blacklist (Logout)                              │
│     └── blacklist:{tokenJti} → "1" (TTL = token expiry)  │
│                                                           │
│  3. Rate Limiting                                         │
│     └── ratelimit:{ip}:{endpoint} → count (TTL = window)  │
│                                                           │
│  4. Distributed Locking                                   │
│     └── lock:{resource} → { holder, expiry }              │
│     └── Used for: deal approval, profit calculation       │
│                                                           │
│  5. Cache                                                 │
│     ├── deal:{id} → { deal data } (TTL = 5min)           │
│     ├── farm:{id} → { farm data } (TTL = 10min)          │
│     ├── user:{id} → { user data } (TTL = 5min)           │
│     └── crop:list → [ crop data ] (TTL = 1hr)            │
│                                                           │
│  6. Pub/Sub (Event Bus)                                   │
│     ├── channels:                                         │
│     │   ├── deal:created                                  │
│     │   ├── deal:approved                                 │
│     │   ├── deal:published                                │
│     │   ├── investment:created                            │
│     │   ├── investment:confirmed                          │
│     │   ├── payment:completed                             │
│     │   ├── profit:calculated                             │
│     │   └── blockchain:event                              │
│     └── Subscribers: notification workers, audit workers   │
│                                                           │
│  7. Real-time State                                       │
│     └── deal:funding:{dealId} → { amount, investors }     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Object Storage (S3/R2)

```
OBJECT STORAGE ARCHITECTURE
===========================

┌──────────────────────────────────────────────────────────┐
│              S3 / Cloudflare R2                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Buckets:                                                 │
│                                                           │
│  agri-platform-documents/                                 │
│  ├── farmer-documents/                                    │
│  │   └── {farmerId}/{docType}/{uuid}.{ext}               │
│  ├── farm-documents/                                      │
│  │   └── {farmId}/{docType}/{uuid}.{ext}                 │
│  ├── project-documents/                                   │
│  │   └── {projectId}/{docType}/{uuid}.{ext}              │
│  ├── kyc-documents/                                       │
│  │   └── {userId}/{docType}/{uuid}.{ext}                 │
│  └── deal-documents/                                      │
│      └── {dealId}/{docType}/{uuid}.{ext}                 │
│                                                           │
│  agri-platform-uploads/                                   │
│  ├── profile-images/                                      │
│  │   └── {userId}/{uuid}.{ext}                           │
│  ├── farm-images/                                         │
│  │   └── {farmId}/{uuid}.{ext}                           │
│  └── crop-images/                                         │
│      └── {cropId}/{uuid}.{ext}                           │
│                                                           │
│  Access Control:                                           │
│  ├── Pre-signed URLs (15min expiry) for downloads        │
│  ├── Server-side encryption (AES-256)                     │
│  ├── CORS policies                                         │
│  └── Lifecycle policies (IA after 90d, Glacier after 1yr) │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Blockchain Layer

```
BLOCKCHAIN ARCHITECTURE
========================

┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  RPC Provider                             │   │
│  │                                                           │   │
│  │  Primary: Alchemy (API Key)                              │   │
│  │  Fallback: Infura (API Key)                              │   │
│  │  Local: Hardhat node (development)                        │   │
│  │                                                           │   │
│  │  Network:                                                 │   │
│  │  ├── Development: Hardhat local chain                     │   │
│  │  ├── Staging: Sepolia testnet                             │   │
│  │  └── Production: Polygon (low gas) / Ethereum mainnet     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Smart Contract Suite                         │   │
│  │                                                           │   │
│  │  ProjectRegistry.sol                                      │   │
│  │  └── Register and verify agricultural projects           │   │
│  │                                                           │   │
│  │  DealFactory.sol                                          │   │
│  │  └── Create deal contracts from approved terms           │   │
│  │                                                           │   │
│  │  DealContract.sol (per deal, proxy pattern)              │   │
│  │  └── Store deal terms, track funding, manage lifecycle  │   │
│  │                                                           │   │
│  │  OwnershipToken.sol (ERC-721)                            │   │
│  │  └── Represent investment unit ownership                 │   │
│  │                                                           │   │
│  │  EscrowContract.sol                                       │   │
│  │  └── Hold and release funds per milestones               │   │
│  │                                                           │   │
│  │  ProfitDistribution.sol                                   │   │
│  │  └── Calculate and distribute profits                    │   │
│  │                                                           │   │
│  │  Oracle.sol                                               │   │
│  │  └── Receive off-chain attestations (harvest, sales)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Event Indexing                                │   │
│  │                                                           │   │
│  │  BlockchainService                                        │   │
│  │  ├── Poll for new blocks (every 2s)                       │   │
│  │  ├── Filter contract events                               │   │
│  │  ├── Store events in blockchain_events table              │   │
│  │  ├── Trigger backend workflows                            │   │
│  │  └── Handle chain reorganizations                         │   │
│  │                                                           │   │
│  │  Event Types:                                              │   │
│  │  ├── DealCreated                                          │   │
│  │  ├── InvestmentMade                                       │   │
│  │  ├── FundsReleased                                        │   │
│  │  ├── ProfitDistributed                                    │   │
│  │  ├── MilestoneAttested                                    │   │
│  │  └── OwnershipTransferred                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Key Management                               │   │
│  │                                                           │   │
│  │  Server Wallet (Hot Wallet):                              │   │
│  │  ├── Managed via AWS KMS / Hashicorp Vault               │   │
│  │  ├── Gas station wallet (pays gas for users)             │   │
│  │  ├── Admin multisig wallet (contract upgrades)           │   │
│  │  └── Key derivation: HD wallet (BIP-44)                  │   │
│  │                                                           │   │
│  │  User Wallets:                                            │   │
│  │  ├── User-controlled (MetaMask, etc.)                     │   │
│  │  ├── Platform never holds private keys                    │   │
│  │  └── Sign messages for authentication (SIWE)             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Blockchain Interaction Flow

```
BLOCKCHAIN INTERACTION FLOW
============================

Smart Contract Call (Backend)
    │
    ▼
┌─────────────────┐
│ BlockchainService│
│                  │
│ 1. Build TX     │
│ 2. Sign with    │
│    server wallet │
│ 3. Send via     │
│    RPC provider  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ RPC Provider    │────►│  EVM Chain      │
│ (Alchemy)       │     │  (Polygon)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  txHash               │  Event Emitted
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Store txHash    │     │ Event Listener  │
│ Set status =    │     │ (Polling)       │
│ PENDING         │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │  Wait for             │  Detect event
         │  confirmation         │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Receipt   │     │ Store event in  │
│ (polling)       │     │ blockchain_     │
│                 │     │ events table    │
│ Status:         │     └────────┬────────┘
│ - confirmed     │              │
│ - failed        │              ▼
└────────┬────────┘     ┌─────────────────┐
         │              │ Trigger workflow │
         ▼              │ (BullMQ worker) │
┌─────────────────┐     └─────────────────┘
│ Update TX       │
│ status:         │
│ CONFIRMED/FAILED│
│                 │
│ Emit events     │
│ Update DB       │
└─────────────────┘
```

---

## Message Queue Architecture

```
BULLMQ WORKER ARCHITECTURE
===========================

┌─────────────────────────────────────────────────────────────────┐
│                    BullMQ Queues                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Queues:                                                        │
│                                                                  │
│  ┌──────────────────┐  Worker: 2  Concurrency: 5               │
│  │  email-queue      │  Jobs: sendWelcome, sendInvestmentConfirm │
│  │                   │         sendProfitDistribution, etc.     │
│  └──────────────────┘  Retry: 3x, backoff: exponential         │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 1               │
│  │  blockchain-queue │  Jobs: sendTransaction, checkReceipt     │
│  │                   │         indexEvents, syncState           │
│  └──────────────────┘  Retry: 5x, backoff: 60s fixed           │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 3               │
│  │  payment-queue    │  Jobs: processPayment, verifyWebhook     │
│  │                   │         reconcilePayments                │
│  └──────────────────┘  Retry: 3x, backoff: exponential         │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 1               │
│  │  settlement-queue │  Jobs: calculateProfit, distributeProfit │
│  │                   │         processSettlement, processWithdraw│
│  └──────────────────┘  Retry: 3x, backoff: 30s                 │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 2               │
│  │  notification-queue│ Jobs: sendEmail, sendSMS, sendPush      │
│  │                   │         sendInApp                        │
│  └──────────────────┘  Retry: 3x, backoff: exponential         │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 1               │
│  │  audit-queue      │  Jobs: logAction, exportReport           │
│  │                   │                                          │
│  └──────────────────┘  Retry: 1x (critical path logging)       │
│                                                                  │
│  ┌──────────────────┐  Worker: 1  Concurrency: 1               │
│  │  reconciliation-  │  Jobs: reconcileLedger, reconcileEscrow  │
│  │  queue            │         reconcileBlockchain              │
│  └──────────────────┘  Retry: 0x (scheduled, manual retry)     │
│                                                                  │
│  Dead Letter Queues (DLQ):                                       │
│  ├── email-queue:dlq                                            │
│  ├── blockchain-queue:dlq                                       │
│  ├── payment-queue:dlq                                          │
│  └── settlement-queue:dlq                                       │
│                                                                  │
│  Monitoring:                                                     │
│  ├── Bull Board (admin dashboard)                               │
│  ├── Metrics: processed, failed, waiting, active, delayed       │
│  └── Alerts: DLQ size > 0, processing time > threshold          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monitoring Stack

```
MONITORING & OBSERVABILITY
===========================

┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │    Sentry         │  │   Prometheus     │  │   Grafana     │ │
│  │                   │  │                  │  │               │ │
│  │  Error Tracking   │  │  Metrics         │  │  Dashboards   │ │
│  │  Performance      │  │                  │  │  Alerts       │ │
│  │  Alerting         │  │  Node.js metrics │  │  Visualization│ │
│  │  Release Tracking │  │  Custom metrics  │  │               │ │
│  │  Source Maps       │  │  Health checks   │  │  Panel: API   │ │
│  │                   │  │  Business metrics│  │  Panel: DB    │ │
│  │  Environments:    │  │                  │  │  Panel: Queue │ │
│  │  - Production     │  │  Scrapers:       │  │  Panel: Chain │ │
│  │  - Staging        │  │  - /metrics      │  │  Panel: Errors│ │
│  │                   │  │  - /health       │  │               │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │    UptimeRobot   │  │   Cloudflare     │  │  Structured  │ │
│  │                   │  │   Analytics      │  │  Logging     │ │
│  │  Uptime monitoring│ │                  │  │              │ │
│  │  SSL monitoring   │ │  Traffic         │  │  JSON format │ │
│  │  Status page      │ │  Security events │  │  Correlation │ │
│  │                   │ │  Performance     │  │  IDs         │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Key Metrics:
├── Application
│   ├── Request rate (req/s)
│   ├── Response time (p50, p95, p99)
│   ├── Error rate (4xx, 5xx)
│   ├── Active connections
│   └── Memory usage
│
├── Business
│   ├── Active deals
│   ├── Total investments ($)
│   ├── Investment count
│   ├── Profit distributions
│   ├── Farmer verifications
│   └── KYC completions
│
├── Database
│   ├── Query time (p95)
│   ├── Connection pool usage
│   ├── Replication lag
│   ├── Cache hit ratio
│   └── Table size
│
├── Queue
│   ├── Jobs processed/min
│   ├── Jobs failed/min
│   ├── Queue depth
│   ├── Worker utilization
│   └── Job processing time
│
└── Blockchain
    ├── Transaction success rate
    ├── Gas usage
    ├── Block confirmation time
    ├── Event processing lag
    └── RPC call success rate
```

---

## Security Layers

```
SECURITY LAYERS
================

┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Edge Security (Cloudflare)                              │
│ ├── DDoS protection (L3/L4/L7)                                  │
│ ├── Bot mitigation                                              │
│ ├── WAF rules (OWASP Top 10)                                    │
│ ├── Rate limiting (IP-based)                                    │
│ └── SSL/TLS termination                                         │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Gateway Security (Nginx)                                │
│ ├── Rate limiting (per-IP, per-endpoint)                        │
│ ├── Request size limits (10MB max)                              │
│ ├── Timeout enforcement (60s)                                   │
│ ├── Security headers (HSTS, CSP, X-Frame)                      │
│ ├── IP whitelisting (webhooks)                                  │
│ └── Request validation (method, path)                           │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3: Application Security (NestJS)                           │
│ ├── JWT authentication (RS256, 15min expiry)                    │
│ ├── Refresh token rotation (7d expiry, 1 use)                   │
│ ├── RBAC authorization (role + permission checks)               │
│ ├── Input validation (class-validator + Zod)                    │
│ ├── SQL injection prevention (Prisma parameterized queries)     │
│ ├── CORS policy (whitelist origins)                             │
│ ├── Request ID correlation                                      │
│ ├── Throttling (per-user, per-endpoint)                         │
│ └── File upload validation (type, size, malware scan)           │
├─────────────────────────────────────────────────────────────────┤
│ Layer 4: Data Security                                          │
│ ├── Encryption at rest (AES-256, disk-level)                    │
│ ├── Encryption in transit (TLS 1.3)                             │
│ ├── Database encryption (PostgreSQL TDE)                        │
│ ├── S3 server-side encryption (SSE-S3)                          │
│ ├── Password hashing (bcrypt, 12 rounds)                        │
│ ├── API key hashing (SHA-256)                                   │
│ └── PII data masking (audit logs, error reports)                │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5: Blockchain Security                                     │
│ ├── Private key management (AWS KMS / Vault)                    │
│ ├── Hot wallet with limited funds                               │
│ ├── Multi-sig admin wallet (contract upgrades)                  │
│ ├── Reentrancy guards (OpenZeppelin)                            │
│ ├── Access control (role-based, OpenZeppelin)                   │
│ ├── Function whitelisting                                       │
│ ├── Pausable contracts (emergency stop)                         │
│ └── Upgradeable proxies (UUPS pattern)                          │
├─────────────────────────────────────────────────────────────────┤
│ Layer 6: Infrastructure Security                                 │
│ ├── SSH key authentication only (no passwords)                  │
│ ├── Container image scanning (Trivy)                            │
│ ├── Network segmentation (VPC, private subnets)                 │
│ ├── Secrets management (AWS Secrets Manager)                    │
│ ├── Regular security patches                                    │
│ ├── Firewall rules (AWS Security Groups)                        │
│ └── Bastion host for admin access                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture Summary

```
DEPLOYMENT TOPOLOGY
====================

┌─────────────────────────────────────────────────────────────────┐
│                    Production Environment                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cloudflare CDN                                                  │
│  ├── Static assets (cached at edge)                             │
│  ├── DDoS protection                                             │
│  └── SSL termination                                             │
│                                                                  │
│  AWS ECS Fargate (Container Orchestration)                       │
│  ├── Service: nextjs-web (2 tasks, auto-scaling 2-6)            │
│  ├── Service: nestjs-api (2 tasks, auto-scaling 2-8)            │
│  ├── Service: bullmq-worker (1-3 tasks, auto-scaling)           │
│  └── Service: blockchain-indexer (1 task)                        │
│                                                                  │
│  AWS RDS PostgreSQL                                              │
│  ├── Instance: db.r6g.large (production)                        │
│  ├── Read replica (for dashboards/reports)                       │
│  ├── Automated backups (daily, 30-day retention)                │
│  └── Multi-AZ deployment                                         │
│                                                                  │
│  AWS ElastiCache Redis                                           │
│  ├── Instance: cache.r6g.large                                  │
│  └── Cluster mode (for scaling)                                  │
│                                                                  │
│  AWS S3 / Cloudflare R2                                           │
│  ├── Document storage                                            │
│  └── Static asset origin                                         │
│                                                                  │
│  Monitoring                                                      │
│  ├── Sentry (error tracking)                                     │
│  ├── Prometheus + Grafana (metrics)                              │
│  ├── Cloudflare Analytics (traffic)                              │
│  └── UptimeRobot (uptime)                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **CDN/WAF** | Cloudflare | DDoS, caching, edge, SSL |
| **Reverse Proxy** | Nginx | Routing, rate limiting, headers |
| **Frontend** | Next.js 14 + React 18 | SSR/SSG, App Router, RSC |
| **UI** | Tailwind CSS + shadcn/ui | Styling, components |
| **Wallet** | Wagmi v2 + RainbowKit | Ethereum wallet connection |
| **State** | TanStack Query + Zustand | Server + client state |
| **API** | NestJS 10+ | REST API, modular monolith |
| **ORM** | Prisma | Database access, migrations |
| **Database** | PostgreSQL 15+ | Primary data store |
| **Cache** | Redis 7+ | Caching, locking, sessions |
| **Queue** | BullMQ | Background job processing |
| **Storage** | AWS S3 / Cloudflare R2 | File/document storage |
| **Blockchain** | Solidity + Foundry | Smart contracts |
| **Chain** | Polygon / Ethereum | On-chain state |
| **RPC** | Alchemy / Infura | Blockchain RPC provider |
| **Auth** | Passport.js + JWT | Authentication |
| **Validation** | class-validator + Zod | Input validation |
| **Monitoring** | Sentry + Prometheus + Grafana | Error tracking, metrics |
| **CI/CD** | GitHub Actions | Continuous deployment |
| **Containers** | Docker + ECS Fargate | Deployment |
| **IaC** | Terraform | Infrastructure |
