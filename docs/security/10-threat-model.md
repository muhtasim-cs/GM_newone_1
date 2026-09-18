# Threat Model

## Overview

This document identifies and analyzes security threats to the Agriculture Profit-Sharing Platform using the STRIDE methodology, covering each component of the system.

---

## STRIDE Analysis Per Component

### Frontend (Next.js)

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| XSS via user input | Tampering | High | Medium | High | React auto-escaping, CSP headers, input sanitization |
| Clickjacking | Information Disclosure | Medium | Low | Medium | X-Frame-Options: DENY, CSP frame-ancestors |
| Wallet phishing | Spoofing | High | Medium | High | SIWE domain binding, clear signing prompts |
| Client-side data exposure | Information Disclosure | Medium | Medium | Medium | Minimize sensitive data in client state, use SSR |
| Malicious browser extension | Tampering | High | Low | High | Critical operations require explicit wallet confirmation |
| Session hijacking | Elevation of Privilege | High | Low | High | HttpOnly cookies, short token expiry, refresh rotation |

### API Gateway (Nginx)

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| DDoS attack | Denial of Service | High | High | High | Cloudflare DDoS protection, Nginx rate limiting |
| SSL stripping | Information Disclosure | High | Low | High | HSTS preload, TLS 1.3 minimum |
| Request smuggling | Elevation of Privilege | High | Low | High | Normalize request paths, strict parsing |
| Buffer overflow | Denial of Service | Medium | Low | High | Request size limits (10MB), timeout enforcement |
| Upstream attack | Denial of Service | Medium | Low | Medium | Health checks, circuit breaker, connection limits |

### Backend (NestJS)

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| SQL injection | Tampering | Critical | Low | Critical | Prisma parameterized queries, input validation |
| JWT token theft | Elevation of Privilege | High | Medium | High | Short expiry, refresh rotation, HTTPS only |
| JWT token forgery | Spoofing | Critical | Low | Critical | RS256 asymmetric signing, key in KMS |
| Broken authentication | Elevation of Privilege | High | Medium | High | Account lockout, MFA (planned), secure password policy |
| IDOR (Insecure Direct Object Reference) | Information Disclosure | High | Medium | High | Ownership checks on every resource access |
| Mass assignment | Tampering | Medium | Medium | Medium | DTO whitelisting, forbidNonWhitelisted |
| Race condition (investment) | Tampering | Critical | Medium | Critical | Distributed locking (Redis), database transactions |
| SSRF via webhook | Information Disclosure | High | Low | High | IP whitelisting, webhook signature verification |
| Rate limit bypass | Denial of Service | Medium | Medium | Medium | Multi-layer rate limiting (Cloudflare + Nginx + NestJS) |
| File upload vulnerability | Remote Code Execution | High | Low | High | MIME validation, ClamAV scan, non-executable storage |
| Exception information leak | Information Disclosure | Medium | Low | Medium | Generic error messages, Sentry for internals |
| Dependency vulnerability | Varying | High | Medium | High | Dependabot, Snyk scanning, regular updates |

### Database (PostgreSQL)

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| Unauthorized data access | Information Disclosure | Critical | Low | Critical | VPC isolation, encrypted connections, RBAC |
| Data breach | Information Disclosure | Critical | Low | Critical | TDE encryption, PII encryption at app level |
| Data corruption | Tampering | High | Low | High | ACID transactions, checksums, regular backups |
| SQL injection via ORM | Tampering | Critical | Low | Critical | Prisma parameterized queries (no raw SQL) |
| Backup exposure | Information Disclosure | High | Low | High | Encrypted backups, access controls, retention policy |
| Replication lag | Denial of Service | Medium | Low | Low | Monitoring, alerting, read-replica configuration |

