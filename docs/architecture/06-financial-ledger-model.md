# Financial Ledger Model

## Overview

The Agriculture Profit-Sharing Platform uses a double-entry accounting system to track all financial movements. Every financial event creates a ledger transaction with at least two ledger entries (debit and credit) that must balance. This ensures data integrity, auditability, and accurate financial reporting.

---

## Double-Entry Ledger Model

```
DOUBLE-ENTRY LEDGER MODEL
==========================

Every financial event creates:
  1. Ledger Transaction (grouping record)
  2. 2+ Ledger Entries (debit + credit)
  3. Account balance update
  4. Audit log entry

Example:
  Investor deposits $1000

  Ledger Transaction:
    id: tx-001
    type: INVESTMENT
    reference: investment-{id}
    status: POSTED

  Ledger Entries:
    Entry 1: Debit  Escrow Account        +$1000
    Entry 2: Credit Investor Receivable   +$1000

  Balance Verification:
    Debits ($1000) = Credits ($1000)  --> BALANCED
```

---

## Account Structure

```
ACCOUNT HIERARCHY
==================

1000 - ASSETS
├── 1100 - Fiat Balances
│   ├── 1110 - Platform Operating Account
│   ├── 1120 - Platform Fee Account
│   └── 1130 - Farmer Payout Account
├── 1200 - Crypto Balances
│   ├── 1210 - Platform Hot Wallet (ETH/MATIC)
│   └── 1220 - Platform Token Account
├── 1300 - Escrow
│   ├── 1310 - Escrow {dealId-1}
│   ├── 1320 - Escrow {dealId-2}
│   └── 13xx - Escrow {dealId-N}
├── 1400 - Receivable
│   ├── 1410 - Investor Receivable
│   ├── 1420 - Farmer Receivable
│   └── 1430 - Platform Fee Receivable
└── 1500 - Prepaid
    └── 1510 - Gas Prepaid

2000 - LIABILITIES
├── 2100 - Payable
│   ├── 2110 - Investor Payable (refund due)
│   ├── 2120 - Farmer Payable
│   └── 2130 - Vendor Payable
├── 2200 - Deferred Revenue
│   └── 2210 - Platform Fee Deferred
└── 2300 - Tax Liability
    └── 2310 - Withholding Tax

3000 - EQUITY
├── 3100 - Investment Capital
│   ├── 3110 - Investor A Capital
│   ├── 3120 - Investor B Capital
│   └── 31xx - Investor N Capital
├── 3200 - Retained Earnings
│   └── 3210 - Cumulative Retained
└── 3300 - Owner's Equity
    └── 3310 - Platform Equity

4000 - REVENUE
├── 4100 - Sales Revenue
│   ├── 4110 - Crop Sales
│   ├── 4120 - Livestock Sales
│   └── 4130 - Other Sales
├── 4200 - Investment Revenue
│   ├── 4210 - Deal Returns
│   └── 4220 - Capital Gains
├── 4300 - Platform Revenue
│   ├── 4310 - Platform Fees
│   ├── 4320 - Transaction Fees
│   └── 4330 - Premium Features
└── 4400 - Other Revenue
    ├── 4410 - Insurance Payouts
    └── 4420 - Government Grants

5000 - EXPENSES
├── 5100 - Operational Expenses
│   ├── 5110 - Seeds & Inputs
│   ├── 5120 - Fertilizer
│   ├── 5130 - Labor
│   ├── 5140 - Equipment
│   ├── 5150 - Irrigation
│   ├── 5160 - Transport
│   ├── 5170 - Storage
│   └── 5180 - Other Operational
├── 5200 - Platform Expenses
│   ├── 5210 - Hosting & Infrastructure
│   ├── 5220 - Payment Processing Fees
│   ├── 5230 - Gas/Fees (Blockchain)
│   ├── 5240 - KYC Provider Fees
│   ├── 5250 - Insurance
│   └── 5260 - Legal & Compliance
├── 5300 - Administrative
│   ├── 5310 - Salaries
│   ├── 5320 - Office
│   └── 5330 - Marketing
└── 5400 - Depreciation
    ├── 5410 - Equipment Depreciation
    └── 5420 - Intangible Amortization
```

---

## Account Types and Rules

```
ACCOUNT TYPE RULES
===================

ASSET accounts:
  Normal balance: DEBIT
  Increases: Debit
  Decreases: Credit
  Examples: Cash, Escrow, Receivables

LIABILITY accounts:
  Normal balance: CREDIT
  Increases: Credit
  Decreases: Debit
  Examples: Payables, Deferred Revenue

EQUITY accounts:
  Normal balance: CREDIT
  Increases: Credit
  Decreases: Debit
  Examples: Investment Capital, Retained Earnings

REVENUE accounts:
  Normal balance: CREDIT
  Increases: Credit
  Decreases: Debit
  Examples: Sales, Platform Fees

EXPENSE accounts:
  Normal balance: DEBIT
  Increases: Debit
  Decreases: Credit
  Examples: Operational costs, Gas fees
```

