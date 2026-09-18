# Transaction Lifecycle

## Overview

This document covers the complete investment transaction lifecycle, from initial investment through payment processing, blockchain confirmation, ledger posting, and reconciliation. It covers happy paths, failure scenarios, retry logic, and reconciliation procedures.

---

## Investment Transaction Flow

```
INVESTMENT TRANSACTION FLOW
============================

+-------+   +--------+   +-------+   +----------+
| User  |-->| Router |-->| Nginx |-->| NestJS   |
+-------+   +--------+   +-------+   +----+-----+
                                            |
                                    +-------v--------+
                                    | Investment     |
                                    | Controller     |
                                    +-------+--------+
                                            |
                                    +-------v--------+
                                    | Investment     |
                                    | Service        |
                                    +-------+--------+
                                            |
                              +-------------+-------------+
                              |             |             |
                     +--------v---+  +-----v------+  +---v---------+
                     | Payment    |  | Ledger     |  | Blockchain  |
                     | Service    |  | Service    |  | Service     |
                     +--------+---+  +-----+------+  +---+---------+
                              |            |             |
                     +--------v---+  +-----v------+  +---v---------+
                     | Stripe/    |  | PostgreSQL |  | EVM Chain   |
                     | PayPal     |  | Ledger     |  | (Polygon)   |
                     +------------+  +------------+  +-------------+
```

---

## Happy Path: Complete Investment Flow

```
STEP-BY-STEP INVESTMENT FLOW
==============================

Step 1: Investor Selects Deal
  - GET /api/v1/deals/:id
  - Display deal terms, funding progress, minimum/maximum investment

Step 2: Reviews Deal Terms
  - GET /api/v1/deals/:id/terms
  - Display ROI, duration, risk level, payment schedule

Step 3: Accepts Terms
  - Investor checks terms acceptance checkbox
  - Frontend stores acceptance locally

Step 4: Enters Investment Amount
  - Validate min/max range
  - Calculate expected ownership units
  - Display summary before confirmation

Step 5: Chooses Payment Method
  Option A: Cryptocurrency
    - Connect wallet via RainbowKit
    - Display wallet address and chain
    - Prepare blockchain transaction

  Option B: Fiat (Card/Bank)
    - Redirect to Stripe Checkout / PayPal
    - Collect card details via secure iframe

Step 6: Signs/Confirms Transaction
  Option A: Crypto
    - Wagmi sends transaction request to wallet
    - User confirms in wallet extension
    - txHash returned to frontend

  Option B: Fiat
    - User completes Stripe/PayPal checkout
    - Redirect back to platform
    - Payment provider confirms via webhook

Step 7: Backend Receives Investment Request
  POST /api/v1/investments
  +---+---+---+---+---+---+---+---+---+---+
  | Idempotency-Key header                    |
  +---+---+---+---+---+---+---+---+---+---+

Step 8: Backend Validates
  [x] Investor is authenticated
  [x] Investor has INVESTOR role
  [x] Deal is in FUNDING state
  [x] Investment amount within range
  [x] Investor hasn't exceeded max investments
  [x] Idempotency key not reused
  [x] Deal funding not exceeded

Step 9: Creates Investment Record
  Investment: { status: PENDING }
  InvestmentTransaction: { type: INVEST, status: PENDING }

Step 10: Processes Payment
  Option A: Crypto
    - Build blockchain tx (toDealContract.invest)
    - Sign with server wallet (gas station)
    - Submit to RPC provider
    - Store txHash
    - InvestmentTransaction: { status: PROCESSING }

  Option B: Fiat
    - Create Stripe PaymentIntent / PayPal order
    - Return clientSecret to frontend
    - Wait for webhook confirmation

Step 11: Waits for Confirmation
  Option A: Crypto
    - Poll getTransactionReceipt(txHash)
    - Wait for N block confirmations (N=12 on Polygon)
    - On receipt:
      - Check status (success/failure)
      - Record gasUsed, blockNumber
      - InvestmentTransaction: { status: COMPLETED }

  Option B: Fiat
    - Webhook received from Stripe/PayPal
    - Verify webhook signature
    - Check event type (payment_intent.succeeded)
    - InvestmentTransaction: { status: COMPLETED }

Step 12: Confirms Investment
  - Investment: { status: CONFIRMED }
  - Mint ownership tokens (if crypto)
  - Update deal.fundedAmount

Step 13: Creates Ledger Entries
  Double-entry accounting:
  Debit:  Escrow Account          +$1000
  Credit: Investor Receivable     +$1000

  Debit:  Investor Receivable     -$1000
  Credit: Investment Equity       +$1000

Step 14: Updates Deal Funding
  - deal.fundedAmount += investmentAmount
  - If fundedAmount >= totalTargetAmount:
    - Emit deal.funded event
    - Transition deal to FUNDED state

Step 15: Emits Events
  investment.confirmed
    -> BlockchainModule: mintOwnershipTokens
    -> NotificationModule: sendConfirmationEmail
    -> AuditModule: logInvestment

Step 16: Notifies Parties
  - Investor: "Your investment of $X in [Deal] is confirmed"
  - Farmer: "New investment of $X received for [Deal]"
  - Admin: (dashboard update)
```

