# Component Architecture

## Overview

The backend is a NestJS modular monolith with 25+ modules. Each module encapsulates a specific domain concern with its own controllers, services, DTOs, entities, and event handlers. This document details every module.

---

## Module Architecture Diagram

```
MODULE ARCHITECTURE
====================

+-------------------------------------------------------------------+
|                    NestJS Modular Monolith                          |
+-------------------------------------------------------------------+
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+                  |
|  |  Auth  |  | Users  |  | Farmer |  |Investor|                  |
|  | Module |  | Module |  | Module |  | Module |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+                  |
|  |  Farm  |  |  Crop  |  |Project |  |  Deal  |                  |
|  | Module |  | Module |  | Module |  | Module |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+                  |
|  |Invest- |  |Payment |  | Wallet |  | Ledger |                  |
|  |ment    |  | Module |  | Module |  | Module |                  |
|  | Module |  |        |  |        |  |        |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+                  |
|  | Escrow |  |Settle- |  | Profit |  |Block-  |                  |
|  | Module |  |ment    |  | Module |  |chain   |                  |
|  |        |  | Module |  |        |  | Module |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+                  |
|  | Oracle |  |Notif.  |  | Audit  |  | Admin  |                  |
|  | Module |  | Module |  | Module |  | Module |                  |
|  +--------+  +--------+  +--------+  +--------+                  |
|                                                                    |
|  +--------+  +--------+  +--------+                               |
|  | Health |  |Schedule|  | Queue  |                               |
|  | Module |  | Module |  | Module |                               |
|  +--------+  +--------+  +--------+                               |
|                                                                    |
+-------------------------------------------------------------------+
```

---

## Module 1: Auth Module

### Responsibility

Handle user authentication, registration, login, token management, password reset, and wallet-based authentication (Sign-In With Ethereum).

### Entities/Models

| Entity | Description |
|---|---|
| `User` | Core user record (email, passwordHash, walletAddress, status) |
| `RefreshToken` | Stored refresh tokens (token, userId, expiresAt, revoked) |
| `PasswordReset` | Password reset tokens (token, userId, expiresAt, used) |

### Service Methods

```
AuthService
  register(dto: RegisterDto): User
    Validate email uniqueness, hash password, create user, emit event
  login(dto: LoginDto): { accessToken, refreshToken }
    Validate credentials, generate JWT pair, store refresh token
  loginWithWallet(dto: WalletLoginDto): { accessToken, refreshToken }
    Verify SIWE signature, find/create user, generate tokens
  refreshToken(dto: RefreshTokenDto): { accessToken, refreshToken }
    Validate refresh token, rotate (revoke old, issue new), return pair
  logout(refreshToken: string): void
    Revoke refresh token, blacklist access token
  forgotPassword(email: string): void
    Generate reset token, enqueue email
  resetPassword(dto: ResetPasswordDto): void
    Validate reset token, hash new password, update user
  generateTokens(user: User): TokenPair
    Generate JWT access (15min) + refresh (7d) tokens
  validateAccessToken(token: string): JwtPayload
    Verify JWT signature, check blacklist
  generateSIWEMessage(address: string, nonce: string): string
    Generate SIWE message for wallet signing
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | None | Register new user |
| POST | `/api/v1/auth/login` | None | Email/password login |
| POST | `/api/v1/auth/wallet-login` | None | Wallet-based login |
| POST | `/api/v1/auth/refresh` | None (uses refresh token body) | Refresh tokens |
| POST | `/api/v1/auth/logout` | Bearer | Logout |
| POST | `/api/v1/auth/forgot-password` | None | Request password reset |
| POST | `/api/v1/auth/reset-password` | None (uses reset token) | Reset password |

### Dependencies

- `UsersModule` - User CRUD operations
- `NotificationModule` - Send password reset email
- `AuditModule` - Log auth events

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `user.registered` | `{ userId, email, role }` | NotificationModule, AuditModule |
| `user.logged_in` | `{ userId, method, ip }` | AuditModule |
| `user.logged_out` | `{ userId }` | AuditModule |
| `password.reset_requested` | `{ userId, email }` | NotificationModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `notification-queue` | `sendWelcomeEmail` | Send welcome email after registration |
| `notification-queue` | `sendPasswordReset` | Send password reset email |

### Guards

- `JwtAuthGuard` - Validates JWT on protected routes
- `LocalAuthGuard` - For email/password login endpoint
- `WalletAuthGuard` - For wallet-based login endpoint

---

## Module 2: Users Module

### Responsibility

Manage user profiles, roles, permissions, and role-based access control (RBAC).

### Entities/Models

| Entity | Description |
|---|---|
| `User` | Core user (id, email, name, phone, walletAddress, status, createdAt) |
| `Role` | Role definition (id, name, description) |
| `Permission` | Permission definition (id, action, resource) |
| `UserRole` | Many-to-many: user to role |
| `RolePermission` | Many-to-many: role to permission |

**Roles:** FARMER, INVESTOR, ADMIN, GUEST

### Service Methods

```
UsersService
  findById(id: string): User
  findByEmail(email: string): User
  findByWalletAddress(address: string): User
  updateProfile(userId: string, dto: UpdateProfileDto): User
  uploadAvatar(userId: string, file): string
  getRoles(userId: string): Role[]
  assignRole(userId: string, roleName: string): UserRole
  removeRole(userId: string, roleName: string): void
  hasPermission(userId: string, action: string, resource: string): boolean
  hasRole(userId: string, roleName: string): boolean
  findAll(filters, pagination): PaginatedResult<User>
  updateStatus(userId: string, status: UserStatus): User
  deactivateAccount(userId: string): void
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/me` | Bearer | Get current user profile |
| PATCH | `/api/v1/users/me` | Bearer | Update current user profile |
| GET | `/api/v1/users/:id` | Bearer + Admin | Get user by ID |
| GET | `/api/v1/users` | Bearer + Admin | List users |
| PATCH | `/api/v1/users/:id/status` | Bearer + Admin | Update user status |
| PATCH | `/api/v1/users/:id/roles` | Bearer + Admin | Assign/remove roles |

### Dependencies

- `PrismaModule` - Database access
- `StorageModule` - Avatar uploads
- `AuditModule` - Log user changes

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `user.profile_updated` | `{ userId, changes }` | AuditModule |
| `user.role_changed` | `{ userId, oldRole, newRole }` | AuditModule, NotificationModule |
| `user.status_changed` | `{ userId, oldStatus, newStatus }` | NotificationModule |

### RBAC Permission Model

```
Permission Structure: { action }:{ resource }

