# Smart Contract Architecture

## Overview

The blockchain layer uses Solidity smart contracts deployed on an EVM-compatible chain (Polygon for production, Sepolia for testing). The contract suite manages project registration, deal creation, investment tracking, ownership tokens, escrow, and profit distribution.

---

## Smart Contract Architecture Diagram

```
SMART CONTRACT ARCHITECTURE
============================

+---------------------------------------------+
|              AccessControl                    |
|         (OpenZeppelin RBAC)                  |
+----------------------------------------------+
                    |
     +--------------+--------------+
     |              |              |
+----v----+  +-----v------+  +---v--------+
|Project  |  | DealFactory|  |  Escrow    |
|Registry |  |            |  |  Contract  |
|         |  | Creates    |  |            |
| Register|  | Deal       |  | Lock       |
| Verify  |  | Contracts  |  | Release    |
+----+----+  +-----+------+  +---+--------+
     |              |              |
     |              v              |
     |     +----------------+     |
     |     |  DealContract  |     |
     |     |  (Proxy)       |     |
     |     |                |     |
     |     |  Terms         |     |
     |     |  Investment    |     |
     |     |  Milestones    |     |
     |     +-------+--------+     |
     |             |              |
     +------+------+--------------+
            |
   +--------+--------+
   |                  |
+--v----------+  +---v-----------+
|Ownership    |  |ProfitDistrib. |
|Token        |  |Contract       |
|(ERC-721)    |  |               |
|             |  | Calculate     |
| Units       |  | Distribute    |
| Transfer    |  | Record        |
+-------------+  +---------------+
```

---

## Contract 1: ProjectRegistry.sol

```
PROJECT REGISTRY
=================

Purpose: Register and verify agricultural projects on-chain.

State Variables:
  struct Project {
    uint256 id;
    address farmer;
    string  metadataHash;      // IPFS hash of project details
    bool    isVerified;
    uint256 createdAt;
    uint256 updatedAt;
  }

  mapping(uint256 => Project) public projects;
  uint256 public projectCount;
  mapping(address => bool) public verifiers;  // authorized verifiers

Events:
  event ProjectRegistered(uint256 indexed projectId, address indexed farmer, string metadataHash);
  event ProjectVerified(uint256 indexed projectId, address indexed verifier);
  event VerifierAdded(address indexed verifier);
  event VerifierRemoved(address indexed verifier);

Functions:
  registerProject(string calldata metadataHash) external onlyFarmer returns (uint256)
  verifyProject(uint256 projectId) external onlyVerifier
  addVerifier(address verifier) external onlyAdmin
  removeVerifier(address verifier) external onlyAdmin
  getProject(uint256 projectId) external view returns (Project memory)
  getProjectsByFarmer(address farmer) external view returns (uint256[] memory)

Access Control:
  Roles: FARMER, VERIFIER, ADMIN
  Only farmers can register projects
  Only verifiers can verify projects
  Only admin can manage verifiers

Security:
  ReentrancyGuard on state-changing functions
  Input validation on metadataHash (non-empty, reasonable length)

Invariants:
  projectCount only increases
  isVerified can only go from false to true
  farmer address cannot be zero
```

---

## Contract 2: DealFactory.sol

```
DEAL FACTORY
=============

Purpose: Create DealContract instances via minimal proxy pattern (EIP-1167).

State Variables:
  struct DealParams {
    uint256 projectId;
    address farmer;
    uint256 totalTargetAmount;
    uint256 farmerSharePercent;   // basis points (100 = 1%)
    uint256 investorSharePercent;
    uint256 platformFeePercent;
    uint256 minInvestment;
    uint256 maxInvestment;
    uint256 expectedROI;
    uint256 durationDays;
    string  metadataHash;
  }

  address public dealImplementation;
  mapping(uint256 => address) public projectDeals; // projectId => deal address
  uint256[] public allDeals;
  mapping(address => bool) public admins;

Events:
  event DealCreated(uint256 indexed projectId, address indexed dealAddress, address indexed farmer);
  event ImplementationUpdated(address oldImpl, address newImpl);
  event AdminAdded(address indexed admin);
  event AdminRemoved(address indexed admin);

Functions:
  createDeal(DealParams calldata params) external onlyFarmer returns (address)
  setImplementation(address newImpl) external onlyAdmin
  addAdmin(address admin) external onlyOwner
  removeAdmin(address admin) external onlyOwner
  getDeal(uint256 projectId) external view returns (address)
  getAllDeals() external view returns (address[] memory)
  getDealCount() external view returns (uint256)

Access Control:
  Roles: FARMER, ADMIN, OWNER
  Only farmers can create deals
  Only admin can change implementation
  Only owner can manage admins

Security:
  ReentrancyGuard on createDeal
  Project must be verified before deal creation
  One deal per project enforced
  Platform fee capped at 10% (1000 basis points)
  farmerShare + investorShare + platformFee == 10000

Invariants:
  Each project can have at most one deal
  Implementation address cannot be zero
  Total shares must sum to 100%
```

