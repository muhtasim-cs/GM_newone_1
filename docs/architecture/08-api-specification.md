# API Specification

## Overview

The REST API is served by the NestJS backend at `/api/v1/`. All responses follow a standard envelope format. Authentication uses JWT Bearer tokens. The API is documented via OpenAPI/Swagger and accessible at `/api/docs` in non-production environments.

---

## Response Envelope

```
SUCCESS RESPONSE:
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

ERROR RESPONSE:
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "must be a valid email" }
    ]
  },
  "requestId": "req-abc-123"
}
```

---

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user account.

```
Request:
  Body:
    email: string (required, valid email)
    password: string (required, min 8 chars, 1 upper, 1 lower, 1 number)
    name: string (required, 2-100 chars)
    role: "FARMER" | "INVESTOR" (required)
    walletAddress?: string (optional, 0x prefix, 42 chars)

Response 201:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }

Response 409:
  { "error": { "code": "EMAIL_EXISTS", "message": "Email already registered" } }

Rate Limit: 5 requests per minute per IP
Idempotency: No
Auth: None
```

### POST /api/v1/auth/login

Authenticate with email and password.

```
Request:
  Body:
    email: string (required)
    password: string (required)

Response 200:
  {
    "success": true,
    "data": {
      "accessToken": "eyJ...",
      "refreshToken": "abc...",
      "expiresIn": 900,
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "roles": ["FARMER"]
      }
    }
  }

Response 401:
  { "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }

Rate Limit: 10 requests per minute per IP
Idempotency: No
Auth: None
```

### POST /api/v1/auth/wallet-login

Authenticate using wallet signature (Sign-In With Ethereum).

```
Request:
  Body:
    address: string (required, wallet address)
    signature: string (required, signed SIWE message)
    message: string (required, SIWE message)

Response 200:
  {
    "success": true,
    "data": {
      "accessToken": "eyJ...",
      "refreshToken": "abc...",
      "expiresIn": 900,
      "user": { "id": "uuid", "walletAddress": "0x...", "roles": ["INVESTOR"] }
    }
  }

Response 401:
  { "error": { "code": "INVALID_SIGNATURE", "message": "Signature verification failed" } }

Rate Limit: 10 requests per minute per IP
Idempotency: No
Auth: None
```

### POST /api/v1/auth/refresh

Refresh access token using refresh token.

```
Request:
  Body:
    refreshToken: string (required)

Response 200:
  {
    "success": true,
    "data": {
      "accessToken": "eyJ...(new)",
      "refreshToken": "abc...(new)",
      "expiresIn": 900
    }
  }

Response 401:
  { "error": { "code": "INVALID_REFRESH_TOKEN", "message": "Refresh token expired or revoked" } }

Rate Limit: 20 requests per minute per IP
Idempotency: No
Auth: None (uses refresh token in body)
```

### POST /api/v1/auth/logout

Revoke refresh token and blacklist access token.

```
Request:
  Headers: Authorization: Bearer {accessToken}
  Body:
    refreshToken: string (required)

Response 200:
  { "success": true, "data": { "message": "Logged out successfully" } }

Rate Limit: 20 requests per minute per IP
Idempotency: No
Auth: Bearer
```

### POST /api/v1/auth/forgot-password

Request a password reset email.

```
Request:
  Body:
    email: string (required)

Response 200:
  { "success": true, "data": { "message": "If email exists, reset link sent" } }

Rate Limit: 3 requests per minute per IP
Idempotency: Yes (same response for same email within 5 min)
Auth: None
```

### POST /api/v1/auth/reset-password

Reset password using token from email.

```
Request:
  Body:
    token: string (required, from email)
    newPassword: string (required, min 8 chars)

Response 200:
  { "success": true, "data": { "message": "Password reset successfully" } }

Response 400:
  { "error": { "code": "INVALID_TOKEN", "message": "Reset token expired or invalid" } }

Rate Limit: 3 requests per minute per IP
Idempotency: No
Auth: None
```

---

## User Endpoints

### GET /api/v1/users/me

Get current authenticated user's profile.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "walletAddress": "0x...",
      "avatarUrl": "https://...",
      "status": "ACTIVE",
      "roles": ["FARMER"],
      "emailVerified": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### PATCH /api/v1/users/me

Update current user's profile.