Actions: create, read, update, delete, verify, approve, manage
Resources: user, farmer_profile, investor_profile, farm, crop, project,
           deal, investment, payment, wallet, ledger, escrow, settlement,
           profit, blockchain, notification, admin, audit

Example Permissions:
  farmer:create:farm         - Farmer can create a farm
  farmer:read:farm           - Farmer can read their farms
  investor:read:deal         - Investor can read deals
  admin:verify:farmer_profile - Admin can verify farmer profiles
  admin:approve:deal         - Admin can approve deals
```

---

## Module 3: Farmer Module

### Responsibility

Manage farmer profiles, verification status, and farmer-specific documents.

### Entities/Models

| Entity | Description |
|---|---|
| `FarmerProfile` | Farmer-specific profile (userId, farmName, location, bio, verificationStatus, verifiedAt) |
| `FarmDocument` | Verification documents (farmerProfileId, type, fileUrl, verified, verifiedAt) |

### Service Methods

```
FarmerService
  createProfile(userId: string, dto: CreateFarmerProfileDto): FarmerProfile
  getProfile(userId: string): FarmerProfile
  updateProfile(userId: string, dto: UpdateFarmerProfileDto): FarmerProfile
  uploadDocument(userId: string, dto: UploadDocumentDto): FarmDocument
  getDocuments(userId: string): FarmDocument[]
  verifyProfile(farmerProfileId: string, adminId: string): FarmerProfile
  rejectProfile(farmerProfileId: string, adminId: string, reason: string): FarmerProfile
  getPendingVerifications(): FarmerProfile[]
  getFarmerById(farmerId: string): FarmerProfile
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/farmers/profile` | Bearer + Farmer | Create farmer profile |
| GET | `/api/v1/farmers/profile` | Bearer + Farmer | Get own profile |
| PATCH | `/api/v1/farmers/profile` | Bearer + Farmer | Update profile |
| POST | `/api/v1/farmers/documents` | Bearer + Farmer | Upload document |
| GET | `/api/v1/farmers/documents` | Bearer + Farmer | List documents |
| GET | `/api/v1/farmers/pending` | Bearer + Admin | Pending verifications |
| POST | `/api/v1/farmers/:id/verify` | Bearer + Admin | Verify farmer |

### Dependencies

- `UsersModule` - User lookup, role checks
- `StorageModule` - Document file storage
- `NotificationModule` - Verification status notifications
- `AuditModule` - Log verification actions

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `farmer.profile_created` | `{ farmerId, userId }` | AuditModule |
| `farmer.profile_verified` | `{ farmerId, adminId }` | NotificationModule, AuditModule |
| `farmer.profile_rejected` | `{ farmerId, reason }` | NotificationModule, AuditModule |
| `farmer.document_uploaded` | `{ farmerId, documentId }` | AuditModule |

---

## Module 4: Investor Module

### Responsibility

Manage investor profiles, KYC verification, and wallet connections.

### Entities/Models

| Entity | Description |
|---|---|
| `InvestorProfile` | Investor-specific profile (userId, investmentPreferences, riskTolerance, accreditedStatus) |
| `KYCVerification` | KYC documents and status (investorProfileId, status, documents, providerRef) |

### Service Methods

```
InvestorService
  createProfile(userId: string, dto: CreateInvestorProfileDto): InvestorProfile
  getProfile(userId: string): InvestorProfile
  updateProfile(userId: string, dto: UpdateInvestorProfileDto): InvestorProfile
  submitKYC(userId: string, dto: SubmitKYCDto): KYCVerification
  getKYCStatus(userId: string): KYCVerification
  approveKYC(investorId: string, adminId: string): void
  rejectKYC(investorId: string, adminId: string, reason: string): void
  getInvestorById(investorId: string): InvestorProfile
  getPortfolio(userId: string): PortfolioSummary
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/investors/profile` | Bearer + Investor | Create investor profile |
| GET | `/api/v1/investors/profile` | Bearer + Investor | Get own profile |
| PATCH | `/api/v1/investors/profile` | Bearer + Investor | Update profile |
| POST | `/api/v1/investors/kyc` | Bearer + Investor | Submit KYC documents |
| GET | `/api/v1/investors/kyc/status` | Bearer + Investor | Get KYC status |
| POST | `/api/v1/investors/:id/kyc/approve` | Bearer + Admin | Approve KYC |
| GET | `/api/v1/investors/portfolio` | Bearer + Investor | Get portfolio summary |

### Dependencies

- `UsersModule` - User lookup
- `InvestmentModule` - Portfolio calculations
- `NotificationModule` - KYC status notifications
- `StorageModule` - KYC document uploads

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `investor.kyc_submitted` | `{ investorId }` | AuditModule |
| `investor.kyc_approved` | `{ investorId }` | NotificationModule, AuditModule |
| `investor.kyc_rejected` | `{ investorId, reason }` | NotificationModule, AuditModule |

---

## Module 5: Farm Module

### Responsibility

Manage farm CRUD operations, verification, documents, and farm-crop associations.

### Entities/Models

| Entity | Description |
|---|---|
| `Farm` | Farm record (farmerProfileId, name, location, size, description, status, verified) |
| `FarmDocument` | Farm-specific documents (farmId, type, fileUrl, verified) |
| `FarmCrop` | Many-to-many: farm to crop with season info |

### Service Methods

```
FarmService
  create(farmerId: string, dto: CreateFarmDto): Farm
  findAll(filters: FarmFilterDto, pagination): PaginatedResult<Farm>
  findById(farmId: string): Farm
  update(farmId: string, farmerId: string, dto: UpdateFarmDto): Farm
  delete(farmId: string, farmerId: string): void
  verifyFarm(farmId: string, adminId: string): Farm
  uploadDocument(farmId: string, farmerId: string, dto): FarmDocument
  getDocuments(farmId: string): FarmDocument[]
  addCrop(farmId: string, cropId: string, dto): FarmCrop
  removeCrop(farmId: string, cropId: string): void
  getFarmsByFarmer(farmerId: string): Farm[]
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/farms` | Bearer + Farmer | Create farm |
| GET | `/api/v1/farms` | None (public) | List farms |
| GET | `/api/v1/farms/:id` | None (public) | Get farm detail |
| PATCH | `/api/v1/farms/:id` | Bearer + Owner | Update farm |
| DELETE | `/api/v1/farms/:id` | Bearer + Owner | Delete farm |
| POST | `/api/v1/farms/:id/documents` | Bearer + Owner | Upload document |
| GET | `/api/v1/farms/:id/documents` | Bearer + Owner | List documents |
| POST | `/api/v1/farms/:id/crops` | Bearer + Owner | Associate crop |
| POST | `/api/v1/farms/:id/verify` | Bearer + Admin | Verify farm |

### Dependencies

- `FarmerModule` - Farmer profile lookup
- `CropModule` - Crop catalog
- `StorageModule` - Document storage
- `NotificationModule` - Verification notifications
- `AuditModule` - Change logging

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `farm.created` | `{ farmId, farmerId }` | AuditModule |
| `farm.verified` | `{ farmId }` | NotificationModule |
| `farm.document_uploaded` | `{ farmId, documentId }` | AuditModule |

---

## Module 6: Crop Module

### Responsibility

Maintain the crop catalog including crop types, varieties, growing seasons, and expected yields.

### Entities/Models

| Entity | Description |
|---|---|
| `Crop` | Crop type (name, category, description, icon) |
| `CropVariety` | Crop variety (cropId, name, growingPeriodDays, expectedYieldPerHectare) |
| `GrowingSeason` | Season info (cropVarietyId, season, startDate, endDate, region) |

### Service Methods

```
CropService
  findAll(): Crop[]
  findById(cropId: string): Crop
  findByCategory(category: string): Crop[]
  create(dto: CreateCropDto): Crop (Admin only)
  update(cropId: string, dto: UpdateCropDto): Crop (Admin only)
  getVarieties(cropId: string): CropVariety[]
  getSeasons(cropVarietyId: string): GrowingSeason[]
  search(query: string): Crop[]
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/crops` | None | List all crops |
| GET | `/api/v1/crops/:id` | None | Get crop detail |
| GET | `/api/v1/crops/:id/varieties` | None | Get crop varieties |
| POST | `/api/v1/crops` | Bearer + Admin | Create crop |
| PATCH | `/api/v1/crops/:id` | Bearer + Admin | Update crop |

### Dependencies

- `PrismaModule` - Database access
- `AdminModule` - Permission checks

### Events Produced

None (reference data, minimal mutation).

---

## Module 7: Project Module

### Responsibility

Manage agricultural projects including milestones, documents, and project lifecycle.

### Entities/Models

| Entity | Description |
|---|---|
| `AgriculturalProject` | Project record (farmId, name, description, cropId, startDate, endDate, status) |
| `ProjectDocument` | Project documents (projectId, type, fileUrl, verified) |
| `ProjectMilestone` | Milestones (projectId, name, description, targetDate, status, verificationData) |

### Service Methods

```
ProjectService
  create(farmerId: string, dto: CreateProjectDto): AgriculturalProject
  findAll(filters: ProjectFilterDto, pagination): PaginatedResult<AgriculturalProject>
  findById(projectId: string): AgriculturalProject
  update(projectId: string, farmerId: string, dto: UpdateProjectDto): AgriculturalProject
  addMilestone(projectId: string, farmerId: string, dto): ProjectMilestone
  updateMilestone(milestoneId: string, farmerId: string, dto): ProjectMilestone
  completeMilestone(milestoneId: string, farmerId: string, data): ProjectMilestone
  uploadDocument(projectId: string, farmerId: string, dto): ProjectDocument
  getDocuments(projectId: string): ProjectDocument[]
  getMilestones(projectId: string): ProjectMilestone[]
  getProjectsByFarm(farmId: string): AgriculturalProject[]
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/projects` | Bearer + Farmer | Create project |
| GET | `/api/v1/projects` | Bearer | List projects |
| GET | `/api/v1/projects/:id` | Bearer | Get project detail |
| PATCH | `/api/v1/projects/:id` | Bearer + Owner | Update project |
| POST | `/api/v1/projects/:id/milestones` | Bearer + Owner | Add milestone |
| PATCH | `/api/v1/projects/:id/milestones/:milestoneId` | Bearer + Owner | Update milestone |
| POST | `/api/v1/projects/:id/documents` | Bearer + Owner | Upload document |

### Dependencies

- `FarmModule` - Farm lookup
- `CropModule` - Crop info
- `BlockchainModule` - On-chain project registration
- `NotificationModule` - Milestone notifications

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `project.created` | `{ projectId, farmId }` | BlockchainModule, AuditModule |
| `project.milestone_completed` | `{ projectId, milestoneId }` | BlockchainModule, DealModule, NotificationModule |
| `project.milestone_verified` | `{ projectId, milestoneId }` | DealModule, NotificationModule |

---

## Module 8: Deal Module

### Responsibility

Manage deal lifecycle from draft through funding, activation, harvest, and settlement. This is the core business module orchestrating the full deal lifecycle.

### Entities/Models

| Entity | Description |
|---|---|
| `Deal` | Deal record (projectId, title, description, status, farmerSharePercent, investorSharePercent, totalTargetAmount, fundedAmount, smartContractAddress) |
| `DealTerm` | Deal terms (dealId, minInvestment, maxInvestment, expectedROI, duration, paymentSchedule) |
| `DealParticipant` | Deal participants (dealId, userId, role, joinedAt) |

### Service Methods

```
DealService
  create(farmerId: string, dto: CreateDealDto): Deal
  findAll(filters: DealFilterDto, pagination): PaginatedResult<Deal>
  findById(dealId: string): Deal
  update(dealId: string, farmerId: string, dto: UpdateDealDto): Deal
  submitForReview(dealId: string, farmerId: string): Deal
  approve(dealId: string, adminId: string): Deal
  reject(dealId: string, adminId: string, reason: string): Deal
  createSmartContract(dealId: string): Deal
  publish(dealId: string, adminId: string): Deal
  updateFundingStatus(dealId: string): Deal
  startHarvesting(dealId: string, adminId: string): Deal
  markActive(dealId: string, adminId: string): Deal
  close(dealId: string, adminId: string): Deal
  getDealStats(dealId: string): DealStats
  getDealsByFarmer(farmerId: string): Deal[]
  getPublishedDeals(filters): PaginatedResult<Deal>