---

## Contract 3: DealContract.sol (Proxy)

```
DEAL CONTRACT
==============

Purpose: Manage deal lifecycle, investments, and milestone tracking.
Deployed as minimal proxy (EIP-1167) via DealFactory.

State Variables:
  enum Status {
    Created,
    Active,
    Funding,
    Funded,
    Harvesting,
    RevenueVerified,
    ProfitCalculated,
    Distributing,
    Settled,
    Closed,
    Cancelled
  }

  struct DealInfo {
    uint256 projectId;
    address farmer;
    address escrowContract;
    uint256 totalTargetAmount;
    uint256 fundedAmount;
    uint256 farmerSharePercent;
    uint256 investorSharePercent;
    uint256 platformFeePercent;
    uint256 minInvestment;
    uint256 maxInvestment;
    uint256 expectedROI;
    uint256 durationDays;
    uint256 createdAt;
    uint256 fundingDeadline;
    Status  status;
    string  metadataHash;
  }

  struct Milestone {
    uint256 id;
    string  description;
    uint256 targetAmount;
    uint256 completedAmount;
    bool    isCompleted;
    bool    isVerified;
    uint256 completedAt;
    uint256 verifiedAt;
  }

  struct InvestorRecord {
    address investor;
    uint256 amount;
    uint256 units;
    uint256 investedAt;
    bool    isActive;
  }

  DealInfo public deal;
  InvestorRecord[] public investors;
  mapping(address => uint256) public investorAmounts; // investor => total invested
  Milestone[] public milestones;
  uint256 public totalInvestors;

Events:
  event InvestmentMade(address indexed investor, uint256 amount, uint256 units);
  event DealFunded(uint256 totalFunded);
  event MilestoneAdded(uint256 indexed milestoneId, string description, uint256 targetAmount);
  event MilestoneCompleted(uint256 indexed milestoneId, uint256 completedAmount);
  event MilestoneVerified(uint256 indexed milestoneId);
  event ProfitDistributed(uint256 totalProfit, uint256 platformFee);
  event DealSettled();
  event DealClosed();
  event StatusChanged(Status oldStatus, Status newStatus);

Functions:
  // Investment
  invest(uint256 amount) external onlyInvestor returns (uint256 units)
  claimRefund() external onlyInvestor

  // Milestones
  addMilestone(string calldata description, uint256 targetAmount) external onlyFarmer
  completeMilestone(uint256 milestoneId, uint256 amount) external onlyFarmer
  verifyMilestone(uint256 milestoneId) external onlyVerifier

  // Lifecycle
  startFunding(uint256 deadline) external onlyFarmer
  activate() external onlyFarmer
  startHarvesting() external onlyFarmer
  markRevenueVerified() external onlyVerifier
  calculateProfit(uint256 totalRevenue, uint256 totalExpenses) external onlyPlatform
  distribute() external onlyPlatform
  settle() external onlyPlatform
  close() external onlyAdmin
  cancel() external onlyAdmin

  // Views
  getInvestors() external view returns (InvestorRecord[] memory)
  getMilestones() external view returns (Milestone[] memory)
  getInvestorAmount(address investor) external view returns (uint256)
  getDealInfo() external view returns (DealInfo memory)

Access Control:
  Roles: FARMER (deal creator), INVESTOR, VERIFIER, PLATFORM, ADMIN
  State machine enforced: only valid transitions allowed
  Each function has modifier checking current status

Security:
  ReentrancyGuard on invest() and distribute()
  Checks-Effects-Interactions pattern
  Overflow protection (Solidity 0.8+)
  Investment amount range validation
  Funding cap enforcement (cannot overfund)
  Platform fee calculated correctly (basis points)
  Pausable for emergency stop

Invariants:
  fundedAmount <= totalTargetAmount
  investorAmounts[investor] >= minInvestment (when investing)
  investorAmounts[investor] <= maxInvestment (when investing)
  Status transitions are monotonic (forward only, except cancel)
  Platform fee <= 10%
  farmerShare + investorShare + platformFee == 10000
  All milestones must be verified before profit calculation
  Total invested == fundedAmount
```