### Redis

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| Unauthorized access | Information Disclosure | High | Low | High | AUTH password, VPC isolation, TLS |
| Data persistence exposure | Information Disclosure | Medium | Low | Medium | Disable persistence in production, encrypted at rest |
| Cache poisoning | Tampering | Medium | Low | Medium | Signed cache entries, TTL enforcement |
| Memory exhaustion | Denial of Service | Medium | Low | Medium | Memory limits, eviction policy, monitoring |

### Blockchain Layer

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| Private key compromise | Elevation of Privilege | Critical | Low | Critical | AWS KMS, hardware wallets for multisig |
| Smart contract vulnerability | Tampering | Critical | Low | Critical | Audits, formal verification, bug bounties |
| Reentrancy attack | Tampering | Critical | Low | Critical | ReentrancyGuard, checks-effects-interactions |
| Front-running | Tampering | High | Medium | Medium | Commit-reveal for critical operations, private mempool |
| 51% attack | Tampering | High | Very Low | Critical | Use established chain (Polygon), 12 confirmations |
| Chain reorganization | Tampering | High | Low | High | Deep confirmations (12 blocks), reorg detection |
| Oracle manipulation | Tampering | High | Low | High | Multi-attester verification, time-delayed confirmation |
| Flash loan attack | Tampering | High | Low | High | No price oracle in core logic, fixed calculations |
| Gas price manipulation | Denial of Service | Medium | Medium | Medium | EIP-1559, gas estimation, max gas limit |
| Contract upgrade attack | Tampering | Critical | Low | Critical | Multisig approval, timelock, storage layout verification |
| Event spoofing | Spoofing | Medium | Low | Medium | Verify events on-chain, don't trust DB alone |

### Payment Providers (Stripe/PayPal)

| Threat | Category | Severity | Likelihood | Impact | Mitigation |
|---|---|---|---|---|---|
| Webhook forgery | Spoofing | High | Low | High | HMAC signature verification, IP whitelisting |
| Replay attack | Tampering | High | Low | High | Event ID deduplication, timestamp validation |
| Double payment | Tampering | High | Medium | High | Idempotency keys, amount verification |
| Payment amount manipulation | Tampering | Critical | Low | Critical | Server-side amount verification, provider confirmation |
| Refund abuse | Fraud | Medium | Medium | Medium | Refund limits, admin approval, audit trail |
| Stolen card usage | Fraud | High | Medium | High | 3D Secure, address verification, velocity checks |

---

## Financial System Threats

```
FINANCIAL THREAT MODEL
========================

1. DOUBLE-SPENDING
   Threat: Investor sends same funds to multiple deals
   Mitigation:
     - Idempotency keys prevent duplicate transactions
     - Blockchain confirmation required before investment confirmed
     - Database constraints (unique deal+investor combination)
     - Double-entry ledger catches discrepancies

2. LEDGER MANIPULATION
   Threat: Unauthorized modification of financial records
   Mitigation:
     - Immutable audit trail (append-only)
     - Posted entries cannot be modified
     - Reversal creates new entries (not edit)
     - Daily reconciliation checks
     - Dual-control for large transactions

3. PROFIT CALCULATION FRAUD
   Threat: Manipulating revenue/expense numbers
   Mitigation:
     - Oracle attestations for verification
     - Admin approval required
     - Cross-reference with bank statements
     - Automated reconciliation

4. ESCROW THEFT
   Threat: Unauthorized release of escrowed funds
   Mitigation:
     - Multisig release (when implemented)
     - Milestone-based release
     - Admin approval required
     - On-chain enforcement
     - Event monitoring

5. MONEY LAUNDERING
   Threat: Using platform to launder funds
   Mitigation:
     - KYC verification for investors
     - Transaction monitoring
     - Suspicious activity reporting
     - Investment amount limits
     - Source of funds verification (large amounts)

6. INSIDER THREAT
   Threat: Employee or admin misusing access
   Mitigation:
     - Least privilege access
     - Audit logging for all admin actions
     - Dual-control for financial operations
     - Regular access reviews
     - Background checks for admin personnel
```