```

### State Machine

```
DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> SMART_CONTRACT_CREATED
  -> PUBLISHED -> FUNDING -> FUNDED -> ACTIVE -> HARVESTING
  -> REVENUE_VERIFICATION -> PROFIT_CALCULATION -> DISTRIBUTION
  -> SETTLED -> CLOSED
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/deals` | Bearer + Farmer | Create deal |
| GET | `/api/v1/deals` | Bearer | List deals |
| GET | `/api/v1/deals/:id` | Bearer | Get deal detail |
| PATCH | `/api/v1/deals/:id` | Bearer + Owner | Update deal |
| POST | `/api/v1/deals/:id/submit` | Bearer + Owner | Submit for review |
| POST | `/api/v1/deals/:id/approve` | Bearer + Admin | Approve deal |
| POST | `/api/v1/deals/:id/reject` | Bearer + Admin | Reject deal |
| POST | `/api/v1/deals/:id/publish` | Bearer + Admin | Publish deal |
| GET | `/api/v1/deals/:id/stats` | Bearer | Get deal statistics |

### Dependencies

- `ProjectModule` - Project linkage
- `BlockchainModule` - Smart contract creation
- `InvestmentModule` - Investment tracking
- `FarmerModule` - Farmer verification
- `AdminModule` - Approval workflow
- `NotificationModule` - Status change notifications
- `EscrowModule` - Fund locking
- `ProfitModule` - Profit calculation triggers

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `deal.created` | `{ dealId, farmerId }` | AuditModule |
| `deal.submitted` | `{ dealId }` | NotificationModule (admin) |
| `deal.approved` | `{ dealId }` | BlockchainModule, NotificationModule |
| `deal.rejected` | `{ dealId, reason }` | NotificationModule |
| `deal.smart_contract_created` | `{ dealId, contractAddress }` | NotificationModule |
| `deal.published` | `{ dealId }` | NotificationModule (broadcast) |
| `deal.funded` | `{ dealId }` | NotificationModule, EscrowModule |
| `deal.harvesting_started` | `{ dealId }` | NotificationModule |
| `deal.settled` | `{ dealId }` | SettlementModule, NotificationModule |
| `deal.closed` | `{ dealId }` | AuditModule, NotificationModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `blockchain-queue` | `deployDealContract` | Deploy smart contract for approved deal |
| `blockchain-queue` | `publishDealOnChain` | Publish deal on-chain |

---

## Module 9: Investment Module

### Responsibility

Manage investments, investment units (ownership tokens), and investment tracking.

### Entities/Models

| Entity | Description |
|---|---|
| `Investment` | Investment record (dealId, investorId, amount, status, unitCount) |
| `InvestmentUnit` | Ownership units (investmentId, unitNumber, tokenId, ownershipPercent) |
| `InvestmentTransaction` | Investment transaction history (investmentId, type, amount, status, txHash) |

### Service Methods

```
InvestmentService
  create(investorId: string, dto: CreateInvestmentDto): Investment
  findAll(filters, pagination): PaginatedResult<Investment>
  findById(investmentId: string): Investment
  getInvestmentsByDeal(dealId: string): Investment[]
  getInvestmentsByInvestor(investorId: string): Investment[]
  confirmInvestment(investmentId: string, txHash: string): Investment
  failInvestment(investmentId: string, reason: string): Investment
  getInvestmentTransactions(investmentId: string): InvestmentTransaction[]
  calculateOwnership(investmentId: string): OwnershipBreakdown
  getPortfolioSummary(investorId: string): PortfolioSummary
  getTotalFundedAmount(dealId: string): number
  cancelInvestment(investmentId: string, investorId: string): Investment
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/investments` | Bearer + Investor | Create investment |
| GET | `/api/v1/investments` | Bearer | List investments |
| GET | `/api/v1/investments/:id` | Bearer | Get investment detail |
| GET | `/api/v1/investments/:id/transactions` | Bearer | Get transaction history |
| POST | `/api/v1/investments/:id/cancel` | Bearer + Investor | Cancel investment |

### Dependencies

- `DealModule` - Deal validation, funding status
- `PaymentModule` - Payment processing
- `LedgerModule` - Financial entries
- `BlockchainModule` - Ownership token minting
- `NotificationModule` - Investment confirmations

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `investment.created` | `{ investmentId, dealId, amount }` | PaymentModule, AuditModule |
| `investment.confirmed` | `{ investmentId, txHash }` | DealModule, BlockchainModule, NotificationModule |
| `investment.failed` | `{ investmentId, reason }` | NotificationModule, AuditModule |
| `investment.cancelled` | `{ investmentId }` | PaymentModule (refund), AuditModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `blockchain-queue` | `mintOwnershipTokens` | Mint ERC-721 ownership tokens |
| `payment-queue` | `processInvestmentPayment` | Process fiat payment |

---

## Module 10: Payment Module

### Responsibility

Handle payment processing, webhook verification, and payment provider integrations (Stripe, PayPal).

### Entities/Models

| Entity | Description |
|---|---|
| `Payment` | Payment record (investmentId, amount, currency, provider, providerPaymentId, status) |
| `PaymentAttempt` | Payment attempt history (paymentId, attemptNumber, status, errorCode, providerResponse) |
| `PaymentWebhook` | Webhook event log (provider, eventType, payload, processed, processedAt) |

### Service Methods

```
PaymentService
  createPayment(investmentId: string, dto: CreatePaymentDto): Payment
  processPayment(paymentId: string): Payment
  handleWebhook(provider: string, payload: any, signature: string): void
  verifyPayment(paymentId: string): Payment
  refundPayment(paymentId: string, amount: number): Payment
  getPaymentById(paymentId: string): Payment
  getPaymentByProviderId(providerPaymentId: string): Payment
  reconcilePayments(date: Date): ReconciliationResult
  createCheckoutSession(investmentId: string, amount: number): CheckoutSession
  createPaymentIntent(investmentId: string, amount: number): PaymentIntent
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/payments` | Bearer + Investor | Create payment |
| POST | `/api/v1/payments/webhook` | None (webhook signature) | Payment provider webhook |
| GET | `/api/v1/payments/:id` | Bearer | Get payment status |
| POST | `/api/v1/payments/:id/refund` | Bearer + Admin | Refund payment |

### Dependencies

- `InvestmentModule` - Investment linkage
- `LedgerModule` - Financial entries
- `NotificationModule` - Payment notifications
- `AuditModule` - Payment logging

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `payment.created` | `{ paymentId, investmentId, amount }` | AuditModule |
| `payment.completed` | `{ paymentId, investmentId }` | InvestmentModule, LedgerModule, NotificationModule |
| `payment.failed` | `{ paymentId, reason }` | InvestmentModule, NotificationModule |
| `payment.refunded` | `{ paymentId, amount }` | InvestmentModule, LedgerModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `payment-queue` | `processPayment` | Process payment with provider |
| `payment-queue` | `verifyWebhook` | Verify and process webhook event |
| `payment-queue` | `reconcilePayments` | Daily payment reconciliation |

---

## Module 11: Wallet Module

### Responsibility

Manage cryptocurrency wallet connections, wallet history, and token balances.

### Entities/Models

| Entity | Description |
|---|---|
| `Wallet` | Wallet record (userId, address, chainId, label, isDefault, connectedAt) |
| `WalletTransaction` | Wallet transaction history (walletId, txHash, from, to, value, blockNumber, status) |

### Service Methods

```
WalletService
  connectWallet(userId: string, dto: ConnectWalletDto): Wallet
  disconnectWallet(walletId: string, userId: string): void
  getWallets(userId: string): Wallet[]
  getWalletById(walletId: string): Wallet
  verifyWalletOwnership(walletId: string, signature: string): boolean
  getDefaultWallet(userId: string): Wallet
  setDefaultWallet(walletId: string, userId: string): Wallet
  getWalletTransactions(walletId: string, pagination): PaginatedResult<WalletTransaction>
  syncWalletTransactions(walletId: string): WalletTransaction[]
  getBalance(walletId: string): WalletBalance
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/wallets/connect` | Bearer | Connect wallet |
| GET | `/api/v1/wallets` | Bearer | List connected wallets |
| GET | `/api/v1/wallets/:id` | Bearer | Get wallet detail |
| DELETE | `/api/v1/wallets/:id` | Bearer | Disconnect wallet |
| PATCH | `/api/v1/wallets/:id/default` | Bearer | Set default wallet |
| GET | `/api/v1/wallets/:id/transactions` | Bearer | Get transactions |

### Dependencies

- `BlockchainModule` - Chain interaction
- `AuditModule` - Wallet change logging

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `wallet.connected` | `{ walletId, userId, address }` | AuditModule |
| `wallet.disconnected` | `{ walletId, userId }` | AuditModule |

---

## Module 12: Ledger Module

### Responsibility

Maintain the double-entry accounting ledger with accounts, entries, and balance tracking.

### Entities/Models

| Entity | Description |
|---|---|
| `Account` | Ledger account (name, type, subType, parentId, currency, active) |
| `LedgerEntry` | Ledger entry (ledgerTransactionId, accountId, debit, credit, balanceAfter, description) |
| `LedgerTransaction` | Transaction grouping (id, type, referenceType, referenceId, status, metadata, createdAt) |

**Account Types:** ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE

### Service Methods

```
LedgerService
  createAccount(dto: CreateAccountDto): Account
  getAccounts(filters): Account[]
  getAccountById(accountId: string): Account
  getBalance(accountId: string): number
  createTransaction(dto: CreateLedgerTransactionDto): LedgerTransaction
  postTransaction(dto: PostTransactionDto): LedgerTransaction
  getEntries(filters, pagination): PaginatedResult<LedgerEntry>
  getTransactionById(transactionId: string): LedgerTransaction
  reverseTransaction(transactionId: string, reason: string): LedgerTransaction
  getAccountBalanceHistory(accountId: string, from: Date, to: Date): BalanceHistory[]
  reconcileAccounts(): ReconciliationResult
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/ledger/accounts` | Bearer + Admin | List accounts |
| GET | `/api/v1/ledger/entries` | Bearer + Admin | List ledger entries |
| GET | `/api/v1/ledger/balance/:accountId` | Bearer + Admin | Get account balance |
| GET | `/api/v1/ledger/transactions/:id` | Bearer + Admin | Get transaction detail |

### Dependencies

- `PrismaModule` - Database access (all ledger operations in transactions)

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `ledger.transaction_posted` | `{ transactionId, entries }` | AuditModule |

---

## Module 13: Escrow Module

### Responsibility

Hold funds in escrow during the deal lifecycle, release funds based on milestones, and handle refunds.

### Entities/Models

| Entity | Description |
|---|---|
| `EscrowAccount` | Escrow record (dealId, totalAmount, releasedAmount, lockedAmount, status) |
| `EscrowTransaction` | Escrow transaction (escrowAccountId, type, amount, referenceType, referenceId, status) |

**Transaction Types:** LOCK, RELEASE, REFUND, FEE

### Service Methods

```
EscrowService
  createEscrow(dealId: string): EscrowAccount
  lockFunds(escrowAccountId: string, amount: number, reference): EscrowTransaction
  releaseFunds(escrowAccountId: string, amount: number, reference): EscrowTransaction
  refundFunds(escrowAccountId: string, amount: number, reason: string): EscrowTransaction
  deductFee(escrowAccountId: string, amount: number, feeType: string): EscrowTransaction
  getEscrowByDeal(dealId: string): EscrowAccount
  getEscrowTransactions(escrowAccountId: string): EscrowTransaction[]
  releaseMilestoneFunds(escrowAccountId: string, milestoneId: string, amount: number): EscrowTransaction
  getAvailableBalance(escrowAccountId: string): number
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/escrow` | Bearer + Admin | List escrow accounts |
| GET | `/api/v1/escrow/:id` | Bearer | Get escrow detail |
| GET | `/api/v1/escrow/:id/transactions` | Bearer | Get escrow transactions |
| POST | `/api/v1/escrow/:id/release` | Bearer + Admin | Release funds |

### Dependencies

- `DealModule` - Deal linkage
- `LedgerModule` - Financial entries
- `BlockchainModule` - On-chain escrow operations
- `NotificationModule` - Release notifications

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `escrow.funds_locked` | `{ escrowId, amount }` | AuditModule |
| `escrow.funds_released` | `{ escrowId, amount, milestoneId }` | SettlementModule, NotificationModule |
| `escrow.funds_refunded` | `{ escrowId, amount }` | NotificationModule |

---

## Module 14: Settlement Module

### Responsibility

Handle investor settlements, profit distributions, and withdrawal processing.

### Entities/Models

| Entity | Description |
|---|---|
| `Settlement` | Settlement record (dealId, profitCalculationId, investorId, amount, status, paidAt) |
| `Withdrawal` | Withdrawal request (investorId, amount, currency, method, status, bankDetails) |

### Service Methods

```
SettlementService
  createSettlements(profitCalculationId: string): Settlement[]
  processSettlement(settlementId: string): Settlement
  approveSettlement(settlementId: string, adminId: string): Settlement
  finalizeSettlement(settlementId: string): Settlement
  requestWithdrawal(investorId: string, dto: WithdrawalDto): Withdrawal
  approveWithdrawal(withdrawalId: string, adminId: string): Withdrawal
  processWithdrawal(withdrawalId: string): Withdrawal
  getSettlementsByDeal(dealId: string): Settlement[]
  getSettlementsByInvestor(investorId: string): Settlement[]
  getPendingWithdrawals(): Withdrawal[]
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/settlements` | Bearer + Admin | Create settlements |
| GET | `/api/v1/settlements` | Bearer | List settlements |
| POST | `/api/v1/settlements/:id/process` | Bearer + Admin | Process settlement |
| POST | `/api/v1/settlements/:id/approve` | Bearer + Admin | Approve settlement |
| POST | `/api/v1/settlements/:id/withdraw` | Bearer + Investor | Request withdrawal |

### Dependencies

- `ProfitModule` - Profit calculation results
- `LedgerModule` - Financial entries
- `PaymentModule` - Fiat payout processing
- `BlockchainModule` - Crypto distribution
- `NotificationModule` - Settlement notifications

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `settlement.created` | `{ settlementId, investorId, amount }` | NotificationModule |
| `settlement.processed` | `{ settlementId }` | NotificationModule |
| `settlement.completed` | `{ settlementId }` | AuditModule, NotificationModule |
| `withdrawal.requested` | `{ withdrawalId }` | NotificationModule (admin) |
| `withdrawal.completed` | `{ withdrawalId }` | NotificationModule, AuditModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `settlement-queue` | `processSettlement` | Process settlement payout |
| `settlement-queue` | `processWithdrawal` | Process withdrawal |

---

## Module 15: Profit Module

### Responsibility

Calculate profits from revenues, manage profit distribution rules, and execute profit distributions.

### Entities/Models

| Entity | Description |
|---|---|
| `ProfitCalculation` | Profit record (dealId, totalRevenue, totalExpenses, netProfit, calculatedAt) |
| `ProfitDistribution` | Distribution record (profitCalculationId, recipientType, recipientId, amount, percent, status) |
| `Revenue` | Revenue record (dealId, source, amount, date, verified, attestationId) |
| `Sale` | Sale record (dealId, cropVarietyId, quantity, unitPrice, totalAmount, saleDate) |
| `Expense` | Expense record (dealId, type, amount, description, date, approved) |
| `Harvest` | Harvest record (dealId, cropVarietyId, quantity, unit, harvestDate, verified) |

### Service Methods

```
ProfitService
  calculateProfit(dealId: string): ProfitCalculation
  distributeProfits(profitCalculationId: string): ProfitDistribution[]
  getProfitCalculation(profitId: string): ProfitCalculation
  getProfitCalculationsByDeal(dealId: string): ProfitCalculation[]
  getDistributions(profitCalculationId: string): ProfitDistribution[]
  recordRevenue(dealId: string, dto: RecordRevenueDto): Revenue
  recordExpense(dealId: string, dto: RecordExpenseDto): Expense
  recordHarvest(dealId: string, dto: RecordHarvestDto): Harvest
  recordSale(dealId: string, dto: RecordSaleDto): Sale
  getRevenues(dealId: string): Revenue[]
  getExpenses(dealId: string): Expense[]
  getHarvests(dealId: string): Harvest[]
  getSales(dealId: string): Sale[]
  approveExpense(expenseId: string, adminId: string): Expense
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/profits/calculate` | Bearer + Admin | Trigger profit calculation |
| GET | `/api/v1/profits` | Bearer | List profit calculations |
| GET | `/api/v1/profits/:id` | Bearer | Get profit detail |
| GET | `/api/v1/profits/:id/distributions` | Bearer | Get distributions |
| POST | `/api/v1/profits/:id/distribute` | Bearer + Admin | Trigger distribution |

### Dependencies

- `DealModule` - Deal terms (profit split percentages)
- `OracleModule` - Revenue/harvest verification
- `EscrowModule` - Fund release for distribution
- `LedgerModule` - Financial entries
- `SettlementModule` - Settlement creation
- `NotificationModule` - Distribution notifications

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `profit.calculated` | `{ profitId, dealId, netProfit }` | SettlementModule, NotificationModule |
| `profit.distributed` | `{ profitId, distributions }` | NotificationModule, AuditModule |
| `revenue.recorded` | `{ revenueId, dealId, amount }` | AuditModule |
| `expense.recorded` | `{ expenseId, dealId, amount }` | AuditModule |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `settlement-queue` | `calculateProfit` | Calculate profit for deal |
| `settlement-queue` | `distributeProfit` | Distribute profits to investors |

---

## Module 16: Blockchain Module

### Responsibility

Manage all blockchain interactions: sending transactions, indexing events, syncing state, and key management.

### Entities/Models

| Entity | Description |
|---|---|
| `BlockchainTransaction` | Transaction record (dealId, txHash, from, to, value, gasUsed, status, blockNumber) |
| `BlockchainEvent` | Event record (contractAddress, eventName, blockNumber, txHash, data, processed) |
| `SmartContract` | Deployed contract (name, address, deployerTxHash, deployedAt, network) |
| `OracleAttestation` | Oracle data (dealId, attester, dataHash, attestedData, txHash, confirmed) |

### Service Methods

```
BlockchainService
  sendTransaction(dto: SendTransactionDto): BlockchainTransaction
  checkTransactionStatus(txHash: string): BlockchainTransaction
  getTransactionByHash(txHash: string): BlockchainTransaction
  indexEvents(fromBlock: number, toBlock: number): BlockchainEvent[]
  getEvents(filters: EventFilterDto, pagination): PaginatedResult<BlockchainEvent>
  getEventsByContract(contractAddress: string): BlockchainEvent[]
  deployContract(contractName: string, args: any[]): SmartContract
  getContract(name: string): SmartContract
  getNetworkStatus(): NetworkStatus
  waitForConfirmation(txHash: string, confirmations: number): BlockchainTransaction
  estimateGas(dto: SendTransactionDto): GasEstimate
  getBlockNumber(): number
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/blockchain/transactions` | Bearer + Admin | List blockchain transactions |
| GET | `/api/v1/blockchain/transactions/:txHash` | Bearer | Get transaction detail |
| GET | `/api/v1/blockchain/events` | Bearer + Admin | List blockchain events |
| GET | `/api/v1/blockchain/status` | None | Network status |
| POST | `/api/v1/blockchain/sync` | Bearer + Admin | Trigger event sync |

### Dependencies

- `PrismaModule` - Database access
- `ConfigModule` - RPC URLs, chain config

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `blockchain.transaction_sent` | `{ txHash, dealId }` | AuditModule |
| `blockchain.transaction_confirmed` | `{ txHash, blockNumber }` | DealModule, InvestmentModule |
| `blockchain.transaction_failed` | `{ txHash, reason }` | InvestmentModule, NotificationModule |
| `blockchain.event_indexed` | `{ eventName, data }` | Various (router based on event name) |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `blockchain-queue` | `sendTransaction` | Send transaction to chain |
| `blockchain-queue` | `checkReceipt` | Poll for transaction receipt |
| `blockchain-queue` | `indexEvents` | Index new contract events |
| `blockchain-queue` | `syncState` | Sync on-chain state to DB |

---

## Module 17: Oracle Module

### Responsibility

Handle off-chain data attestation for harvest verification, revenue reporting, and external data feeds.

### Entities/Models

| Entity | Description |
|---|---|
| `OracleAttestation` | Attestation record (dealId, attesterId, type, dataHash, attestedData, txHash, confirmed) |

### Service Methods

```
OracleService
  createAttestation(dealId: string, dto: CreateAttestationDto): OracleAttestation
  submitOnChainAttestation(attestationId: string): OracleAttestation
  verifyAttestation(attestationId: string): boolean
  getAttestationsByDeal(dealId: string): OracleAttestation[]
  getAttestationById(attestationId: string): OracleAttestation
  processAttestationEvent(eventData: any): OracleAttestation
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/oracle/attestations` | Bearer + Farmer/Admin | Create attestation |
| GET | `/api/v1/oracle/attestations/:id` | Bearer | Get attestation detail |
| GET | `/api/v1/oracle/attestations` | Bearer | List attestations |

### Dependencies

- `BlockchainModule` - On-chain attestation submission
- `DealModule` - Deal lookup
- `AuditModule` - Attestation logging

### Events Produced

| Event | Payload | Consumers |
|---|---|---|
| `oracle.attestation_created` | `{ attestationId, dealId }` | AuditModule |
| `oracle.attestation_confirmed` | `{ attestationId }` | ProfitModule, DealModule |

---

## Module 18: Notification Module

### Responsibility

Send notifications across multiple channels: email, SMS, push notifications, and in-app.

### Entities/Models

| Entity | Description |
|---|---|
| `Notification` | Notification record (userId, type, title, body, data, read, readAt, createdAt) |
| `NotificationPreference` | User preferences (userId, channel, type, enabled) |

### Service Methods

```
NotificationService
  send(userId: string, dto: CreateNotificationDto): Notification
  sendBulk(userIds: string[], dto: CreateNotificationDto): Notification[]
  getNotifications(userId: string, pagination): PaginatedResult<Notification>
  markAsRead(notificationId: string, userId: string): Notification
  markAllAsRead(userId: string): void
  getUnreadCount(userId: string): number
  updatePreferences(userId: string, dto: UpdatePreferencesDto): NotificationPreference[]
  sendEmail(dto: SendEmailDto): void
  sendSMS(dto: SendSMSDto): void
  sendPush(userId: string, dto: SendPushDto): void
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/notifications` | Bearer | List notifications |
| PATCH | `/api/v1/notifications/:id/read` | Bearer | Mark as read |
| POST | `/api/v1/notifications/read-all` | Bearer | Mark all as read |
| GET | `/api/v1/notifications/unread-count` | Bearer | Get unread count |
| PATCH | `/api/v1/notifications/preferences` | Bearer | Update preferences |

### Dependencies

- `UsersModule` - User lookup
- Email provider (Nodemailer / SendGrid)
- SMS provider (Twilio)
- Push provider (Firebase Cloud Messaging)

### Events Consumed

| Event | Action |
|---|---|
| `user.registered` | Send welcome email |
| `deal.published` | Notify all investors |
| `investment.confirmed` | Notify investor |
| `payment.completed` | Notify investor |
| `profit.distributed` | Notify all deal participants |
| `farmer.profile_verified` | Notify farmer |

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `notification-queue` | `sendEmail` | Send email notification |
| `notification-queue` | `sendSMS` | Send SMS notification |
| `notification-queue` | `sendPush` | Send push notification |

---

## Module 19: Audit Module

### Responsibility

Log all significant system actions for compliance, debugging, and audit trail purposes.

### Entities/Models

| Entity | Description |
|---|---|
| `AuditLog` | Audit record (userId, action, resource, resourceId, oldValues, newValues, ip, userAgent, createdAt) |

### Service Methods

```
AuditService
  log(dto: CreateAuditLogDto): AuditLog
  findAll(filters: AuditFilterDto, pagination): PaginatedResult<AuditLog>
  findByResource(resource: string, resourceId: string): AuditLog[]
  findByUser(userId: string, pagination): PaginatedResult<AuditLog>
  exportAuditLog(filters: AuditFilterDto): string (CSV/JSON)
  getAuditStats(dateRange: DateRangeDto): AuditStats
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/audit-logs` | Bearer + Admin | List audit logs |
| GET | `/api/v1/admin/audit-logs/export` | Bearer + Admin | Export audit logs |

### Dependencies

- `PrismaModule` - Database access

### Events Consumed

All events from all modules are consumed by AuditModule for logging.

### Queue Jobs

| Queue | Job | Description |
|---|---|---|
| `audit-queue` | `logAction` | Write audit log entry |
| `audit-queue` | `exportReport` | Generate audit report |

---

## Module 20: Admin Module

### Responsibility

Provide admin-specific functionality: dashboard aggregation, farmer verification, deal approval, reconciliation, and financial reports.

### Service Methods

```
AdminService
  getDashboard(): DashboardStats
  getPendingFarmerVerifications(): FarmerProfile[]
  approveFarmer(farmerId: string, adminId: string): FarmerProfile
  rejectFarmer(farmerId: string, adminId: string, reason: string): FarmerProfile
  getPendingDealReviews(): Deal[]
  approveDeal(dealId: string, adminId: string): Deal
  rejectDeal(dealId: string, adminId: string, reason: string): Deal
  getInvestmentStats(filters): InvestmentStats
  runReconciliation(): ReconciliationResult
  getFinancialReports(filters): FinancialReport
  getBlockchainStatus(): BlockchainDashboardStatus
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard` | Bearer + Admin | Dashboard stats |
| GET | `/api/v1/admin/farmers/verify` | Bearer + Admin | Pending verifications |
| POST | `/api/v1/admin/farmers/:id/verify` | Bearer + Admin | Verify farmer |
| POST | `/api/v1/admin/farmers/:id/reject` | Bearer + Admin | Reject farmer |
| GET | `/api/v1/admin/deals/review` | Bearer + Admin | Pending reviews |
| POST | `/api/v1/admin/deals/:id/approve` | Bearer + Admin | Approve deal |
| POST | `/api/v1/admin/deals/:id/reject` | Bearer + Admin | Reject deal |
| GET | `/api/v1/admin/investments` | Bearer + Admin | Investment stats |
| GET | `/api/v1/admin/reconciliation` | Bearer + Admin | Reconciliation status |
| POST | `/api/v1/admin/reconciliation/run` | Bearer + Admin | Run reconciliation |
| GET | `/api/v1/admin/financial-reports` | Bearer + Admin | Financial reports |
| GET | `/api/v1/admin/blockchain-status` | Bearer + Admin | Blockchain dashboard |

### Dependencies

- `FarmerModule` - Farmer verification
- `DealModule` - Deal approval
- `InvestmentModule` - Investment stats
- `LedgerModule` - Financial data
- `BlockchainModule` - Blockchain status

---

## Module 21: Health Module

### Responsibility

Expose health check endpoints for load balancers and monitoring.

### Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Basic liveness check |
| GET | `/health/ready` | None | Readiness check (DB, Redis, Blockchain) |
| GET | `/health/live` | None | Liveness check |

### Checks Performed

```
Readiness Check:
  PostgreSQL  - Execute SELECT 1
  Redis       - Execute PING
  Blockchain  - Check block number (RPC health)
  Queue       - Check BullMQ connection
