# Deal Lifecycle

## Overview

The deal lifecycle defines the complete journey of an agricultural investment deal from creation to closure. Each deal follows a strict state machine with defined transitions, allowed actions, emitted events, and blockchain synchronization.

---

## State Machine Diagram

```
DEAL LIFECYCLE STATE MACHINE
==============================

+--------+     +------------+     +--------------+     +----------+
| DRAFT  |---->| SUBMITTED  |---->| UNDER_REVIEW |---->| APPROVED |
+--------+     +------------+     +--------------+     +----+-----+
     |                                                       |
     |              +----------+                             |
     +------------->| REJECTED |<----------------------------+
     (farmer edits) +----------+                             |
                                                                |
                                  +-----------------------------+
                                  |
                                  v
                    +---------------------------+
                    | SMART_CONTRACT_CREATED    |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |      PUBLISHED            |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |        FUNDING            |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |        FUNDED             |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |        ACTIVE             |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |      HARVESTING           |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |  REVENUE_VERIFICATION     |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |  PROFIT_CALCULATION       |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |     DISTRIBUTION          |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |       SETTLED             |
                    +---------------------------+
                                  |
                                  v
                    +---------------------------+
                    |        CLOSED             |
                    +---------------------------+


FAILURE/RECOVERY TRANSITIONS:

  SUBMITTED ----> DRAFT (rejected, farmer re-edits)
  APPROVED   ----> DRAFT (blockchain deployment fails, re-edit)
  FUNDING    ----> DRAFT (deadline passed, no funding)
  ACTIVE     ----> ON_HOLD (external circumstances)
  ON_HOLD    ----> ACTIVE (resumed)
  Any non-terminal ----> CANCELLED (admin override)
```

---

## State Definitions

| State | Description | Category |
|---|---|---|
| `DRAFT` | Deal created by farmer, editable | Pre-Launch |
| `SUBMITTED` | Deal submitted for admin review | Pre-Launch |
| `UNDER_REVIEW` | Admin reviewing deal terms and farmer credentials | Pre-Launch |
| `APPROVED` | Deal approved, ready for smart contract deployment | Pre-Launch |
| `SMART_CONTRACT_CREATED` | Smart contract deployed on-chain | Pre-Launch |
| `PUBLISHED` | Deal visible to investors, ready for funding | Funding |
| `FUNDING` | Actively accepting investments | Funding |
| `FUNDED` | Target funding amount reached | Funding |
| `ACTIVE` | Deal active, farming operations underway | Active |
| `HARVESTING` | Harvest in progress | Active |
| `REVENUE_VERIFICATION` | Revenue being verified via oracle | Active |
| `PROFIT_CALCULATION` | Profits being calculated | Active |
| `DISTRIBUTION` | Profits being distributed to participants | Active |
| `SETTLED` | All settlements complete | Complete |
| `CLOSED` | Deal fully closed, no further activity | Complete |
| `REJECTED` | Deal rejected by admin (terminal) | Terminal |
| `CANCELLED` | Deal cancelled (terminal) | Terminal |

---

## Detailed State Transitions

### State: DRAFT

**Description:** Farmer has created a deal and is building out the terms.

**Allowed Actions:**
- Edit deal title, description, share percentages
- Edit deal terms (min/max investment, ROI, duration)
- Add/remove project documents
- Submit for review

**Guards:**
- User must be a FARMER
- User must be verified
- Deal must have a linked project
- At least one project milestone must exist
- Farmer share + investor share must equal 100%
- total_target_amount must be > 0

**Events Emitted:** None

**Blockchain State:** None

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `SUBMITTED` | `deal.submit()` | All required fields populated |

---

### State: SUBMITTED

**Description:** Farmer has submitted the deal for admin review. The deal is locked for editing.

**Allowed Actions:**
- View deal (farmer, admin)
- Cancel submission (farmer, returns to DRAFT)