---

## Data Privacy Threats

```
DATA PRIVACY THREAT MODEL
============================

1. PII EXPOSURE
   Threat: Personal data exposed in breach or logs
   Mitigation:
     - PII encrypted at rest (bank details, KYC)
     - Mask sensitive data in logs
     - Minimize PII collection
     - Data retention policies
     - Right to deletion (GDPR compliance)

2. CROSS-USER DATA LEAK
   Threat: User A sees User B's data
   Mitigation:
     - Ownership checks on every data access
     - Row-level security (RLS) where feasible
     - IDOR prevention (ownership validation)
     - API response filtering

3. ANALYTICS LEAKAGE
   Threat: Aggregate data reveals individual information
   Mitigation:
     - Minimum aggregation thresholds (n >= 10)
     - Differential privacy for reports
     - No individual-level data in analytics

4. THIRD-PARTY DATA SHARING
   Threat: Data shared with payment providers
   Mitigation:
     - Minimal data sharing (amount, ID only)
     - DPA agreements with providers
     - No KYC data shared externally
     - Regular vendor security reviews

5. DATA RETENTION
   Threat: Old data becomes liability
   Mitigation:
     - Automated deletion after retention period
     - Anonymization of historical data
     - Backup encryption and secure deletion
```

---

## Infrastructure Threats

```
INFRASTRUCTURE THREAT MODEL
==============================

1. SERVER COMPROMISE
   Threat: Attacker gains access to server
   Mitigation:
     - Container isolation (Docker/Fargate)
     - No SSH access (except bastion)
     - Container image scanning (Trivy)
     - Minimal base images (Alpine)
     - Read-only file systems where possible
     - Secret management via KMS

2. DEPENDENCY SUPPLY CHAIN
   Threat: Malicious dependency introduced
   Mitigation:
     - Lock files (package-lock.json, yarn.lock)
     - Dependabot alerts
     - Snyk scanning in CI
     - Regular dependency updates
     - Package integrity verification (npm audit signatures)

3. DNS HIJACKING
   Threat: DNS redirected to attacker's server
   Mitigation:
     - DNSSEC enabled
     - Cloudflare DNS (DDoS protection)
     - Domain registrar lock
     - DNS monitoring

4. CI/CD PIPELINE COMPROMISE
   Threat: Attacker injects malicious code via CI
   Mitigation:
     - Branch protection rules
     - Required code reviews
     - Signed commits
     - CI secrets isolation
     - Artifact signing (Docker image signing)

5. MONITORING BYPASS
   Threat: Attacker disables monitoring
   Mitigation:
     - External monitoring (UptimeRobot, Cloudflare)
     - Log forwarding to external service
     - Alert on monitoring gaps
     - Separate monitoring infrastructure
```

---

## Mitigation Summary

| Threat Category | Top Mitigations | Residual Risk |
|---|---|---|
| Authentication | JWT + refresh rotation, SIWE, lockout | Low |
| Authorization | RBAC + ownership checks, audit logging | Low |
| Financial | Double-entry ledger, idempotency, reconciliation | Low |
| Blockchain | KMS keys, multisig, contract audit, reentrancy guards | Low |
| Payment | Webhook verification, idempotency, amount verification | Low |
| Data Privacy | Encryption at rest/transit, PII masking, retention | Low |
| Infrastructure | Container isolation, secrets management, scanning | Low |
| Smart Contract | Professional audit, bug bounty, monitoring | Medium (until audited) |

---

## Risk Acceptance

The following risks are accepted with compensating controls:

1. Smart contract risk before professional audit
   - Compensating: Extensive testing, monitoring, pause capability
2. Centralized oracle risk (attestation verification)
   - Compensating: Multi-attester model, admin verification
3. Hot wallet compromise
   - Compensating: Limited balance, spending limits, monitoring
4. Single chain dependency (Polygon)
   - Compensating: Multi-chain architecture planned, chain abstraction