---

## Entry Rules

```
VALIDATION RULES
=================

1. BALANCE RULE
   For every Ledger Transaction:
     SUM(all debits) == SUM(all credits)

2. MINIMUM ENTRIES
   Every transaction must have at least:
     - 1 debit entry
     - 1 credit entry

3. NON-NULL RULES
   Every entry must have:
     - debit > 0 XOR credit > 0
     - NOT (debit > 0 AND credit > 0)

4. POSTING RULE
   Ledger Transaction status transitions:
     PENDING -> POSTED (when all entries balanced)
     POSTED -> REVERSED (when reversing)

5. IMMUTABILITY
   Posted entries cannot be modified
   Corrections via reversal + new entries

6. ORDERING
   Entries within a transaction are atomic
   All entries posted together (single DB transaction)
```

---

## Balance Calculation

```
BALANCE CALCULATION
====================

Account Balance = SUM(debit) - SUM(credit)  [for ASSET/EXPENSE accounts]
Account Balance = SUM(credit) - SUM(debit)  [for LIABILITY/EQUITY/REVENUE]

Running Balance (balance_after on each entry):
  For ASSET account:
    balance_after = previous_balance + debit - credit

  For LIABILITY account:
    balance_after = previous_balance + credit - debit

Verification:
  All accounts must satisfy:
    Total Assets = Total Liabilities + Total Equity

  This is checked:
    - On every POSTED transaction
    - During daily reconciliation
    - During monthly close
```

---

## Example Transactions

### Transaction 1: Investment Deposit (Crypto)

```
SCENARIO: Investor A deposits 1 ETH into Deal #1

Ledger Transaction:
  id: lt-001
  type: INVESTMENT
  reference_type: investment
  reference_id: inv-abc
  status: POSTED
  description: Investment by Investor A in Deal #1

Ledger Entries:
  Entry 1:
    account: 1310 (Escrow Deal #1)
    debit:  1.0 ETH
    credit: 0
    balance_after: 1.0 ETH

  Entry 2:
    account: 1410 (Investor Receivable)
    debit:  0
    credit: 1.0 ETH
    balance_after: -1.0 ETH

Balance Check: 1.0 ETH debit = 1.0 ETH credit --> BALANCED
```

### Transaction 2: Investment Deposit (Fiat via Stripe)

```
SCENARIO: Investor B deposits $5000 via Stripe into Deal #1

Ledger Transaction:
  id: lt-002
  type: PAYMENT
  reference_type: payment
  reference_id: pay-xyz
  status: POSTED
  description: Stripe payment by Investor B

Ledger Entries:
  Entry 1:
    account: 1110 (Platform Operating)
    debit:  $5000
    credit: $0
    balance_after: $5000

  Entry 2:
    account: 2210 (Platform Fee Deferred)
    debit:  $0
    credit: $125 (2.5% fee, deferred until deal closes)
    balance_after: $125

  Entry 3:
    account: 1410 (Investor Receivable)
    debit:  $0
    credit: $4875 (net amount after fee)
    balance_after: -$4875

Balance Check: $5000 debit = $125 + $4875 credit --> BALANCED
```

### Transaction 3: Expense Recording

```
SCENARIO: Farmer spends $200 on seeds for Deal #1

Ledger Transaction:
  id: lt-003
  type: OTHER
  reference_type: expense
  reference_id: exp-seed-001
  status: POSTED
  description: Seed purchase for Deal #1

Ledger Entries:
  Entry 1:
    account: 5110 (Seeds & Inputs)
    debit:  $200
    credit: $0
    balance_after: $200

  Entry 2:
    account: 1310 (Escrow Deal #1)
    debit:  $0
    credit: $200
    balance_after: $4800 (was $5000)

Balance Check: $200 debit = $200 credit --> BALANCED
```

### Transaction 4: Profit Distribution