**Guards:**
- Only the creating farmer can cancel

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.submitted` | `{ dealId, farmerId, title }` | NotificationModule (notify admins), AuditModule |

**Blockchain State:** None

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `UNDER_REVIEW` | `admin.startReview()` | Admin role required |
| `DRAFT` | `deal.cancel()` | Farmer role, deal owner |

---

### State: UNDER_REVIEW

**Description:** Admin is reviewing the deal. May request additional information.

**Allowed Actions:**
- View deal details, documents
- Request additional information
- Approve deal
- Reject deal with reason

**Guards:**
- Admin role required for all actions

**Events Emitted:** None during review (events on approval/rejection)

**Blockchain State:** None

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `APPROVED` | `deal.approve()` | Admin role, all checks pass |
| `REJECTED` | `deal.reject()` | Admin role, reason provided |
| `DRAFT` | `deal.requestChanges()` | Admin role, feedback provided |

**Admin Checklist:**
```
1. Verify farmer identity and credentials
2. Review deal terms for fairness
3. Verify project and farm documentation
4. Check crop viability and expected yields
5. Review financial projections
6. Verify risk disclosures
7. Ensure legal compliance
8. Check platform fee structure
```

---

### State: APPROVED

**Description:** Deal approved by admin. Backend will deploy the smart contract.

**Allowed Actions:**
- View deal (farmer, admin)
- Monitor deployment status

**Guards:**
- Smart contract deployment is in progress
- Retry logic for failed deployments

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.approved` | `{ dealId, adminId }` | BlockchainModule (deploy contract), NotificationModule, AuditModule |

**Blockchain State:** Deployment initiated

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `SMART_CONTRACT_CREATED` | `blockchain.contractDeployed()` | Contract deployed, address confirmed |
| `DRAFT` | `blockchain.deploymentFailed()` | Deployment failed after retries |

**Deployment Process:**
```
1. BlockchainService receives deal.approved event
2. Builds DealContract constructor args
3. Signs transaction with server wallet
4. Submits to RPC provider
5. Polls for confirmation (up to 100 blocks)
6. On success:
   - Store contract address on deal
   - Store deployment tx hash
   - Emit deal.smart_contract_created
7. On failure:
   - Retry up to 3 times with exponential backoff
   - If all retries fail, revert deal to DRAFT
   - Notify admin of deployment failure
```

---

### State: SMART_CONTRACT_CREATED

**Description:** Smart contract deployed on-chain. Brief transitional state.

**Allowed Actions:**
- View deal
- Verify contract on explorer

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.smart_contract_created` | `{ dealId, contractAddress, txHash }` | NotificationModule, AuditModule |

**Blockchain State:** Contract deployed, waiting for publish

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `PUBLISHED` | `deal.publish()` | Admin role, contract verified on explorer |

---

### State: PUBLISHED

**Description:** Deal is live and visible to investors. Not yet accepting investments.

**Allowed Actions:**
- View deal (all authenticated users)
- Share deal link
- Start accepting investments

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.published` | `{ dealId, title }` | NotificationModule (broadcast to investors), AuditModule |

**Blockchain State:** Contract deployed, not yet funded

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `FUNDING` | `deal.startFunding()` | Admin or automatic after publish delay |

---

### State: FUNDING

**Description:** Deal is actively accepting investments. Investors can fund.

**Allowed Actions:**
- Create investments (investors)
- View funding progress (all)
- View investor list (farmer, admin)
- Cancel investment (investor, before confirmation)

**Guards:**
- Investor must have KYC verified (if required)
- Investment amount must be within min/max range
- Deal must not be fully funded
- Funding deadline not passed

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `investment.created` | `{ investmentId, dealId, investorId, amount }` | PaymentModule, LedgerModule, AuditModule |
| `investment.confirmed` | `{ investmentId, txHash }` | InvestmentModule, BlockchainModule, NotificationModule |

**Blockchain State:** Contract accepting investments on-chain

**Investment Flow:**
```
1. Investor selects deal, reviews terms
2. Accepts terms and conditions
3. Chooses payment method (crypto or fiat)
4. Backend creates INVESTMENT (PENDING)
5. If crypto:
   a. Build blockchain transaction
   b. Request wallet signature
   c. Submit to chain
   d. Wait for confirmation
   e. Mint ownership tokens
6. If fiat:
   a. Create payment with provider (Stripe/PayPal)
   b. Redirect to checkout or collect card details
   c. Wait for webhook confirmation
   d. Process payment
7. On success:
   a. Set investment to CONFIRMED
   b. Update deal.funded_amount
   c. Create ledger entries
   d. Emit investment.confirmed
   e. Check if deal fully funded
8. On failure:
   a. Set investment to FAILED
   b. Emit investment.failed
   c. Notify investor
```

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `FUNDED` | `deal.targetReached()` | fundedAmount >= totalTargetAmount |
| `CLOSED` | `deal.fundingDeadlinePassed()` | Deadline passed, not fully funded |

---

### State: FUNDED

**Description:** Target funding amount reached. Transitioning to active state.