```

---

## Module 22: Schedule Module

### Responsibility

Manage cron jobs and scheduled tasks.

### Scheduled Jobs

| Schedule | Job | Description |
|---|---|---|
| Every 5 minutes | `syncBlockchainEvents` | Index new blockchain events |
| Every 15 minutes | `checkPendingTransactions` | Check pending tx confirmations |
| Daily at 00:00 | `reconcilePayments` | Daily payment reconciliation |
| Daily at 01:00 | `reconcileLedger` | Daily ledger reconciliation |
| Daily at 02:00 | `generateReports` | Generate daily financial reports |
| Weekly (Monday) | `cleanupExpiredTokens` | Remove expired refresh tokens |
| Weekly (Monday) | `cleanupOldAuditLogs` | Archive old audit logs |
| On demand | `processSettlements` | Process pending settlements |

---

## Module 23: Queue Module

### Responsibility

Central BullMQ configuration, queue registration, and worker management.

### Queues

| Queue | Concurrency | Purpose |
|---|---|---|
| `email-queue` | 5 | Email sending |
| `blockchain-queue` | 1 | Blockchain transactions |
| `payment-queue` | 3 | Payment processing |
| `settlement-queue` | 1 | Settlement processing |
| `notification-queue` | 3 | Multi-channel notifications |
| `audit-queue` | 5 | Audit log writing |
| `reconciliation-queue` | 1 | Financial reconciliation |

---

## Cross-Module Event Flow

```
DEAL LIFECYCLE EVENT FLOW
==========================