```
Request:
  Body:
    name?: string (2-100 chars)
    phone?: string (optional)
    avatarUrl?: string (optional)

Response 200:
  { "success": true, "data": { "id": "uuid", "name": "Updated Name", ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes (via Idempotency-Key header)
Auth: Bearer
```

### GET /api/v1/users/:id (Admin)

Get user by ID.

```
Response 200:
  { "success": true, "data": { ...full user object... } }

Response 404:
  { "error": { "code": "USER_NOT_FOUND" } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/users (Admin)

List all users with filtering and pagination.

```
Query Params:
  page?: number (default 1)
  limit?: number (default 20, max 100)
  role?: string ("FARMER" | "INVESTOR" | "ADMIN")
  status?: string ("ACTIVE" | "SUSPENDED" | "DEACTIVATED")
  search?: string (name or email partial match)
  sortBy?: string ("createdAt" | "name" | "email")
  sortOrder?: string ("asc" | "desc")

Response 200:
  { "success": true, "data": [...users...], "meta": { "page": 1, "limit": 20, "total": 150 } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

---

## Farmer Endpoints

### POST /api/v1/farmers/profile

Create farmer profile (user must have FARMER role).

```
Request:
  Body:
    farmName: string (required, 2-200 chars)
    bio?: string (optional, max 1000 chars)
    location: string (required, 2-255 chars)
    latitude?: number (optional, -90 to 90)
    longitude?: number (optional, -180 to 180)
    yearsExperience?: number (optional, > 0)
    totalFarmSizeHectares?: number (optional, > 0)

Response 201:
  { "success": true, "data": { "id": "uuid", "farmName": "...", "verificationStatus": "PENDING", ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farmer role
```

### GET /api/v1/farmers/profile

Get own farmer profile.

```
Response 200:
  { "success": true, "data": { "id": "uuid", "farmName": "...", ... } }

Response 404:
  { "error": { "code": "PROFILE_NOT_FOUND" } }

Rate Limit: 100 requests per minute
Auth: Bearer + Farmer role
```

### PATCH /api/v1/farmers/profile

Update farmer profile.

```
Request:
  Body:
    farmName?: string
    bio?: string
    location?: string
    latitude?: number
    longitude?: number
    yearsExperience?: number
    totalFarmSizeHectares?: number

Response 200:
  { "success": true, "data": { ...updated profile... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farmer role
```

### POST /api/v1/farmers/documents

Upload verification document.

```
Request:
  Content-Type: multipart/form-data
  Body:
    type: string (required: "LAND_TITLE" | "SURVEY" | "PERMIT" | "PHOTO" | "OTHER")
    file: File (required, max 10MB, PDF/JPG/PNG)

Response 201:
  { "success": true, "data": { "id": "uuid", "type": "LAND_TITLE", "fileUrl": "...", "isVerified": false } }

Rate Limit: 10 requests per minute
Auth: Bearer + Farmer role
File Validation:
  - Max size: 10MB
  - Allowed types: application/pdf, image/jpeg, image/png
  - Virus scan via ClamAV
```

### GET /api/v1/farmers/documents

List own documents.

```
Response 200:
  { "success": true, "data": [...documents...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Farmer role
```

---

## Investor Endpoints

### POST /api/v1/investors/profile

Create investor profile.

```
Request:
  Body:
    riskTolerance: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" (required)
    investmentGoal?: string (optional)
    annualIncomeRange?: string (optional)
    isAccredited?: boolean (optional, default false)

Response 201:
  { "success": true, "data": { "id": "uuid", "kycStatus": "NOT_STARTED", ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Investor role
```

### GET /api/v1/investors/profile

Get own investor profile.

```
Response 200:
  { "success": true, "data": { ...profile with kycStatus, totalInvested... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Investor role
```

### POST /api/v1/investors/kyc

Submit KYC documents.

```
Request:
  Content-Type: multipart/form-data
  Body:
    documentType: string (required: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID")
    frontImage: File (required, max 5MB)
    backImage?: File (optional, max 5MB)
    selfieImage?: File (optional, max 5MB)

Response 201:
  { "success": true, "data": { "kycStatus": "SUBMITTED", "submittedAt": "..." } }

Rate Limit: 5 requests per minute
Auth: Bearer + Investor role
File Validation:
  - Max size: 5MB per file
  - Allowed types: image/jpeg, image/png
  - Anti-spoofing checks on selfie
```

### GET /api/v1/investors/kyc/status

Get KYC verification status.

```
Response 200:
  { "success": true, "data": { "kycStatus": "VERIFIED", "verifiedAt": "...", "verifiedBy": "admin-id" } }

Rate Limit: 100 requests per minute
Auth: Bearer + Investor role
```

---

## Farm Endpoints

### POST /api/v1/farms

Create a new farm.

```
Request:
  Body:
    name: string (required, 2-200 chars)
    description?: string (optional, max 2000 chars)
    location: string (required, 2-255 chars)
    latitude?: number
    longitude?: number
    totalSizeHectares: number (required, > 0)
    soilType?: string
    irrigationType?: string

Response 201:
  { "success": true, "data": { "id": "uuid", "name": "...", "isVerified": false, ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farmer role
```

### GET /api/v1/farms

List farms (public).

```
Query Params:
  page?: number (default 1)
  limit?: number (default 20, max 100)
  farmerId?: string (filter by farmer)
  location?: string (partial match)
  verified?: boolean
  cropId?: string (filter by associated crop)
  sortBy?: string ("createdAt" | "name" | "totalSizeHectares")
  sortOrder?: string ("asc" | "desc")

Response 200:
  { "success": true, "data": [...farms...], "meta": { ...pagination... } }

Rate Limit: 100 requests per minute
Auth: None (public endpoint)
```

### GET /api/v1/farms/:id

Get farm detail.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Green Valley Farm",
      "farmer": { "id": "...", "name": "John" },
      "crops": [...],
      "documents": [...],
      "projects": [...]
    }
  }