```
SCENARIO: Deal #1 generates $1000 profit, distributed as:
  - Platform fee: $50 (5%)
  - Farmer share: $400 (40% of remaining)
  - Investor share: $550 (55% of remaining)

Ledger Transaction:
  id: lt-004
  type: PROFIT_DISTRIBUTION
  reference_type: profit_calculation
  reference_id: pc-001
  status: POSTED
  description: Profit distribution for Deal #1

Ledger Entries:
  Entry 1 (Platform fee):
    account: 4310 (Platform Fees) - REVENUE
    debit:  $0
    credit: $50
    balance_after: $50

  Entry 2 (Farmer share):
    account: 1420 (Farmer Receivable) - ASSET
    debit:  $0
    credit: $400
    balance_after: -$400

  Entry 3 (Investor share):
    account: 1410 (Investor Receivable) - ASSET
    debit:  $0
    credit: $550
    balance_after: -$550

  Entry 4 (Escrow release):
    account: 1310 (Escrow Deal #1) - ASSET
    debit:  $0
    credit: $1000
    balance_after: $3800

Balance Check: $0 debit = $50 + $400 + $550 + $1000 credit
  = $2000 credit... wait, let me recalculate.

  Actually, the entry should be:
  Entry 4 (Escrow release):
    account: 1310 (Escrow Deal #1) - ASSET
    debit:  $1000
    credit: $0
    balance_after: $3800

  Total debits: $1000
  Total credits: $50 + $400 + $550 = $1000
  BALANCED
```

### Transaction 5: Investor Withdrawal

```
SCENARIO: Investor A withdraws $2000 from their account

Ledger Transaction:
  id: lt-005
  type: WITHDRAWAL
  reference_type: withdrawal
  reference_id: w-abc-001
  status: POSTED
  description: Withdrawal by Investor A

Ledger Entries:
  Entry 1:
    account: 2110 (Investor Payable) - LIABILITY
    debit:  $2000
    credit: $0

  Entry 2:
    account: 1110 (Platform Operating) - ASSET
    debit:  $0
    credit: $2000

Balance Check: $2000 debit = $2000 credit --> BALANCED
```

### Transaction 6: Escrow Lock

```
SCENARIO: Lock funds in escrow when deal is fully funded

Ledger Transaction:
  id: lt-006
  type: ESCROW_LOCK
  reference_type: escrow
  reference_id: esc-deal1
  status: POSTED
  description: Escrow lock for Deal #1

Ledger Entries:
  Entry 1:
    account: 1310 (Escrow Deal #1) - ASSET
    debit:  $10000
    credit: $0

  Entry 2:
    account: 1410 (Investor Receivable) - ASSET
    debit:  $0
    credit: $10000

Balance Check: $10000 debit = $10000 credit --> BALANCED
```

---

## Reconciliation Approach

```
RECONCILIATION FRAMEWORK
==========================

Level 1: Transaction-Level
  On every POSTED transaction:
    Verify: SUM(debits) == SUM(credits)
    Verify: Every entry has exactly one of debit or credit > 0
    Verify: balance_after is correct

Level 2: Account-Level (Daily)
  For each account:
    Recalculate balance from all entries
    Compare with stored balance
    Flag discrepancies > $0.01

Level 3: Trial Balance (Daily)
  Generate trial balance:
    Total Debits across all accounts == Total Credits
    Total Assets == Total Liabilities + Total Equity
    Revenue - Expenses == Net Income

Level 4: External Reconciliation (Daily)
  Payment providers:
    Stripe balance == Sum of all Stripe payment records
    PayPal balance == Sum of all PayPal payment records

  Blockchain:
    Escrow contract balance == Sum of all escrow DB records
    Hot wallet balance == DB crypto balance - pending gas

Level 5: Full Audit (Monthly)
  Independent review of:
    All transactions for the month
    Account balance history
    Reconciliation reports
    Anomaly detection
```

---

## Reversal Process

```
LEDGER REVERSAL
================

When an error is found in a posted transaction:

1. Create a new Ledger Transaction:
   type: REVERSAL
   reversed_by: original transaction ID
   status: POSTED

2. Create reversal entries (mirror of original):
   Original: Debit Account A, Credit Account B
   Reversal: Debit Account B, Credit Account A

3. Original transaction status: REVERSED

4. If correct transaction needed:
   Create new Ledger Transaction with correct entries

Rules:
  - Only POSTED transactions can be reversed
  - Reversal must reference original transaction
  - Original entries are never modified or deleted
  - Audit log records both reversal and reason
```

---

## Currency Handling

```
MULTI-CURRENCY SUPPORT
========================

Each account has a currency (USD, ETH, MATIC, USDC, etc.)

Cross-currency transactions:
  When converting ETH to USD:
    Ledger Transaction type: EXCHANGE

    Entry 1: Debit  Platform USD Account    +$3000
    Entry 2: Credit Platform ETH Account   -1.0 ETH
    Entry 3: Debit  Exchange Loss           +$50 (spread)
    Entry 4: Credit Exchange Gain           -$50 (to provider)

  Exchange rate recorded in metadata for audit trail.
  Rates fetched from oracle at time of transaction.
```
