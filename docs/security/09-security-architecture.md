# Security Architecture

## Overview

This document defines the security architecture for the Agriculture Profit-Sharing Platform, covering authentication, authorization, data protection, blockchain security, payment security, and operational security.

---

## Authentication Flow

### JWT + Refresh Token Architecture

```
AUTHENTICATION FLOW
====================

User                    Frontend                  Backend                 Redis
 |                         |                         |                      |
 |-- POST /auth/login --->|                         |                      |
 |                         |-- POST /auth/login --->|                      |
 |                         |                         |-- Validate creds     |
 |                         |                         |-- Generate JWT       |
 |                         |                         |   (15min, RS256)     |
 |                         |                         |-- Generate Refresh   |
 |                         |                         |   (7d, random)       |
 |                         |                         |-- Store refresh      |
 |                         |                         |   in DB + Redis      |
 |                         |<-- { accessToken,      --|                     |
 |                         |     refreshToken }      |                     |
 |<-- Show dashboard ------|                         |                      |
 |                         |                         |                      |
 |   ... 14 minutes pass ...                        |                      |
 |                         |                         |                      |
 | (Auto-refresh via        |                         |                      |
 |  Axios interceptor)     |                         |                      |
 |                         |-- POST /auth/refresh ->|                      |
 |                         |   { refreshToken }      |                      |
 |                         |                         |-- Validate refresh   |
 |                         |                         |-- Rotate:            |
 |                         |                         |   Revoke old refresh |
 |                         |                         |   Issue new pair     |
 |                         |<-- { newTokens } -------|                     |
 |                         |                         |                      |

TOKEN DETAILS:

Access Token (JWT):
  Header:
    alg: RS256
    typ: JWT
  Payload:
    sub: userId
    email: user@example.com
    roles: ["FARMER"]
    iat: 1705312200
    exp: 1705313100  (15 minutes)
    jti: unique-token-id
  Signature: RSA-SHA256 with private key

Refresh Token:
  Format: cryptographically random 64-byte hex string
  Stored in: PostgreSQL (hashed) + Redis (plaintext for fast lookup)
  Expiry: 7 days
  Rotation: Single-use (new token issued on each refresh)
  Revocation: Blacklisted in Redis on logout
```

### Token Blacklisting

```
TOKEN BLACKLIST (Redis)
========================

On logout:
  SET blacklist:{tokenJti} "1" EX {remainingTokenTTL}

On protected request:
  Extract jti from JWT
  If blacklist:{jti} exists -> reject (401)

On refresh:
  Revoke old refresh token in DB
  Remove from Redis cache
  Issue new pair

Cleanup:
  TTL-based auto-expiration (no manual cleanup needed)
```

### Password Security

```
PASSWORD POLICY
================

Requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)

Storage:
  Algorithm: bcrypt
  Rounds: 12
  Salt: auto-generated per password

Reset Flow:
  1. User requests reset
  2. Generate cryptographically random 32-byte token
  3. Hash token, store in DB
  4. Send plain token via email (one-time use)
  5. User submits token + new password
  6. Verify hashed token match
  7. Update password, invalidate all refresh tokens
  8. Token expires after 1 hour

Lockout:
  After 5 failed login attempts:
    - Account locked for 15 minutes
    - Admin notified
    - User notified via email
```

### Wallet-Based Authentication (SIWE)

```
SIGN-IN WITH ETHEREUM
======================

Flow:
  1. Backend generates SIWE message with nonce
  2. User signs message with wallet (MetaMask, etc.)
  3. Backend verifies signature using ethers.js
  4. If valid, issue JWT pair
  5. If wallet address not in DB, create user (first login)

SIWE Message Format:
  "{domain} wants you to sign in with your Ethereum account:
  {address}

  {statement}

  URI: {origin}
  Version: 1
  Chain ID: {chainId}
  Nonce: {randomNonce}
  Issued At: {timestamp}"

Security:
  - Nonce prevents replay attacks (single-use, stored in Redis, 5min TTL)
  - Domain binding prevents phishing
  - Chain ID prevents cross-chain attacks
  - Timestamp prevents stale message usage
```

---

## RBAC Permission Model