Rate Limit: 100 requests per minute
Auth: None (public)
```

### PATCH /api/v1/farms/:id

Update farm.

```
Request:
  Body: same as create, all fields optional

Response 200:
  { "success": true, "data": { ...updated farm... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farm owner
```

### DELETE /api/v1/farms/:id

Soft-delete farm.

```
Response 200:
  { "success": true, "data": { "message": "Farm deleted" } }

Response 400:
  { "error": { "code": "ACTIVE_DEALS", "message": "Cannot delete farm with active deals" } }

Rate Limit: 10 requests per minute
Auth: Bearer + Farm owner
```

### POST /api/v1/farms/:id/documents

Upload farm document.

```
Request: multipart/form-data (same as farmer documents)
  type: "LAND_TITLE" | "SURVEY" | "PERMIT" | "PHOTO" | "OTHER"
  file: File (max 10MB)

Response 201:
  { "success": true, "data": { "id": "uuid", "type": "...", "fileUrl": "..." } }

Rate Limit: 10 requests per minute
Auth: Bearer + Farm owner
```

### GET /api/v1/farms/:id/documents

List farm documents.

```
Response 200:
  { "success": true, "data": [...documents...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Farm owner
```

---

## Crop Endpoints

### GET /api/v1/crops

List all crops in catalog.

```
Query Params:
  category?: string ("CEREAL" | "VEGETABLE" | "FRUIT" | "LEGUME" | "CASH_CROP")
  search?: string (name partial match)

Response 200:
  { "success": true, "data": [...crops with varieties...] }

Rate Limit: 100 requests per minute
Cache: 1 hour (CDN cacheable)
Auth: None
```

### GET /api/v1/crops/:id

Get crop detail with varieties.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Maize",
      "category": "CEREAL",
      "varieties": [
        { "id": "...", "name": "Hybrid 614", "growingPeriodDays": 120, ... }
      ],
      "seasons": [...]
    }
  }

Rate Limit: 100 requests per minute
Cache: 1 hour
Auth: None
```

---

## Project Endpoints

### POST /api/v1/projects

Create an agricultural project.

```
Request:
  Body:
    farmId: string (UUID, required)
    cropVarietyId?: string (UUID, optional)
    name: string (required, 2-200 chars)
    description?: string (optional, max 2000 chars)
    startDate: string (ISO date, required)
    endDate?: string (ISO date, optional)
    estimatedCost: number (required, > 0)

Response 201:
  { "success": true, "data": { "id": "uuid", "status": "PLANNING", ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farmer role (must own the farm)
```

### GET /api/v1/projects

List projects.

```
Query Params:
  page?: number
  limit?: number
  farmId?: string
  status?: string ("PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED")
  cropId?: string

Response 200:
  { "success": true, "data": [...projects...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### GET /api/v1/projects/:id

Get project detail with milestones and documents.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "farm": { "id": "...", "name": "..." },
      "cropVariety": { "name": "Maize - Hybrid 614" },
      "milestones": [...],
      "documents": [...],
      "status": "IN_PROGRESS"
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### POST /api/v1/projects/:id/milestones

Add a milestone to a project.

```
Request:
  Body:
    name: string (required)
    description?: string
    targetDate: string (ISO date, required)
    orderIndex: number (required, >= 0)
    expectedOutput?: string

Response 201:
  { "success": true, "data": { "id": "uuid", "status": "PENDING", ... } }

Rate Limit: 20 requests per minute
Auth: Bearer + Project owner
```

### POST /api/v1/projects/:id/documents

Upload project document.

```
Request: multipart/form-data
  type: "PLAN" | "BUDGET" | "PERMIT" | "REPORT" | "OTHER"
  file: File (max 10MB)

Response 201:
  { "success": true, "data": { "id": "uuid", ... } }

Rate Limit: 10 requests per minute
Auth: Bearer + Project owner
```

---

## Deal Endpoints

### POST /api/v1/deals

Create a new deal.

```
Request:
  Body:
    projectId: string (UUID, required)
    title: string (required, 5-200 chars)
    description: string (required, 20-5000 chars)
    farmerSharePercent: number (required, 0-100)
    investorSharePercent: number (required, 0-100)
    platformFeePercent: number (default 2.5)
    totalTargetAmount: number (required, > 0)
    terms: {
      minInvestment: number (required, > 0)
      maxInvestment?: number (optional, > minInvestment)
      expectedROI: number (required, > 0)
      durationMonths: number (required, > 0)
      paymentSchedule: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUAL" | "AT_HARVEST"
      riskLevel: "LOW" | "MODERATE" | "HIGH"
      insuranceAvailable?: boolean
      collateralRequired?: boolean
    }

Response 201:
  { "success": true, "data": { "id": "uuid", "status": "DRAFT", ... } }

Rate Limit: 20 requests per minute
Idempotency: Yes
Auth: Bearer + Farmer role
```

### GET /api/v1/deals

List deals.

```
Query Params:
  page?: number
  limit?: number
  status?: string (multiple allowed, comma-separated)
  farmerId?: string
  minAmount?: number
  maxAmount?: number
  cropId?: string
  search?: string
  sortBy?: string ("createdAt" | "totalTargetAmount" | "fundedAmount" | "publishedAt")
  sortOrder?: string

Response 200:
  { "success": true, "data": [...deals...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: None for published deals, Bearer for all
```

### GET /api/v1/deals/:id

Get deal detail.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "project": { ... },
      "farmer": { ... },
      "terms": { ... },
      "milestones": [...],
      "fundingProgress": { "funded": 50000, "target": 100000, "percent": 50 },
      "investorCount": 25,
      "status": "FUNDING"
    }
  }

Rate Limit: 100 requests per minute
Auth: None for published, Bearer for restricted
```

### POST /api/v1/deals/:id/submit

Submit deal for review.

```
Response 200:
  { "success": true, "data": { "status": "SUBMITTED" } }

Response 400:
  { "error": { "code": "INCOMPLETE_DEAL", "message": "Missing required fields" } }

Rate Limit: 10 requests per minute
Auth: Bearer + Deal owner
```

### POST /api/v1/deals/:id/approve (Admin)

Approve deal for smart contract deployment.

```
Response 200:
  { "success": true, "data": { "status": "APPROVED" } }

Rate Limit: 10 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/deals/:id/reject (Admin)

Reject deal with reason.

```
Request:
  Body:
    reason: string (required, 10-1000 chars)

Response 200:
  { "success": true, "data": { "status": "REJECTED", "rejectedReason": "..." } }

Rate Limit: 10 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/deals/:id/publish (Admin)

Publish deal for investor viewing.

```
Response 200:
  { "success": true, "data": { "status": "PUBLISHED", "publishedAt": "..." } }

Rate Limit: 10 requests per minute
Auth: Bearer + Admin role
```

---

## Investment Endpoints

### POST /api/v1/investments

Create a new investment.

```
Request:
  Headers:
    Idempotency-Key: string (recommended)
  Body:
    dealId: string (UUID, required)
    amount: number (required, > 0, within deal min/max)
    paymentMethod: "CRYPTO" | "FIAT_CARD" | "FIAT_BANK" (required)
    walletAddress?: string (required if CRYPTO)

Response 201:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "status": "PENDING",
      "payment": {
        "id": "...",
        "clientSecret": "...",  // for Stripe
        "checkoutUrl": "..."    // for PayPal
      }
    }
  }

Response 400:
  { "error": { "code": "DEAL_NOT_FUNDING", "message": "Deal is not accepting investments" } }

Rate Limit: 10 requests per minute per user
Idempotency: Required (Idempotency-Key header)
Auth: Bearer + Investor role
```

### GET /api/v1/investments

List own investments.

```
Query Params:
  page?: number
  limit?: number
  status?: string ("PENDING" | "CONFIRMED" | "FAILED" | "CANCELLED")
  dealId?: string

Response 200:
  { "success": true, "data": [...investments with deal info...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Investor role
```

### GET /api/v1/investments/:id

Get investment detail.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "deal": { "id": "...", "title": "..." },
      "amount": 5000,
      "unitCount": 5,
      "status": "CONFIRMED",
      "paymentMethod": "FIAT_CARD",
      "confirmedAt": "...",
      "ownershipTokens": [...]
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer + Investment owner or Admin
```

### GET /api/v1/investments/:id/transactions

Get investment transaction history.

```
Response 200:
  { "success": true, "data": [...transactions with status, amounts, timestamps...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Investment owner
```

---

## Payment Endpoints

### POST /api/v1/payments

Create a payment for an investment.

```
Request:
  Body:
    investmentId: string (UUID, required)
    amount: number (required, > 0)
    currency: string (default "USD")
    provider: "STRIPE" | "PAYPAL" (required)

Response 201:
  { "success": true, "data": { "id": "...", "clientSecret": "...", "status": "PENDING" } }

Rate Limit: 10 requests per minute
Idempotency: Yes
Auth: Bearer + Investor role
```

### POST /api/v1/payments/webhook

Payment provider webhook (no auth, signature verified).

```
Request:
  Headers:
    Stripe-Signature: string (for Stripe)
    PayPal-Transmission-Sig: string (for PayPal)
  Body: Provider-specific JSON payload

Response 200:
  { "received": true }

Rate Limit: None (IP-whitelisted)
Idempotency: Yes (webhook event ID checked)
Auth: None (webhook signature verified)
```

### GET /api/v1/payments/:id

Get payment status.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "amount": 5000,
      "currency": "USD",
      "provider": "STRIPE",
      "status": "SUCCEEDED",
      "createdAt": "...",
      "completedAt": "..."
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer + Payment owner
```

---

## Wallet Endpoints

### POST /api/v1/wallets/connect

Connect a cryptocurrency wallet.

```
Request:
  Body:
    address: string (required, 0x prefix)
    chainId: number (required)
    signature: string (required, signed verification message)
    message: string (required)

Response 201:
  { "success": true, "data": { "id": "uuid", "address": "0x...", "isDefault": true } }

Rate Limit: 10 requests per minute
Auth: Bearer
```

### GET /api/v1/wallets

List connected wallets.

```
Response 200:
  { "success": true, "data": [{ "id": "...", "address": "0x...", "isDefault": true, ... }] }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### GET /api/v1/wallets/:id

Get wallet detail with transactions.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "address": "0x...",
      "chainId": 137,
      "balance": { "eth": "1.5", "usdc": "3000" },
      "transactions": [...]
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer + Wallet owner
```

---

## Ledger Endpoints (Admin)

### GET /api/v1/ledger/accounts

List ledger accounts.

```
Query Params:
  type?: string ("ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE")
  active?: boolean

Response 200:
  { "success": true, "data": [...accounts with balances...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/ledger/entries

List ledger entries.

```
Query Params:
  page?: number
  limit?: number
  accountId?: string
  transactionId?: string
  type?: string (transaction type)
  fromDate?: string (ISO date)
  toDate?: string (ISO date)

Response 200:
  { "success": true, "data": [...entries...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/ledger/balance/:accountId

Get account balance.

```
Response 200:
  { "success": true, "data": { "accountId": "uuid", "balance": 15000.50, "currency": "USD" } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

---

## Escrow Endpoints

### GET /api/v1/escrow

List escrow accounts.

```
Query Params:
  status?: string
  dealId?: string

Response 200:
  { "success": true, "data": [...escrow accounts...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/escrow/:id

Get escrow detail with transactions.

```
Response 200:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "deal": { "id": "...", "title": "..." },
      "totalAmount": 100000,
      "releasedAmount": 25000,
      "lockedAmount": 75000,
      "status": "PARTIALLY_RELEASED",
      "transactions": [...]
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer + Deal participant or Admin
```

---

## Profit Endpoints

### POST /api/v1/profits/calculate (Admin)

Trigger profit calculation for a deal.

```
Request:
  Body:
    dealId: string (required)
    totalRevenue: number (required, >= 0)
    totalExpenses: number (required, >= 0)
    periodStart: string (ISO date, required)
    periodEnd: string (ISO date, required)

Response 201:
  {
    "success": true,
    "data": {
      "id": "uuid",
      "totalRevenue": 50000,
      "totalExpenses": 20000,
      "netProfit": 30000,
      "platformFee": 750,
      "farmerShare": 11700,
      "investorShare": 17550,
      "status": "CALCULATED"
    }
  }

Rate Limit: 10 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/profits

List profit calculations.

```
Query Params:
  dealId?: string
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...profit calculations...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### GET /api/v1/profits/:id/distributions

Get distribution details.

```
Response 200:
  {
    "success": true,
    "data": {
      "profitCalculation": { ... },
      "distributions": [
        { "recipientType": "FARMER", "recipientId": "...", "amount": 11700 },
        { "recipientType": "INVESTOR", "recipientId": "...", "amount": 175.50 },
        ...
      ]
    }
  }

Rate Limit: 100 requests per minute
Auth: Bearer
```

---

## Settlement Endpoints

### POST /api/v1/settlements

Create settlements for a profit calculation (Admin).

```
Request:
  Body:
    profitCalculationId: string (required)

Response 201:
  { "success": true, "data": { "settlements": [...created settlements...] } }

Rate Limit: 10 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/settlements

List settlements.

```
Query Params:
  dealId?: string
  investorId?: string
  status?: string
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...settlements...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer (own settlements) or Admin (all)
```

### POST /api/v1/settlements/:id/withdraw (Investor)

Request withdrawal of settlement funds.

```
Request:
  Body:
    amount: number (required, <= settlement amount)
    method: "BANK_TRANSFER" | "CRYPTO" (required)
    bankDetails?: { name, accountNumber, routingNumber } (required if BANK_TRANSFER)
    cryptoAddress?: string (required if CRYPTO)

Response 201:
  { "success": true, "data": { "id": "uuid", "status": "PENDING", ... } }

Rate Limit: 5 requests per minute
Auth: Bearer + Settlement owner
```

---

## Blockchain Endpoints

### GET /api/v1/blockchain/transactions

List blockchain transactions.

```
Query Params:
  dealId?: string
  status?: string ("PENDING" | "CONFIRMED" | "FAILED")
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...transactions...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/blockchain/events

List indexed blockchain events.

```
Query Params:
  contractAddress?: string
  eventName?: string
  processed?: boolean
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...events...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/blockchain/status

Get blockchain network status.

```
Response 200:
  {
    "success": true,
    "data": {
      "network": "polygon",
      "chainId": 137,
      "blockNumber": 50000000,
      "gasPrice": "30 gwei",
      "rpcHealth": "healthy",
      "pendingTransactions": 3,
      "lastIndexedBlock": 49999995
    }
  }

Rate Limit: 30 requests per minute
Auth: None
```

---

## Notification Endpoints

### GET /api/v1/notifications

List own notifications.

```
Query Params:
  page?: number
  limit?: number
  isRead?: boolean
  type?: string

Response 200:
  { "success": true, "data": [...notifications...], "meta": { "unreadCount": 5, ... } }

Rate Limit: 100 requests per minute
Auth: Bearer
```

### PATCH /api/v1/notifications/:id/read

Mark notification as read.

```
Response 200:
  { "success": true, "data": { "isRead": true, "readAt": "..." } }

Rate Limit: 100 requests per minute
Auth: Bearer + Notification owner
```

### POST /api/v1/notifications/read-all

Mark all notifications as read.

```
Response 200:
  { "success": true, "data": { "count": 5 } }

Rate Limit: 10 requests per minute
Auth: Bearer
```

---

## Admin Endpoints

### GET /api/v1/admin/dashboard

Get admin dashboard statistics.

```
Response 200:
  {
    "success": true,
    "data": {
      "totalUsers": 1500,
      "totalFarmers": 300,
      "totalInvestors": 1100,
      "pendingVerifications": 12,
      "pendingDealReviews": 5,
      "activeDeals": 25,
      "totalInvestmentVolume": 2500000,
      "totalProfitsDistributed": 500000,
      "platformFeesCollected": 50000,
      "revenueThisMonth": 85000,
      "recentActivity": [...]
    }
  }

Rate Limit: 60 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/admin/farmers/verify

List farmers pending verification.

```
Response 200:
  { "success": true, "data": [...farmer profiles with documents...] }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/admin/farmers/:id/verify

Verify a farmer.

```
Response 200:
  { "success": true, "data": { "verificationStatus": "VERIFIED", "verifiedAt": "..." } }

Rate Limit: 20 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/admin/deals/:id/approve

Approve a deal (same as deal endpoint, admin convenience).

```
Response 200:
  { "success": true, "data": { "status": "APPROVED" } }

Rate Limit: 20 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/admin/deals/:id/reject

Reject a deal.

```
Request:
  Body:
    reason: string (required)

Response 200:
  { "success": true, "data": { "status": "REJECTED" } }

Rate Limit: 20 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/admin/investments

List all investments (admin view).

```
Query Params:
  dealId?: string
  investorId?: string
  status?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...investments with full details...], "meta": { ... } }

Rate Limit: 100 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/admin/reconciliation

Get reconciliation status.

```
Response 200:
  {
    "success": true,
    "data": {
      "lastRun": "2024-01-15T01:00:00Z",
      "status": "CLEAN",
      "discrepancies": 0,
      "details": {
        "payments": { "matched": 500, "mismatched": 0 },
        "ledger": { "balanced": 5000, "unbalanced": 0 },
        "escrow": { "matched": 25, "mismatched": 0 }
      }
    }
  }

Rate Limit: 60 requests per minute
Auth: Bearer + Admin role
```

### POST /api/v1/admin/reconciliation/run

Trigger manual reconciliation.

```
Response 202:
  { "success": true, "data": { "message": "Reconciliation started", "jobId": "..." } }

Rate Limit: 1 request per 5 minutes
Auth: Bearer + Admin role
```

### GET /api/v1/admin/audit-logs

Query audit logs.

```
Query Params:
  userId?: string
  action?: string
  resource?: string
  resourceId?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number

Response 200:
  { "success": true, "data": [...audit logs...], "meta": { ... } }

Rate Limit: 60 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/admin/financial-reports

Get financial reports.

```
Query Params:
  type?: "daily" | "weekly" | "monthly" | "yearly"
  fromDate?: string
  toDate?: string

Response 200:
  {
    "success": true,
    "data": {
      "period": { "from": "...", "to": "..." },
      "revenue": { "total": 85000, "breakdown": {...} },
      "expenses": { "total": 30000, "breakdown": {...} },
      "netProfit": 55000,
      "platformFees": 4250,
      "dealsSettled": 8,
      "investmentsProcessed": 150
    }
  }

Rate Limit: 30 requests per minute
Auth: Bearer + Admin role
```

### GET /api/v1/admin/blockchain-status

Get blockchain operations dashboard.

```
Response 200:
  {
    "success": true,
    "data": {
      "network": "polygon",
      "rpcHealth": "healthy",
      "pendingTransactions": 3,
      "failedTransactions": 0,
      "totalGasSpent": "2.5 MATIC",
      "deployedContracts": 15,
      "totalEventsIndexed": 5000,
      "lastSyncAt": "..."
    }
  }

Rate Limit: 30 requests per minute
Auth: Bearer + Admin role
```

---

## Rate Limits Summary

| Endpoint Category | Rate Limit | Window |
|---|---|---|
| Auth (register, login, forgot-password) | 5-10 req | per minute per IP |
| Auth (refresh, logout) | 20 req | per minute per IP |
| CRUD operations | 20 req | per minute per user |
| Read operations | 100 req | per minute per user |
| Admin operations | 20-60 req | per minute per admin |
| File uploads | 10 req | per minute per user |
| Public read (no auth) | 100 req | per minute per IP |
| Webhooks | Unlimited | IP-whitelisted |
| Blockchain status | 30 req | per minute per IP |