---

## Payment Provider Integration

### Stripe Integration

```
STRIPE PAYMENT FLOW
====================

Frontend                     Backend                      Stripe
   |                            |                            |
   |-- POST /api/v1/payments ->|                            |
   |                            |-- Create PaymentIntent -->|
   |                            |<-- client_secret ---------|
   |<-- { client_secret } -----|                            |
   |                            |                            |
   |-- Stripe.js collects card details -------------------->|
   |                            |                            |
   |<-- payment_intent.succeeded webhook -------------------|
   |                            |                            |
   |                  +---------+---------+                  |
   |                  | Verify webhook    |                  |
   |                  | signature         |                  |
   |                  | Process payment   |                  |
   |                  | Update investment |                  |
   |                  | Post ledger       |                  |
   |                  +-------------------+                  |
```

### PayPal Integration

```
PAYPAL PAYMENT FLOW
====================

Frontend                     Backend                      PayPal
   |                            |                            |
   |-- POST /api/v1/payments ->|                            |
   |                            |-- Create Order ---------->|
   |                            |<-- order_id --------------|
   |<-- { order_id } ----------|                            |
   |                            |                            |
   |-- Redirect to PayPal approval URL -------------------->|
   |                            |                            |
   |<-- Redirect back with order_id -----------------------|
   |                            |                            |
   |                            |-- Capture Order --------->|
   |                            |<-- Captured -------------|
   |                            |                            |
   |                  +---------+---------+                  |
   |                  | Process captured  |                  |
   |                  | payment           |                  |
   |                  +-------------------+                  |
```

---

## Failure Scenarios

### Scenario 1: Payment Declined (Fiat)

```
FALIURE: PAYMENT DECLINED
==========================

Frontend                     Backend                      Stripe
   |                            |                            |
   |-- POST /api/v1/payments ->|                            |
   |                            |-- Create PaymentIntent -->|
   |                            |<-- client_secret ---------|
   |<-- { client_secret } -----|                            |
   |                            |                            |
   |-- Stripe.js attempt ----->|                            |
   |<-- card_declined ---------|                            |
   |                            |                            |
   |                  +---------+---------+                  |
   |                  | Investment:        |                  |
   |                  |   status: FAILED   |                  |
   |                  | InvestmentTx:      |                  |
   |                  |   status: FAILED   |                  |
   |                  |   error: declined  |                  |
   |                  +---------+---------+                  |
   |                            |                            |
   |<-- 402 Payment Declined ---|                            |
   |                            |                            |
   |  Investor can retry with   |                            |
   |  different payment method  |                            |
```

**Recovery:**
1. Investment marked as FAILED
2. No ledger entries created
3. Investor notified with decline reason
4. Deal.fundedAmount unchanged
5. Investor can retry (new Investment record)

### Scenario 2: Blockchain Transaction Failure