Farmer creates deal
    --> DealModule: deal.created
    --> AuditModule: log

Farmer submits for review
    --> DealModule: deal.submitted
    --> NotificationModule: notify admin

Admin approves deal
    --> DealModule: deal.approved
    --> BlockchainModule: deployDealContract
    --> NotificationModule: notify farmer

Smart contract deployed
    --> DealModule: deal.smart_contract_created
    --> NotificationModule: notify farmer

Deal published
    --> DealModule: deal.published
    --> NotificationModule: notify all investors

Investor invests
    --> InvestmentModule: investment.created
    --> PaymentModule: processPayment
    --> LedgerModule: create debit/credit entries

Payment confirmed
    --> PaymentModule: payment.completed
    --> InvestmentModule: investment.confirmed
    --> BlockchainModule: mintOwnershipTokens
    --> LedgerModule: post final entries
    --> NotificationModule: notify investor

All funds raised
    --> DealModule: deal.funded
    --> EscrowModule: createEscrow
    --> NotificationModule: notify all

Revenue verified via Oracle
    --> OracleModule: oracle.attestation_confirmed
    --> ProfitModule: calculateProfit
    --> LedgerModule: record revenue entries

Profit calculated
    --> ProfitModule: profit.calculated
    --> SettlementModule: createSettlements
    --> NotificationModule: notify investor

Profit distributed
    --> ProfitModule: profit.distributed
    --> SettlementModule: processSettlement
    --> EscrowModule: releaseFunds
    --> LedgerModule: post distribution entries
    --> NotificationModule: notify investor
```