```
ROLE-BASED ACCESS CONTROL
==========================

Roles:
  GUEST    - Browse public content
  FARMER   - Create/manage farms, projects, deals
  INVESTOR - Invest, view portfolio, request settlements
  ADMIN    - Full platform access

Permission Structure:
  "{action}:{resource}"

Actions:
  create, read, update, delete, verify, approve, manage, distribute

Resources:
  user, farmer_profile, investor_profile, farm, crop, project,
  deal, investment, payment, wallet, ledger, escrow, settlement,
  profit, blockchain, notification, admin, audit

Role-Permission Matrix:
  FARMER:
    - create:farm, read:farm, update:farm, delete:farm
    - create:project, read:project, update:project
    - create:deal, read:deal, update:deal
    - read:crop
    - read:investment (own)
    - read:settlement (own)
    - read:notification (own)
    - create:harvest, create:expense, create:sale, create:revenue
    - read:profit (own deals)

  INVESTOR:
    - read:farm (published)
    - read:deal (published)
    - create:investment, read:investment (own)
    - read:payment (own)
    - create:wallet, read:wallet (own)
    - read:settlement (own)
    - create:withdrawal
    - read:profit (own investments)
    - read:notification (own)

  ADMIN:
    - manage:* (all resources)
    - verify:farmer_profile
    - verify:investor_profile (kyc)
    - approve:deal
    - reject:deal
    - approve:expense
    - distribute:profit
    - run:reconciliation
    - read:audit
    - read:admin (dashboard)

Implementation:
  @Roles('FARMER') decorator on controller methods
  @Permissions('create:farm') for fine-grained checks
  RolesGuard validates role
  PermissionsGuard validates permission
  Both checked via metadata attached to route handlers
```

---

## API Security

### Rate Limiting

```
RATE LIMITING STRATEGY
========================

Layer 1: Cloudflare
  - DDoS protection (automatic)
  - Bot mitigation
  - Challenge pages for suspicious traffic

Layer 2: Nginx
  - Zone: api_limit: 100 req/min per IP
  - Zone: auth_limit: 10 req/min per IP
  - Zone: upload_limit: 20 req/min per IP
  - Zone: webhook: unlimited (IP-whitelisted)

Layer 3: NestJS (ThrottlerGuard)
  - Per-endpoint rate limits
  - Per-user rate limits (authenticated)
  - Per-IP rate limits (unauthenticated)
  - Sliding window algorithm

Rate Limit Headers:
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1705312260
```

### CORS Configuration

```
CORS POLICY
=============

Allowed Origins:
  - https://app.agriplatform.com (production)
  - https://staging.agriplatform.com (staging)
  - http://localhost:3000 (development)

Allowed Methods:
  GET, POST, PATCH, DELETE, OPTIONS

Allowed Headers:
  Content-Type, Authorization, Idempotency-Key, X-Request-ID

Credentials: true
Max-Age: 86400 (24 hours)
```

### Security Headers

```
SECURITY HEADERS
==================

Helmet.js configuration:
  Content-Security-Policy:
    default-src 'self'
    script-src 'self' 'unsafe-inline' 'unsafe-eval'
    style-src 'self' 'unsafe-inline'
    img-src 'self' data: https:
    font-src 'self' https://fonts.gstatic.com
    connect-src 'self' https://api.stripe.com https://*.polygon-rpc.com
    frame-ancestors 'none'
    base-uri 'self'
    form-action 'self'

  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Data Encryption

### Encryption at Rest

```
ENCRYPTION AT REST
====================

PostgreSQL:
  - Transparent Data Encryption (TDE) enabled
  - AES-256 encryption
  - Managed by AWS RDS

S3 / R2:
  - Server-side encryption (SSE-S3)
  - AES-256
  - Automatic encryption on upload

Disk:
  - EBS volume encryption (AES-256)
  - AWS KMS managed keys

Sensitive Fields (application-level):
  - bank_account_number: AES-256-GCM encrypted
  - bank_routing_number: AES-256-GCM encrypted
  - ssn/tax_id (if collected): AES-256-GCM encrypted
  - Encryption key: AWS KMS, rotated every 90 days
```

### Encryption in Transit

```
ENCRYPTION IN TRANSIT
=======================

External:
  - TLS 1.3 only (TLS 1.2 minimum)
  - HSTS with preload
  - OCSP stapling
  - Certificate: Let's Encrypt / Cloudflare managed

Internal:
  - Service mesh: mTLS between containers
  - Database: SSL/TLS required for connections
  - Redis: TLS required for connections
  - RPC: HTTPS for blockchain provider connections

Certificate Management:
  - Auto-renewal via certbot / Cloudflare
  - Expiry monitoring via UptimeRobot
```

---

## Blockchain Security

### Key Management

```
KEY MANAGEMENT
===============