```
FAILURE: BLOCKCHAIN TX FAILED
==============================

Backend                      Blockchain
   |                            |
   |-- Send tx --------------->|
   |<-- txHash ----------------|
   |                            |
   |-- Poll receipt ---------->|
   |<-- status: failed --------|
   |                            |
   +--- RETRY LOGIC -----------+
   |                            |
   | Retry 1 (30s delay) ----->|
   |<-- txHash 2 --------------|
   |<-- status: failed --------|
   |                            |
   | Retry 2 (60s delay) ----->|
   |<-- txHash 3 --------------|
   |<-- status: failed --------|
   |                            |
   | Retry 3 (120s delay) ---->|
   |<-- txHash 4 --------------|
   |<-- status: failed --------|
   |                            |
   +--- ALL RETRIES EXHAUSTED -+
   |                            |
   | Investment: FAILED         |
   | Notify admin              |
   | Manual investigation      |
```

**Recovery:**
1. Transaction retried 3 times with exponential backoff
2. After all retries: investment marked FAILED
3. DLQ job created for admin review
4. Admin can manually retry or cancel

### Scenario 3: Webhook Failure

```
FAILURE: WEBHOOK NOT RECEIVED
==============================

Backend                      Payment Provider
   |                            |
   |-- Create PaymentIntent -->|
   |<-- client_secret ---------|
   |                            |
   |   (payment succeeds)       |
   |                            |
   |   (webhook delayed...)     |
   |                            |
   +--- POLLING FALLBACK -------+
   |                            |
   |-- GET /payment_status --->|
   |<-- status: succeeded ------|
   |                            |
   +--- Process payment -------+
```

**Recovery:**
1. Webhook is primary method
2. Polling fallback every 60 seconds for pending payments
3. Payment status check via provider API
4. Idempotent processing (webhook or poll, not both)
5. Maximum polling: 30 minutes
6. After timeout: manual review

### Scenario 4: Partial Funding Timeout

```
FAILURE: FUNDING DEADLINE PASSED
==================================

Scheduled Job (every hour):
  For each deal in FUNDING state:
    if deal.fundingDeadline < now():
      if deal.fundedAmount < deal.totalTargetAmount:
        -> Transition to CLOSED
        -> Refund all confirmed investments
        -> Release escrow (if any)
        -> Notify all parties
```

**Recovery:**
1. All confirmed investments refunded
2. Blockchain transactions sent for refunds
3. Ledger entries reversed
4. Ownership tokens burned
5. All investors notified
6. Farmer notified with reason

### Scenario 5: Idempotency Key Reuse

```
IDEMPOTENCY PROTECTION
=======================

Request arrives with Idempotency-Key header

Backend:
  1. Check idempotency_keys table for key
  2. If found and not expired:
     - Return cached response (status + body)
     - Do NOT process again
  3. If not found:
     - Process request normally
     - Store { key, userId, endpoint, response, expiresAt }
     - Response cached for 24 hours

Duplicate Request Scenario:
  Client --> POST /api/v1/investments
            Idempotency-Key: abc-123
            Body: { dealId, amount, method }

  Backend processes, stores response.

  Client --> POST /api/v1/investments
            Idempotency-Key: abc-123
            Body: { dealId, amount, method }

  Backend finds existing key, returns cached response.
  No duplicate investment created.
```

---

## Retry Logic

```
RETRY STRATEGY BY QUEUE
=========================

blockchain-queue:
  Retries: 5
  Backoff: Fixed 60 seconds
  DLQ: Yes (after all retries)
  Reason: Blockchain congestion, RPC issues

payment-queue:
  Retries: 3
  Backoff: Exponential (10s, 30s, 90s)
  DLQ: Yes
  Reason: Provider timeout, transient errors

notification-queue:
  Retries: 3
  Backoff: Exponential (5s, 15s, 45s)
  DLQ: Yes
  Reason: Email/SMS provider issues

settlement-queue:
  Retries: 3
  Backoff: Fixed 30 seconds
  DLQ: Yes
  Reason: Payout processing issues

reconciliation-queue:
  Retries: 0 (scheduled job, manual retry)
  DLQ: No
  Reason: Reconciliation should not auto-retry

audit-queue:
  Retries: 1
  Backoff: Fixed 5 seconds
  DLQ: No (critical path, alert on failure)
  Reason: Audit logging should not block
```

---

## Reconciliation

### Daily Reconciliation Process

