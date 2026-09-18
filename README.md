# 🌾 GramBandhan — Agricultural Financing & Profit-Sharing Platform

> **Branch:** `MUHUTASIM` | **Role:** Backend Architecture, REST API, Database Layer & Smart Contracts

GramBandhan is an integrated agri-fintech ecosystem that bridges rural farmers with institutional and retail investors. Through transparent project milestone escrows, automated profit distribution, and blockchain verification, GramBandhan enables fair, secure agricultural investments.

---

## 📁 Repository Structure

```
.
├── admin.html                   # Admin management portal
├── dashboard.html               # Farmer & Investor overview dashboard
├── index.html                   # Main platform landing page
├── login.html                   # Authentication portal
├── marketplace.html             # Agri-commodity marketplace & crops
├── orders.html                  # Order history & processing
├── portfolio.html               # Investor portfolio management
├── product-form.html            # Produce listing form
├── profile.html                 # User identity & KYC settings
├── project-form.html            # Agricultural campaign creation
├── projects.html                # Active agricultural campaigns
├── register.html                # Farmer / Investor onboarding
├── sdg.html                     # UN Sustainable Development Goals alignment
├── css/                         # Platform stylesheets & UI design system
├── js/                          # Client-side controllers & UI interactions
│
└── backend/                     # 🚀 Enterprise NestJS Backend & Database Service
    ├── src/                     # Modular NestJS application source code
    │   ├── auth/                # JWT authentication, guards & RBAC
    │   ├── admin/               # Administrative verification & analytics
    │   ├── users/               # User profiles & role access
    │   ├── farmers/             # Farmer verification & land docs
    │   ├── farms/               # Farm coordinates & land parcels
    │   ├── investors/           # Investor profiles & KYC
    │   ├── projects/            # Campaigns & milestone tracking
    │   ├── crops/               # Crop catalog & price feeds
    │   ├── deals/               # Contract terms & lifecycle
    │   ├── investments/         # Fund commitments & ledger
    │   ├── escrow/              # Milestone funds holding
    │   ├── profits/             # Harvest revenue sharing
    │   ├── settlements/         # Payouts & withdrawals
    │   ├── ledger/              # Double-entry accounting system
    │   ├── blockchain/          # Base Sepolia EVM integration
    │   ├── oracle/              # Harvest attestations
    │   ├── notifications/       # Transactional email & alerts
    │   ├── webhooks/            # External integration webhooks
    │   └── common/              # Global filters, pipes & utilities
    ├── prisma/                  # Prisma ORM schema (16 tables) & seeder
    ├── contracts/               # Solidity Smart Contracts (Base Sepolia)
    ├── indexer/                 # High-speed Rust event indexer service
    ├── Dockerfile               # Multi-stage container build
    ├── docker-compose.yml       # PostgreSQL 16 + Redis 7 + API stack
    └── README.md                # Comprehensive backend setup & API documentation
```

---

## ⚡ Quick Start — Backend Service

The backend API runs on **NestJS** and **Prisma ORM** with **PostgreSQL**:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Initialize Database
npx prisma generate
npx prisma db push
npm run prisma:seed

# 5. Start development server
npm run start:dev
```

- **API Endpoint:** `http://localhost:3001/api/v1`
- **Interactive Swagger Documentation:** `http://localhost:3001/api/docs`

---

## 🌐 Quick Start — Frontend

Open `index.html` in your browser or run a lightweight local static server:

```bash
# Using Python
python -m http.server 3000

# Or using npx serve
npx serve .
```

Visit `http://localhost:3000` to interact with the platform UI.

---

## 🔗 Technical Highlights

- **Double-Entry Ledger:** Ensures audit-compliant accounting for every investment, escrow transfer, and farmer payout.
- **Smart Contract Escrow:** Milestone funds remain locked on **Base Sepolia** until verified by oracle attestations or administrative review.
- **Role-Based Access Control (RBAC):** Strict security boundaries across `SUPER_ADMIN`, `ADMIN`, `FARMER`, and `INVESTOR`.
- **Interactive Documentation:** Fully typed Swagger Open-API interface with complete request/response schemas.

For detailed backend configuration, see [`backend/README.md`](backend/README.md).