**Allowed Actions:**
- View deal (all)
- Monitor activation status

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.funded` | `{ dealId, totalFunded, investorCount }` | EscrowModule (create escrow), BlockchainModule (lock funds), NotificationModule, AuditModule |

**Blockchain State:** Funds locked in escrow contract

**Activation Process:**
```
1. EscrowModule creates escrow account for deal
2. Locks total funded amount
3. BlockchainModule locks funds on-chain
4. Creates ownership tokens for all investors
5. Transitions to ACTIVE
```

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `ACTIVE` | `deal.activate()` | Escrow created, funds locked |

---

### State: ACTIVE

**Description:** Deal is active. Farming operations are underway. Funds are in escrow.

**Allowed Actions:**
- View deal dashboard (farmer, investor, admin)
- Record expenses (farmer, admin)
- Record milestones (farmer)
- Submit oracle attestations (farmer, admin)
- View financial reports (investor, admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.activated` | `{ dealId }` | NotificationModule, AuditModule |

**Blockchain State:** Funds locked in escrow, ownership tokens distributed

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `HARVESTING` | `deal.startHarvesting()` | Admin or farmer initiated, crop season appropriate |

---

### State: HARVESTING

**Description:** Harvest is in progress. Farmer recording harvest data.

**Allowed Actions:**
- Record harvests (farmer)
- Upload harvest documentation
- Submit harvest attestation to oracle
- View harvest progress (investor, admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.harvesting_started` | `{ dealId }` | NotificationModule, AuditModule |
| `harvest.recorded` | `{ harvestId, dealId, quantity }` | AuditModule |

**Blockchain State:** Same as ACTIVE

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `REVENUE_VERIFICATION` | `deal.harvestComplete()` | All harvests recorded, oracle attested |

---

### State: REVENUE_VERIFICATION

**Description:** Harvest complete, revenue being verified and recorded.

**Allowed Actions:**
- Record sales (farmer)
- Submit revenue attestation (oracle)
- Verify revenue (admin)
- Record expenses (farmer)
- View revenue reports (investor, admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `oracle.attestation_confirmed` | `{ attestationId, dealId }` | ProfitModule, AuditModule |
| `revenue.recorded` | `{ revenueId, dealId, amount }` | AuditModule |

**Blockchain State:** Oracle attestations submitted on-chain

**Verification Process:**
```
1. Farmer records sales transactions
2. OracleModule creates attestation with data hash
3. Attestation submitted to on-chain Oracle contract
4. Admin verifies attestation data
5. Revenue totals calculated
6. Expenses approved and totaled
7. Net profit determined
```

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `PROFIT_CALCULATION` | `deal.revenueVerified()` | All revenue verified, expenses approved |

---

### State: PROFIT_CALCULATION

**Description:** Profits being calculated based on verified revenue and expenses.

**Allowed Actions:**
- View calculation details (farmer, investor, admin)
- Approve calculation (admin)
- Trigger distribution (admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `profit.calculated` | `{ profitId, dealId, netProfit }` | SettlementModule, NotificationModule |

**Calculation Process:**
```
1. Sum all verified revenue for period
2. Sum all approved expenses for period
3. netProfit = totalRevenue - totalExpenses
4. platformFee = netProfit * platformFeePercent
5. distributableProfit = netProfit - platformFee
6. farmerShare = distributableProfit * farmerSharePercent
7. investorShare = distributableProfit * investorSharePercent
8. Per-investor share = investorShare * (investmentAmount / totalFundedAmount)
9. Create ledger entries for all calculations
```

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `DISTRIBUTION` | `deal.distributeProfits()` | Admin approval, calculation confirmed |

---

### State: DISTRIBUTION

**Description:** Profits being distributed to farmers, investors, and platform.

**Allowed Actions:**
- Monitor distribution status (all)
- View distribution details (investor)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `profit.distributed` | `{ profitId, distributions }` | SettlementModule, NotificationModule, AuditModule |

**Distribution Process:**
```
1. EscrowModule releases funds per distribution
2. For crypto distributions:
   a. Transfer tokens from escrow to investor wallets
   b. Record blockchain transaction
3. For fiat distributions:
   a. Create settlement for each investor
   b. Process payment via provider
   c. Record payment transaction
4. Platform fee transferred to platform account
5. Farmer share transferred to farmer
6. All ledger entries posted
7. Each investor notified of their distribution
```

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `SETTLED` | `deal.allSettled()` | All settlements completed |

---

### State: SETTLED

**Description:** All profit distributions complete. Awaiting final closure.

**Allowed Actions:**
- View final deal summary (all)
- Request withdrawal (investor)
- Export deal report (admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `settlement.completed` | `{ dealId }` | AuditModule |

**Transitions:**
| Target State | Trigger | Guard |
|---|---|---|
| `CLOSED` | `deal.close()` | Admin action, final report generated |

---

### State: CLOSED

**Description:** Deal fully closed. No further activity possible. Historical record.

**Allowed Actions:**
- View deal archive (all)
- Export reports (admin)

**Events Emitted:**
| Event | Payload | Consumers |
|---|---|---|
| `deal.closed` | `{ dealId }` | AuditModule |

**Blockchain State:** Final state, contract self-destructed or frozen

---

## Failure and Recovery Scenarios

### Scenario 1: Smart Contract Deployment Failure

```
APPROVED --> (deployment fails) --> DRAFT

Recovery:
1. Admin notified of deployment failure
2. Deal reverted to DRAFT
3. Farmer can re-edit and resubmit
4. Audit log records failure and reason
5. Admin investigates root cause
6. Deal resubmitted through normal flow
```

### Scenario 2: Investment Payment Failure

```
FUNDING --> (payment fails) --> FUNDING (investment stays PENDING/FAILED)

Recovery:
1. Investment marked as FAILED
2. No ledger entries created (or reversed if partially created)
3. Investor notified with failure reason
4. Investor can retry with different payment method
5. Other investments unaffected
```

### Scenario 3: Blockchain Transaction Failure

```
FUNDING --> (tx fails) --> FUNDING

Recovery:
1. Transaction marked as FAILED in blockchain_transactions
2. BullMQ retries up to 5 times (exponential backoff)
3. If all retries fail:
   a. Investment reverted to PENDING
   b. Admin notified
   c. Manual intervention required
4. Gas estimation may prevent failures (pre-check)
```

### Scenario 4: Funding Deadline Passes

```
FUNDING --> (deadline passed, not fully funded) --> CLOSED

Recovery:
1. Scheduled job checks funding deadlines every hour
2. If deadline passed and fundedAmount < totalTargetAmount:
   a. Deal transitions to CLOSED
   b. All confirmed investments refunded
   c. Escrow funds released back to investors
   d. All investors notified
   e. Farmer notified
   f. Smart contract paused/frozen
```

### Scenario 5: Oracle Attestation Failure

```
REVENUE_VERIFICATION --> (attestation rejected) --> REVENUE_VERIFICATION

Recovery:
1. Oracle attestation marked as rejected
2. Admin notified with rejection reason
3. Farmer can resubmit corrected attestation
4. Process repeats until attestation verified
5. No deal state change until all attestations confirmed
```

### Scenario 6: Settlement Failure

```
DISTRIBUTION --> (settlement fails) --> DISTRIBUTION

Recovery:
1. Settlement marked as FAILED
2. Specific investor's distribution failed
3. Other settlements continue processing
4. Failed settlement retried (up to 3 times)
5. If all retries fail:
   a. Admin notified
   b. Manual settlement processing
   c. Escrow funds remain locked until resolved
```

### Scenario 7: Chain Reorganization

```
CONFIRMED --> (chain reorg) --> Re-evaluation

Recovery:
1. BlockchainIndexer detects chain reorg by block hash mismatch
2. Affected transactions re-evaluated
3. If block removed:
   a. Transaction reverted to PENDING
   b. Re-indexed from new chain state
   c. Events re-processed
4. Database updated to reflect new chain state
```

---

## Blockchain State Synchronization

```
BLOCKCHAIN STATE SYNC
======================

Backend Database                    Blockchain
+-------------------+              +-------------------+
| deal.status       |              | DealContract      |
|                   |              | .status           |
| deal.funded_amount| <----------> | .totalFunded      |
| deal.contract_addr|              | .owner            |
|                   |              | .investors[]      |
+-------------------+              +-------------------+

Sync Strategy:
1. Event-driven: Blockchain events update DB
2. Polling: Every 5 min, compare DB vs chain state
3. Reconciliation: Daily full sync check
4. Conflict resolution: Chain is source of truth

Sync Points:
- Deployment: contract address stored in DB
- Investment: on-chain amount matches DB fundedAmount
- Escrow: locked amount matches DB
- Distribution: distributions match on-chain transfers
- Milestone: on-chain attestation matches DB
```

---

## Dashboard State Summary

```
DEAL DASHBOARD BY ROLE
========================

Farmer Dashboard:
+------------------+
| Active Deals: 3  |
| Pending Review: 1|
| Closed Deals: 5  |
| Total Earned: $X |
+------------------+

Investor Dashboard:
+------------------+
| Active: 7        |
| Funding: 2       |
| Settled: 12      |
| Total Returns: $X|
| ROI: XX%         |
+------------------+

Admin Dashboard:
+-------------------+
| Pending Reviews: 5|
| Active Deals: 15  |
| Total Volume: $X  |
| Platform Fees: $X |
| Needs Attention: 2|
+-------------------+
```