```
DAILY RECONCILIATION
=====================

Schedule: 01:00 UTC daily

Step 1: Payment Reconciliation
  - Compare payment records with Stripe/PayPal reports
  - Identify mismatches
  - Flag discrepancies for manual review
  - Auto-resolve minor differences (< $0.01)

Step 2: Ledger Reconciliation
  - Verify all debit/credit pairs balance
  - Check account balances match sum of entries
  - Verify total assets = total liabilities + equity
  - Flag unbalanced transactions

Step 3: Escrow Reconciliation
  - Compare escrow DB records with on-chain balances
  - Verify released amounts match distributions
  - Check locked amounts match active deals

Step 4: Blockchain Reconciliation
  - Verify all PENDING blockchain transactions
  - Check all CONFIRMED transactions match chain state
  - Verify ownership token counts match investment records
  - Re-index any missed events

Step 5: Investment Reconciliation
  - Verify total investments match total payments
  - Check all CONFIRMED investments have payments
  - Verify fundedAmount matches sum of confirmed investments per deal

Step 6: Generate Report
  - ReconciliationSummary {
      payments: { matched, mismatched, pending },
      ledger: { balanced, unbalanced },
      escrow: { matched, mismatched },
      blockchain: { synced, pending, failed },
      investments: { confirmed, pending, failed }
    }
  - Notify admin of results
  - Alert on critical mismatches
```

### Real-time Reconciliation

```
REAL-TIME CHECKS
=================

On every investment confirmation:
  1. Verify payment amount matches investment amount
  2. Verify ledger entries are balanced
  3. Verify escrow updated correctly
  4. Verify deal.fundedAmount is accurate

On every settlement:
  1. Verify settlement amount matches profit distribution
  2. Verify ledger entries for distribution
  3. Verify escrow release matches settlement

On every withdrawal:
  1. Verify investor balance >= withdrawal amount
  2. Verify ledger entries for withdrawal
  3. Verify payout matches requested amount
```

---

## Transaction Status Tracking

```
INVESTMENT TRANSACTION STATUS FLOW
====================================

INVESTMENT:
  PENDING -> CONFIRMED
  PENDING -> FAILED
  PENDING -> CANCELLED

PAYMENT:
  PENDING -> PROCESSING -> SUCCEEDED
  PENDING -> PROCESSING -> FAILED
  SUCCEEDED -> REFUNDED

INVESTMENT_TRANSACTION:
  PENDING -> PROCESSING -> COMPLETED
  PENDING -> PROCESSING -> FAILED

BLOCKCHAIN_TRANSACTION:
  PENDING -> SUBMITTED -> CONFIRMED
  PENDING -> SUBMITTED -> FAILED
  SUBMITTED -> DROPPED (gas too low, never mined)

LEDGER_TRANSACTION:
  PENDING -> POSTED
  POSTED -> REVERSED
```

---

## Timeout Handling

```
TIMEOUT CONFIGURATIONS
=======================

Blockchain TX Confirmation:
  Timeout: 10 minutes (Polygon ~2 min avg)
  Check interval: 5 seconds
  Max checks: 120

Payment Webhook:
  Timeout: 30 minutes
  Fallback: Poll payment status every 60s
  Max polling: 30 minutes

Escrow Release:
  Timeout: 5 minutes
  Retry: 3 times
  Alert: immediate after all retries

Settlement Processing:
  Timeout: 15 minutes
  Retry: 3 times
  Alert: immediate after all retries

Idempotency Key Expiry:
  TTL: 24 hours
  Cleanup: daily at 03:00 UTC
```

---

## Summary

| Scenario | Happy Path | Failure Recovery | Max Retries | Alert |
|---|---|---|---|---|
| Investment creation | ~5s | Retry/investor retry | N/A | No |
| Crypto payment | ~2min (block confirmation) | Retry tx 3x | 3 | Yes |
| Fiat payment | ~10s (webhook) | Poll fallback | N/A | Yes |
| Ledger posting | ~100ms | Transaction rollback | N/A | Yes |
| Token minting | ~2min (block confirmation) | Retry tx 3x | 3 | Yes |
| Settlement payout | ~5min | Retry 3x | 3 | Yes |
| Reconciliation | ~30min (daily) | Manual review | 0 | Yes |