Server Hot Wallet:
  - HD Wallet (BIP-44 derivation path: m/44'/60'/0'/0/0)
  - Private key stored in AWS KMS
  - Never stored in code, config, or environment variables
  - KMS API calls logged and audited
  - Key usage: gas station (pays gas), contract deployment

Gas Station Wallet:
  - Separate from admin wallet
  - Limited balance (auto-refill when low)
  - Daily spending limit: 100 MATIC
  - Automatic alerts when balance < 10 MATIC

Admin Multisig Wallet:
  - Gnosis Safe (3-of-5 multisig)
  - Used for: contract upgrades, emergency pauses, parameter changes
  - No single admin can perform critical actions
  - Hardware wallet required for signers

User Wallets:
  - Platform never stores user private keys
  - Users sign with their own wallets (MetaMask, etc.)
  - Only public address stored in platform DB
  - SIWE signatures verified, not stored long-term
```

### Smart Contract Security

```
SMART CONTRACT SECURITY CHECKLIST
====================================

Access Control:
  [x] OpenZeppelin AccessControl for all roles
  [x] Only authorized roles can call sensitive functions
  [x] Admin functions behind multisig
  [x] Platform role for automated operations

Reentrancy Protection:
  [x] ReentrancyGuard on all external state-changing functions
  [x] Checks-Effects-Interactions pattern followed
  [x] No external calls in loops
  [x] Pull-over-push payment pattern

Integer Overflow:
  [x] Solidity 0.8+ (built-in overflow checks)
  [x] Additional SafeMath where needed
  [x] Basis point arithmetic with proper scaling

Input Validation:
  [x] All function parameters validated
  [x] Share percentages sum to 100%
  [x] Amounts > 0 enforced
  [x] Address != address(0) checked
  [x] Strings non-empty where required

Pausability:
  [x] Pausable contract for emergency stop
  [x] Only admin multisig can pause/unpause
  [x] Critical functions (invest, distribute) pausable

Upgradeability:
  [x] UUPS proxy pattern for DealContract
  [x] Implementation address stored in factory
  [x] Upgrade requires admin multisig approval
  [x] Storage layout verified before upgrade

Flash Loan Protection:
  [x] No price oracle dependencies in core logic
  [x] Investment amounts validated against min/max
  [x] Snapshot-based calculations for distributions

Event Emission:
  [x] All state changes emit events
  [x] Events used for off-chain indexing
  [x] No critical state change without event

Testing:
  [x] Foundry fuzz testing
  [x] Unit tests for all functions
  [x] Integration tests for deal lifecycle
  [x] Edge case testing (zero amounts, max values)
  [x] Gas optimization tests

Audit:
  [ ] Professional audit before mainnet deployment
  [ ] Bug bounty program
  [ ] Continuous monitoring via Forta / OpenZeppelin Defender
```

---

## Payment Security

### Webhook Verification

```
STRIPE WEBHOOK VERIFICATION
==============================

1. Receive webhook request
2. Extract Stripe-Signature header
3. Verify signature using Stripe SDK:
   stripe.webhooks.constructEvent(
     body,
     signature,
     webhookSecret
   )
4. If invalid -> return 400, log security event
5. If valid -> process event
6. Check event type whitelist:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
   - charge.dispute.created
7. Process event idempotently (check event ID)
8. Return 200
```

### Idempotency

```
IDEMPOTENCY STRATEGY
======================

Applicable Endpoints:
  - POST /api/v1/investments (Idempotency-Key header required)
  - POST /api/v1/payments
  - POST /api/v1/settlements
  - POST /api/v1/profits/calculate

Implementation:
  1. Client sends Idempotency-Key header (UUID recommended)
  2. Backend checks idempotency_keys table
  3. If key exists and not expired (24h):
     Return cached response (same status code + body)
  4. If key not found:
     Process request normally
     Store { key, userId, endpoint, response, expiresAt }
  5. Cleanup job removes expired keys daily

Collision Prevention:
  - Key scoped to userId + endpoint
  - Different users can use same key independently
  - Concurrent requests with same key: first wins, second waits or gets cached
```

---

## File Upload Security

```
FILE UPLOAD SECURITY
=====================

Validation:
  - MIME type check (magic bytes, not just extension)
  - File size limit (10MB for documents, 5MB for images)
  - Image dimension limits (max 4096x4096)
  - Filename sanitization (remove special chars, UUID prefix)

Scanning:
  - ClamAV virus scan on upload
  - Block executable files (.exe, .bat, .sh, .js)
  - Block script files (.php, .asp, .jsp)

Storage:
  - S3 bucket with public access blocked
  - Pre-signed URLs for downloads (15min expiry)
  - Content-Type set correctly on upload
  - Metadata stripped from images (EXIF removal)

Access Control:
  - Farm documents: only farm owner + admin
  - KYC documents: only user + admin
  - Project documents: deal participants + admin
  - Pre-signed URLs scoped to specific user/session
```

---

## Input Validation Strategy

```
INPUT VALIDATION LAYERS
=========================

Layer 1: DTO Validation (class-validator)
  - @IsString(), @IsEmail(), @IsUUID()
  - @MinLength(), @MaxLength()
  - @IsPositive(), @Min(), @Max()
  - @IsIn() for enums
  - @IsOptional() for nullable fields
  - Applied via ValidationPipe (whitelist: true, forbidNonWhitelisted: true)

Layer 2: Service-Level Validation
  - Business rule validation
  - Uniqueness checks (email, wallet address)
  - Relationship validation (farm belongs to farmer)
  - State validation (deal must be in FUNDING state)
  - Balance validation (sufficient funds)

Layer 3: Database Validation
  - Prisma schema constraints
  - CHECK constraints on numeric fields
  - UNIQUE constraints
  - NOT NULL constraints
  - Foreign key constraints

Layer 4: SQL Injection Prevention
  - Prisma parameterized queries (never raw SQL)
  - Input never interpolated in queries
  - Raw queries only with Prisma.$queryRaw with typed parameters

Layer 5: XSS Prevention
  - Output encoding (React auto-escapes)
  - Content-Type headers enforced
  - CSP headers block inline scripts
  - User input sanitized before storage (strip HTML tags)
```

---

## Secret Management

```
SECRET MANAGEMENT
===================

AWS Secrets Manager:
  - Database credentials (rotated every 90 days)
  - API keys (Stripe, Alchemy, Infura)
  - Webhook secrets
  - JWT signing keys
  - Encryption keys (KMS)

Environment Variables (via ECS task definition):
  - NODE_ENV
  - PORT
  - DATABASE_URL (from Secrets Manager)
  - REDIS_URL (from Secrets Manager)
  - SENTRY_DSN
  - Chain configuration

Never in Code:
  - API keys
  - Private keys
  - Passwords
  - Secrets of any kind
  - .env files in git

Git Hooks:
  - pre-commit: gitleaks scan
  - CI: git-secrets, trufflehog scan
  - Dependabot for dependency vulnerabilities
```

---

## Audit Logging Strategy

```
AUDIT LOGGING
===============

What is Logged:
  - Authentication events (login, logout, failed attempts)
  - Authorization events (access denied)
  - Data mutations (create, update, delete)
  - Financial transactions (all ledger entries)
  - Blockchain transactions (send, confirm, fail)
  - Admin actions (approve, reject, verify)
  - File uploads and downloads
  - API key usage
  - Configuration changes

Audit Log Structure:
  {
    userId: "uuid",
    action: "deal.approved",
    resource: "deal",
    resourceId: "deal-uuid",
    oldValues: { "status": "UNDER_REVIEW" },
    newValues: { "status": "APPROVED" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    requestId: "req-abc-123",
    metadata: { "adminId": "admin-uuid" },
    createdAt: "2024-01-15T10:30:00Z"
  }

Storage:
  - Primary: PostgreSQL audit_logs table
  - Backup: S3 (monthly export)
  - Retention: 7 years (regulatory compliance)

Immutable:
  - Audit logs cannot be modified or deleted
  - Write-only access (no UPDATE, no DELETE)
  - Database role: audit_writer (INSERT only)

Search:
  - Admin UI for searching audit logs
  - Filter by user, action, resource, date range
  - Export to CSV/JSON for compliance
```

---

## Incident Response

```
INCIDENT RESPONSE PLAN
========================

Severity Levels:
  P1 - Critical: Data breach, fund loss, system down
  P2 - High: Security vulnerability, payment failure
  P3 - Medium: Non-critical bug, performance degradation
  P4 - Low: Minor issue, cosmetic bug

Response:
  P1: Immediate response (< 15 min)
    - Page on-call engineer
    - Notify CTO
    - Begin incident timeline
    - Assess impact
    - Activate containment measures

  P2: Fast response (< 1 hour)
    - Page on-call engineer
    - Begin investigation
    - Implement workaround

  P3: Standard response (< 4 hours)
    - Create ticket
    - Investigate during business hours

  P4: Next sprint
    - Create ticket
    - Prioritize in backlog

Containment Measures:
  - Emergency pause on smart contracts (multisig)
  - Rate limiting increase on API
  - IP blocking on Nginx
  - Account suspension
  - Wallet balance monitoring alerts

Post-Incident:
  - Root cause analysis (within 48h)
  - Security patch deployment
  - Incident report
  - Process improvement recommendations
  - User notification (if data breach)
```
