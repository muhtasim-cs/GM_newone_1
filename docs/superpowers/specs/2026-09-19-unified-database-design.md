# Architectural Specification: GramBandhan Unified Database Architecture

**Date:** 2026-09-19  
**Status:** Approved  
**Author:** Muhutasim  
**Scope:** PostgreSQL 16 Relational Engine & Prisma ORM Data Layer

---

## 1. Executive Summary

This document specifies the unified database architecture for **GramBandhan**, resolving the structural gap between the team's academic SRS functional requirements and the enterprise distributed system requirements.

The unified schema consolidates:
1. **The 16 SRS Domain Entities**: Users, Farmer Profiles, Investor Profiles, Field Agent Profiles, Projects, Investments, Milestone Updates, AI Risk Scores, Product Listings, Orders, Insurance Policies, Insurance Claims, Transactions, Fraud Alerts, Ratings, and Notifications.
2. **Double-Entry Financial Accounting Ledger**: Compliant with ISO 20022 and GAAP principles, ensuring balanced debit-credit journal entries for all fund transfers.
3. **On-Chain Settlement State**: Anchoring Base Sepolia EVM smart contract addresses, transaction hashes, and multi-sig oracle attestations.

---

## 2. Normalization & Integrity Guarantees

- **Third Normal Form (3NF)**: All transitive and partial dependencies have been removed. Role-specific profile attributes reside in 1:1 extension tables (`farmer_profiles`, `investor_profiles`, `field_agent_profiles`) rather than sparse null columns on `users`.
- **Financial Precision**: All monetary quantities enforce `Decimal(14, 2)` precision (PostgreSQL `NUMERIC(14,2)`), preventing floating-point rounding errors.
- **Referential Integrity**: All foreign keys declare explicit `onDelete` behaviors (`Cascade` for user child profiles, `Restrict` for financial audit records).

---

## 3. Core Entity Domains

### Domain 1: Identity & Access Control
- `User`: Central entity with email, phone, hashed password, role (`FARMER`, `INVESTOR`, `FIELD_AGENT`, `ADMIN`, `SUPER_ADMIN`, `BUYER`), and KYC verification status.
- `FarmerProfile`: Land acreage, division, district, upazila, experience, aggregate rating.
- `InvestorProfile`: Risk tier, total invested, available wallet balance, Web3 wallet address.
- `FieldAgentProfile`: Assigned agricultural region, government ID, verification score.

### Domain 2: Agricultural Crowdfunding & Contracts
- `Project`: Agricultural campaign with fund goal, fund raised, crop variety, start/end dates, status, and on-chain contract link.
- `Investment`: Investor commitment with units, principal amount, expected returns, and blockchain transaction hash.
- `MilestoneUpdate`: Agronomic stage, description, evidence photo URLs, verified by field agent, and oracle attestation hash.
- `RiskScore`: Algorithmic risk score (0.00–100.00), risk tier (`LOW`, `MEDIUM`, `HIGH`), factor breakdown, and recommendations.

### Domain 3: Marketplace & Commerce
- `ProductListing`: Harvested produce offered by farmers/producers with unit price, available stock, and delivery region.
- `Order`: Marketplace order placed by buyers, quantity, total amount, delivery address, and tracking status.

### Domain 4: Parametric Crop Insurance
- `InsurancePolicy`: Underwritten crop policy linked to a project, coverage ceiling, and premium rate.
- `InsuranceClaim`: Damage event claim with photo evidence, damage assessment, filed timestamp, and payout approval.

### Domain 5: Financial Accounting & Security
- `Transaction`: Multi-channel payment record (bKash, Nagad, Bank Transfer, Crypto).
- `FraudAlert`: Anomaly detection record linked to suspicious transactions or accounts.
- `Rating`: Multi-dimensional peer ratings (Farmer, Project, Marketplace item) with 1–5 stars and comments.
- `Notification`: In-app and push notification record.
- `Account`, `JournalEntry`, `LedgerEntry`: Immutable double-entry financial ledger.