---

## Contract 4: OwnershipToken.sol (ERC-721)

```
OWNERSHIP TOKEN
================

Purpose: Represent fractional ownership in deals as ERC-721 NFTs.
Each token represents a unit of ownership with a specific percentage.

State Variables:
  struct TokenInfo {
    uint256 dealId;
    address investor;
    uint256 ownershipPercent; // basis points
    uint256 mintedAt;
    bool    isActive;
  }

  mapping(uint256 => TokenInfo) public tokenInfo; // tokenId => info
  mapping(uint256 => uint256[]) public dealTokens; // dealId => tokenIds
  mapping(address => uint256[]) public userTokens; // owner => tokenIds
  uint256 public nextTokenId;
  string public name;     // "AgriPlatform Ownership"
  string public symbol;   // "APO"

Events:
  event TokenMinted(uint256 indexed tokenId, uint256 indexed dealId, address indexed investor, uint256 ownershipPercent);
  event TokenBurned(uint256 indexed tokenId);
  event OwnershipUpdated(uint256 indexed tokenId, address oldOwner, address newOwner);

Functions:
  // Minting (only platform contract)
  mint(address investor, uint256 dealId, uint256 ownershipPercent) external onlyPlatform returns (uint256)
  mintBatch(address investor, uint256 dealId, uint256[] calldata percents) external onlyPlatform returns (uint256[] memory)

  // Burning
  burn(uint256 tokenId) external onlyTokenOwner

  // Views
  getDealTokens(uint256 dealId) external view returns (uint256[] memory)
  getUserTokens(address user) external view returns (uint256[] memory)
  getTokenInfo(uint256 tokenId) external view returns (TokenInfo memory)
  getDealOwnershipBreakdown(uint256 dealId) external view returns (address[] memory owners, uint256[] memory percents)
  getTotalOwnership(uint256 dealId) external view returns (uint256 totalPercent)

  // ERC-721 standard
  supportsInterface(bytes4 interfaceId) public view returns (bool)
  balanceOf(address owner) public view returns (uint256)
  ownerOf(uint256 tokenId) public view returns (address)
  transferFrom(address from, address to, uint256 tokenId) public  // restricted

Access Control:
  Only PLATFORM_ROLE can mint tokens
  Only token owner can burn
  Transfer is restricted (tokens not freely tradeable)
  Only admin can enable/disable transfers

Security:
  ReentrancyGuard on mint functions
  Ownership percentage validation (must sum to 100% per deal)
  Token IDs are sequential and unique
  Burn reduces total supply correctly
  No unlimited minting (must match investment amounts)

Invariants:
  Total ownership per deal always sums to 100%
  Token count per deal = number of confirmed investments
  Each token has exactly one owner
  Token cannot be transferred to address(0)
  Burned tokens are marked inactive
```

---

## Contract 5: EscrowContract.sol

```
ESCROW CONTRACT
================

Purpose: Hold and release funds based on deal milestones and profit distribution.

State Variables:
  struct EscrowInfo {
    uint256 dealId;
    uint256 totalLocked;
    uint256 totalReleased;
    uint256 totalRefunded;
    bool    isActive;
    address owner;  // DealContract address
  }

  struct ReleaseRecord {
    uint256 amount;
    address recipient;
    uint256 milestoneId;
    uint256 releasedAt;
    string  reason;
  }

  EscrowInfo public escrow;
  ReleaseRecord[] public releases;
  mapping(address => uint256) public balances; // token => amount (for ERC-20)

Events:
  event FundsLocked(uint256 amount, address from);
  event FundsReleased(uint256 amount, address indexed recipient, uint256 milestoneId);
  event FundsRefunded(uint256 amount, address indexed recipient);
  event FeeDeducted(uint256 amount);
  event EscrowClosed();

Functions:
  // Deposits
  receive() external payable                     // ETH deposits
  depositERC20(address token, uint256 amount) external  // ERC-20 deposits

  // Releases
  releaseToAddress(address recipient, uint256 amount, uint256 milestoneId, string calldata reason) external onlyOwner
  releaseBatch(address[] calldata recipients, uint256[] calldata amounts, string calldata reason) external onlyOwner

  // Refunds
  refundInvestor(address investor, uint256 amount) external onlyOwner

  // Fees
  deductPlatformFee(uint256 amount) external onlyOwner

  // Views
  getAvailableBalance() external view returns (uint256)
  getETHBalance() external view returns (uint256)
  getERC20Balance(address token) external view returns (uint256)
  getReleases() external view returns (ReleaseRecord[] memory)
  getTotalReleased() external view returns (uint256)

  // Lifecycle
  close() external onlyOwner

Access Control:
  Only OWNER (DealContract) can release/refund/deduct fees
  Only admin can close

Security:
  ReentrancyGuard on all state-changing functions
  Checks-Effects-Interactions pattern
  Amount validation (cannot release more than available)
  Recipient cannot be address(0)
  Emergency pause capability
  Multi-release batch operations are atomic (all succeed or all fail)

Invariants:
  totalLocked >= totalReleased + totalRefunded + fees
  Available balance = totalLocked - totalReleased - totalRefunded - fees
  Releases must reference valid milestoneId
  No release after escrow is closed
```

---

## Contract 6: ProfitDistribution.sol

```
PROFIT DISTRIBUTION
=====================

Purpose: Calculate and execute profit distributions to all stakeholders.

State Variables:
  struct DistributionRecord {
    uint256 profitCalculationId;
    uint256 totalRevenue;
    uint256 totalExpenses;
    uint256 netProfit;
    uint256 platformFee;
    uint256 farmerShare;
    uint256 investorShare;
    uint256 timestamp;
    bool    isDistributed;
  }

  struct RecipientShare {
    address recipient;
    uint256 amount;
    uint256 percent;
    string  recipientType; // "FARMER", "INVESTOR", "PLATFORM"
  }

  DistributionRecord[] public distributions;
  mapping(uint256 => RecipientShare[]) public distributionShares; // calcId => shares

Events:
  event ProfitCalculated(uint256 indexed calcId, uint256 netProfit, uint256 platformFee);
  event ProfitDistributed(uint256 indexed calcId, uint256 totalDistributed);
  event ShareTransferred(address indexed recipient, uint256 amount, uint256 calcId);

Functions:
  // Calculation
  calculateProfit(
    uint256 dealId,
    uint256 totalRevenue,
    uint256 totalExpenses,
    uint256 farmerSharePercent,
    uint256 investorSharePercent,
    uint256 platformFeePercent
  ) external onlyPlatform returns (uint256 calcId)

  // Distribution
  distributeProfits(uint256 calcId, address[] calldata recipients, uint256[] calldata amounts) external onlyPlatform

  // Views
  getDistribution(uint256 calcId) external view returns (DistributionRecord memory)
  getShares(uint256 calcId) external view returns (RecipientShare[] memory)
  getTotalDistributed() external view returns (uint256)
  getDealTotalDistributed(uint256 dealId) external view returns (uint256)

Access Control:
  Only PLATFORM_ROLE can calculate and distribute

Security:
  ReentrancyGuard on distributeProfits
  Cannot distribute same calcId twice (isDistributed check)
  Net profit calculation verified: netProfit = totalRevenue - totalExpenses
  Platform fee calculation: platformFee = netProfit * platformFeePercent / 10000
  Shares must sum to netProfit - platformFee
  Cannot distribute negative amounts

Invariants:
  Total distributed <= net profit - platform fee
  Each recipient receives at most their calculated share
  isDistributed can only go from false to true
  Distribution amounts sum to distributable profit
```

---

## Contract 7: Oracle.sol

```
ORACLE CONTRACT
================

Purpose: Receive and verify off-chain data attestations (harvest, revenue, expenses).

State Variables:
  struct Attestation {
    uint256 id;
    uint256 dealId;
    address attester;
    bytes32 dataHash;
    uint256 timestamp;
    bool    isConfirmed;
    string  attestationType; // "HARVEST", "REVENUE", "EXPENSE", "MILESTONE"
  }

  mapping(uint256 => Attestation) public attestations;
  uint256 public attestationCount;
  mapping(address => bool) public authorizedAttesters;

Events:
  event AttestationCreated(uint256 indexed attestationId, uint256 indexed dealId, address indexed attester, bytes32 dataHash);
  event AttestationConfirmed(uint256 indexed attestationId);
  event AttesterAuthorized(address indexed attester);
  event AttesterRevoked(address indexed attester);

Functions:
  // Attestation
  createAttestation(
    uint256 dealId,
    bytes32 dataHash,
    string calldata attestationType,
    bytes calldata signature
  ) external onlyAttester returns (uint256)

  confirmAttestation(uint256 attestationId) external onlyPlatform
  rejectAttestation(uint256 attestationId) external onlyPlatform

  // Admin
  authorizeAttester(address attester) external onlyAdmin
  revokeAttester(address attester) external onlyAdmin

  // Views
  getAttestation(uint256 attestationId) external view returns (Attestation memory)
  getDealAttestations(uint256 dealId) external view returns (uint256[] memory)
  verifyAttestation(uint256 attestationId, bytes32 dataHash) external view returns (bool)

Access Control:
  Only authorized attesters can create attestations
  Only PLATFORM_ROLE can confirm/reject
  Only ADMIN can manage attesters

Security:
  EIP-712 typed data signing for attestations
  dataHash verified against signed message
  Replay protection via nonce
  Attester signature verified on-chain
  Cannot confirm same attestation twice

Invariants:
  Attestation IDs are sequential
  isConfirmed can only go from false to true
  dataHash must be non-zero
  Attester must be authorized
```

---

## Deployment Architecture

```
CONTRACT DEPLOYMENT ORDER
===========================

1. AccessControl (OpenZeppelin)
2. ProjectRegistry
3. Oracle
4. DealFactory (links to DealContract implementation)
5. DealContract (implementation, not proxied)
6. OwnershipToken
7. EscrowContract
8. ProfitDistribution

Post-Deployment:
  - Grant PLATFORM_ROLE to DealFactory on all contracts
  - Grant VERIFIER_ROLE to Oracle on ProjectRegistry
  - Set DealFactory address in DealContract as platform
  - Transfer ownership to multisig admin wallet

Proxy Pattern:
  DealContract deployed once as implementation
  DealFactory uses Clones (EIP-1167) to deploy minimal proxies
  Each deal gets its own proxy pointing to shared implementation
  Storage is per-proxy (isolated per deal)
```

---

## Network Configuration

```
NETWORK CONFIGURATION
=======================

Development (Hardhat Local):
  Chain ID: 31337
  RPC: http://localhost:8545
  Block time: instant (mining on demand)
  Gas: unlimited
  Accounts: 20 pre-funded test accounts

Staging (Sepolia Testnet):
  Chain ID: 11155111
  RPC: https://eth-sepolia.g.alchemy.com/v2/{API_KEY}
  Explorer: https://sepolia.etherscan.io
  Gas: Sepolia ETH (faucet)
  Confirmations: 3

Production (Polygon):
  Chain ID: 137
  RPC: https://polygon-mainnet.g.alchemy.com/v2/{API_KEY}
  Explorer: https://polygonscan.com
  Gas: MATIC
  Confirmations: 12
  Gas limit: 5000000 (per tx)
  Gas price: dynamic (EIP-1559)
```

---

## Gas Optimization

```
GAS OPTIMIZATION STRATEGIES
==============================

1. Minimal Proxy (EIP-1167)
   - Each DealContract clone costs ~45k gas to deploy
   - vs ~2M gas for full contract deployment
   - Storage isolated per clone

2. Batch Operations
   - distributeProfits: distribute to multiple recipients in one tx
   - mintBatch: mint multiple tokens in one tx

3. Storage Packing
   - Struct fields ordered by size (uint256, uint256, address, bool)
   - Enums use uint8 internally
   - Bit-packing for boolean flags

4. Calldata Optimization
   - Use calldata for read-only parameters
   - Bytes32 instead of string where possible
   - Packed structs for external calls

5. Event Optimization
   - Indexed parameters for filtering (up to 3 per event)
   - Minimal event data (emit only necessary info)
   - Off-chain indexing via event logs

Estimated Gas Costs:
  Deploy DealFactory:           ~800,000 gas
  Deploy DealContract impl:     ~2,500,000 gas
  Deploy Clone (per deal):      ~45,000 gas
  Invest:                       ~150,000 gas
  Distribute profits:           ~200,000 gas (base) + ~50,000 per recipient
  Mint ownership token:         ~80,000 gas
  Create attestation:           ~100,000 gas
  Release escrow:               ~60,000 gas
```
