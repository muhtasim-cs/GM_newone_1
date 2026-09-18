# Entity-Relationship Diagram

## Overview

This document defines the complete database schema for the Agriculture Profit-Sharing Platform. The database uses PostgreSQL with Prisma ORM. All tables use UUID primary keys, soft deletes where applicable, and created/updated timestamps.

---

## ER Diagram

```
ENTITY-RELATIONSHIP DIAGRAM
=============================

+----------------+     +----------------+     +----------------+
|     users      |     |     roles      |     |  permissions   |
|----------------|     |----------------|     |----------------|
| id (PK)        |     | id (PK)        |     | id (PK)        |
| email          |     | name           |     | action         |
| password_hash  |     | description    |     | resource       |
| name           |     | created_at     |     | description    |
| phone          |     +-------+--------+     | created_at     |
| wallet_address |             |              +-------+--------+
| status         |     +-------+--------+            |
| created_at     |     |  user_roles   |     +-------+--------+
| updated_at     |     |---------------|     |role_permissions|
+-------+--------+     | user_id (FK)  |     |----------------|
        |              | role_id (FK)   |     | role_id (FK)   |
        |              | created_at     |     | permission_id  |
        |              +----------------+     | created_at     |
        |                                     +----------------+
        |
        |---+---+---+---+---+---+---+---+---+---+---+---+---+
        |   |   |   |   |   |   |   |   |   |   |   |   |   |
        v   v   v   v   v   v   v   v   v   v   v   v   v   v
     +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+
     |f  | |f  | |w  | |n  | |i  | |d  | |a  | |a  | |s  | |a  |
     |a  | |a  | |a  | |o  | |n  | |e  | |u  | |u  | |e  | |u  |
     |r  | |r  | |l  | |t  | |v  | |a  | |d  | |d  | |t  | |d  |
     |m  | |m  | |l  | |i  | |e  | |l  | |i  | |i  | |t  | |i  |
     |e  | |e  | |e  | |f  | |s  | |s  | |t  | |t  | |l  | |t  |
     |r  | |r  | |s  | |_  | |t  | |   | |   | |   | |e  | |_  |
     |_  | |_  | |   | |i  | |   | |   | |   | |   | |m  | |l  |
     |p  | |p  | |   | |c  | |i  | |   | |   | |   | |e  | |o  |
     |r  | |r  | |   | |   | |n  | |   | |   | |   | |n  | |g  |
     |o  | |o  | |   | |a  | |v  | |   | |   | |   | |t  | |   |
     |f  | |f  | |   | |t  | |e  | |   | |   | |   | |s  | |   |
     |i  | |i  | |   | |i  | |s  | |   | |   | |   | |   | |   |
     |l  | |l  | |   | |o  | |t  | |   | |   | |   | |   | |   |
     |e  | |e  | |   | |n  | |   | |   | |   | |   | |   | |   |
     +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+ +---+
```

```
DETAILED RELATIONSHIP MAP
===========================

users (1) ----< (M) farmer_profiles
users (1) ----< (M) investor_profiles
users (1) ----< (M) wallets
users (1) ----< (M) notifications
users (1) ----< (M) audit_logs
users (M) >----< (M) roles (via user_roles)

farmer_profiles (1) ----< (M) farms
farmer_profiles (1) ----< (M) farm_documents (via farms)

farms (M) >----< (M) crops (via farm_crop)
farms (1) ----< (M) agricultural_projects
farms (1) ----< (M) farm_documents

agricultural_projects (1) ----< (M) project_documents
agricultural_projects (1) ----< (M) project_milestones
agricultural_projects (1) ----< (M) deals

deals (1) ----< (M) deal_terms
deals (1) ----< (M) deal_participants
deals (1) ----< (M) investments
deals (1) ----< (1) escrow_accounts
deals (1) ----< (M) profit_calculations
deals (1) ----< (M) revenues
deals (1) ----< (M) expenses
deals (1) ----< (M) harvests
deals (1) ----< (M) sales

investor_profiles (1) ----< (M) investments

investments (1) ----< (M) investment_units
investments (1) ----< (M) investment_transactions
investments (1) ----< (1) payments
investments (1) ----< (M) settlements

payments (1) ----< (M) payment_attempts
payments (1) ----< (M) payment_webhooks

wallets (1) ----< (M) wallet_transactions

accounts (1) ----< (M) ledger_entries
ledger_transactions (1) ----< (M) ledger_entries

escrow_accounts (1) ----< (M) escrow_transactions

profit_calculations (1) ----< (M) profit_distributions

settlements (1) ----< (M) withdrawals

deals (1) ----< (M) blockchain_transactions
deals (1) ----< (M) oracle_attestations
deals (1) ----< (M) smart_contracts
```

---

## Table Definitions

### 1. users

Core user table for all platform participants.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| email            | VARCHAR(255)     | UNIQUE, NOT NULL, LOWERCASE          |
| password_hash    | VARCHAR(255)     | NULLABLE (wallet-only users)         |
| name             | VARCHAR(255)     | NOT NULL                             |
| phone            | VARCHAR(20)      | NULLABLE                             |
| wallet_address   | VARCHAR(42)      | UNIQUE, NULLABLE, CHECK (0x prefix)  |
| status           | ENUM             | NOT NULL, DEFAULT 'ACTIVE'           |
|                  |                  |   ACTIVE | SUSPENDED | DEACTIVATED   |
| avatar_url       | VARCHAR(500)     | NULLABLE                             |
| email_verified   | BOOLEAN          | DEFAULT FALSE                        |
| last_login_at    | TIMESTAMPTZ      | NULLABLE                             |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
| updated_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
| deleted_at       | TIMESTAMPTZ      | NULLABLE (soft delete)               |
+------------------+------------------+--------------------------------------+

Indexes:
  - users_email_idx UNIQUE ON (email)
  - users_wallet_address_idx UNIQUE ON (wallet_address)
  - users_status_idx ON (status)
  - users_created_at_idx ON (created_at)
```

### 2. roles

Role definitions for RBAC.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| name             | VARCHAR(50)      | UNIQUE, NOT NULL                     |
| description      | VARCHAR(255)     | NULLABLE                             |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Seed Data:
  - FARMER
  - INVESTOR
  - ADMIN
  - GUEST

Indexes:
  - roles_name_idx UNIQUE ON (name)
```

### 3. permissions

Permission definitions for fine-grained access control.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| action           | VARCHAR(50)      | NOT NULL                             |
| resource         | VARCHAR(50)      | NOT NULL                             |
| description      | VARCHAR(255)     | NULLABLE                             |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - permissions_action_resource_idx UNIQUE ON (action, resource)
```

### 4. user_roles

Many-to-many: users to roles.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| user_id          | UUID             | FK -> users.id, NOT NULL, ON DELETE CASCADE |
| role_id          | UUID             | FK -> roles.id, NOT NULL, ON DELETE CASCADE |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - user_roles_user_id_idx ON (user_id)
  - user_roles_role_id_idx ON (role_id)
  - user_roles_user_role_idx UNIQUE ON (user_id, role_id)
```

### 5. role_permissions

Many-to-many: roles to permissions.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| role_id          | UUID             | FK -> roles.id, NOT NULL, ON DELETE CASCADE |
| permission_id    | UUID             | FK -> permissions.id, NOT NULL, ON DELETE CASCADE |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - role_permissions_role_id_idx ON (role_id)
  - role_permissions_permission_id_idx ON (permission_id)
  - role_permissions_role_perm_idx UNIQUE ON (role_id, permission_id)
```

### 6. farmer_profiles

Farmer-specific profile data.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| user_id             | UUID             | FK -> users.id, UNIQUE, NOT NULL   |
| farm_name           | VARCHAR(255)     | NOT NULL                           |
| bio                 | TEXT             | NULLABLE                           |
| location            | VARCHAR(255)     | NOT NULL                           |
| latitude            | DECIMAL(10,7)    | NULLABLE                           |
| longitude           | DECIMAL(10,7)    | NULLABLE                           |
| years_experience    | INTEGER          | NULLABLE, CHECK (> 0)             |
| total_farm_size_ha  | DECIMAL(10,2)    | NULLABLE, CHECK (> 0)             |
| verification_status | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | UNDER_REVIEW |         |
|                     |                  |   VERIFIED | REJECTED              |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| verified_by         | UUID             | FK -> users.id, NULLABLE           |
| rejection_reason    | TEXT             | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - farmer_profiles_user_id_idx UNIQUE ON (user_id)
  - farmer_profiles_verification_status_idx ON (verification_status)
```

### 7. investor_profiles

Investor-specific profile data.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| user_id             | UUID             | FK -> users.id, UNIQUE, NOT NULL   |
| risk_tolerance      | ENUM             | NOT NULL, DEFAULT 'MODERATE'       |
|                     |                  |   CONSERVATIVE | MODERATE | AGGRESSIVE |
| investment_goal     | VARCHAR(255)     | NULLABLE                           |
| annual_income_range | VARCHAR(50)      | NULLABLE                           |
| is_accredited       | BOOLEAN          | DEFAULT FALSE                      |
| kyc_status          | ENUM             | NOT NULL, DEFAULT 'NOT_STARTED'    |
|                     |                  |   NOT_STARTED | PENDING | SUBMITTED|
|                     |                  |   VERIFIED | REJECTED              |
| kyc_submitted_at    | TIMESTAMPTZ      | NULLABLE                           |
| kyc_verified_at     | TIMESTAMPTZ      | NULLABLE                           |
| kyc_provider_ref    | VARCHAR(255)     | NULLABLE                           |
| total_invested      | DECIMAL(15,2)    | DEFAULT 0, CHECK (>= 0)           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - investor_profiles_user_id_idx UNIQUE ON (user_id)
  - investor_profiles_kyc_status_idx ON (kyc_status)
```

### 8. farms

Farm records owned by farmers.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| farmer_profile_id   | UUID             | FK -> farmer_profiles.id, NOT NULL |
| name                | VARCHAR(255)     | NOT NULL                           |
| description         | TEXT             | NULLABLE                           |
| location            | VARCHAR(255)     | NOT NULL                           |
| latitude            | DECIMAL(10,7)    | NULLABLE                           |
| longitude           | DECIMAL(10,7)    | NULLABLE                           |
| total_size_hectares | DECIMAL(10,2)    | NOT NULL, CHECK (> 0)             |
| soil_type           | VARCHAR(100)     | NULLABLE                           |
| irrigation_type     | VARCHAR(100)     | NULLABLE                           |
| is_verified         | BOOLEAN          | DEFAULT FALSE                      |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| verified_by         | UUID             | FK -> users.id, NULLABLE           |
| status              | ENUM             | NOT NULL, DEFAULT 'ACTIVE'         |
|                     |                  |   ACTIVE | INACTIVE | ARCHIVED     |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| deleted_at          | TIMESTAMPTZ      | NULLABLE (soft delete)             |
+---------------------+------------------+------------------------------------+

Indexes:
  - farms_farmer_profile_id_idx ON (farmer_profile_id)
  - farms_status_idx ON (status)
  - farms_is_verified_idx ON (is_verified)
  - farms_location_idx ON (location)
```

### 9. farm_documents

Documents associated with farms.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| farm_id          | UUID             | FK -> farms.id, NOT NULL, ON DELETE CASCADE |
| type             | ENUM             | NOT NULL                             |
|                  |                  |   LAND_TITLE | SURVEY | PERMIT |     |
|                  |                  |   PHOTO | OTHER                      |
| file_url         | VARCHAR(500)     | NOT NULL                             |
| file_name        | VARCHAR(255)     | NOT NULL                             |
| file_size        | INTEGER          | NOT NULL, CHECK (> 0)               |
| mime_type        | VARCHAR(100)     | NOT NULL                             |
| is_verified      | BOOLEAN          | DEFAULT FALSE                        |
| verified_at      | TIMESTAMPTZ      | NULLABLE                             |
| verified_by      | UUID             | FK -> users.id, NULLABLE             |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - farm_documents_farm_id_idx ON (farm_id)
```

### 10. farm_crop

Many-to-many: farms to crops with season info.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| farm_id             | UUID             | FK -> farms.id, NOT NULL           |
| crop_id             | UUID             | FK -> crops.id, NOT NULL           |
| variety_id          | UUID             | FK -> crop_varieties.id, NULLABLE  |
| season              | VARCHAR(50)      | NOT NULL                           |
| year                | INTEGER          | NOT NULL                           |
| area_hectares       | DECIMAL(10,2)    | NOT NULL, CHECK (> 0)             |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - farm_crop_farm_id_idx ON (farm_id)
  - farm_crop_crop_id_idx ON (crop_id)
  - farm_crop_farm_crop_season_idx UNIQUE ON (farm_id, crop_id, season, year)
```

### 11. crops

Crop catalog.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| name             | VARCHAR(100)     | UNIQUE, NOT NULL                    |
| category         | VARCHAR(50)      | NOT NULL                            |
|                  |                  |   CEREAL | VEGETABLE | FRUIT |      |
|                  |                  |   LEGUME | CASH_CROP | OTHER        |
| description      | TEXT             | NULLABLE                            |
| icon_url         | VARCHAR(500)     | NULLABLE                            |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()             |
| updated_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()             |
+------------------+------------------+--------------------------------------+

Indexes:
  - crops_name_idx UNIQUE ON (name)
  - crops_category_idx ON (category)
```

### 12. crop_varieties

Varieties of crops.

```
+------------------------------+------------------+-----------------------------+
| Column                       | Type             | Constraints                 |
+------------------------------+------------------+-----------------------------+
| id                           | UUID             | PK, DEFAULT uuid_generate_v4() |
| crop_id                      | UUID             | FK -> crops.id, NOT NULL    |
| name                         | VARCHAR(100)     | NOT NULL                    |
| growing_period_days          | INTEGER          | NOT NULL, CHECK (> 0)      |
| expected_yield_per_hectare   | DECIMAL(10,2)    | NOT NULL, CHECK (> 0)      |
| yield_unit                   | VARCHAR(20)      | NOT NULL, DEFAULT 'kg'     |
| price_per_unit               | DECIMAL(10,2)    | NULLABLE                   |
| created_at                   | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()    |
+------------------------------+------------------+-----------------------------+

Indexes:
  - crop_varieties_crop_id_idx ON (crop_id)
  - crop_varieties_crop_name_idx UNIQUE ON (crop_id, name)
```

### 13. growing_seasons

Season information for crop varieties.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| crop_variety_id     | UUID             | FK -> crop_varieties.id, NOT NULL  |
| season              | VARCHAR(20)      | NOT NULL                           |
|                     |                  |   WET | DRY | ALL_YEAR            |
| start_month         | INTEGER          | NOT NULL, CHECK (1-12)             |
| end_month           | INTEGER          | NOT NULL, CHECK (1-12)             |
| region              | VARCHAR(100)     | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - growing_seasons_crop_variety_id_idx ON (crop_variety_id)
```

### 14. agricultural_projects

Agricultural projects tied to farms.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| farm_id             | UUID             | FK -> farms.id, NOT NULL           |
| crop_variety_id     | UUID             | FK -> crop_varieties.id, NULLABLE  |
| name                | VARCHAR(255)     | NOT NULL                           |
| description         | TEXT             | NULLABLE                           |
| start_date          | DATE             | NOT NULL                           |
| end_date            | DATE             | NULLABLE                           |
| estimated_cost      | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| actual_cost         | DECIMAL(15,2)    | NULLABLE, CHECK (>= 0)            |
| status              | ENUM             | NOT NULL, DEFAULT 'PLANNING'       |
|                     |                  |   PLANNING | IN_PROGRESS |         |
|                     |                  |   COMPLETED | CANCELLED            |
| blockchain_project_id | INTEGER        | NULLABLE (on-chain project ID)    |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| deleted_at          | TIMESTAMPTZ      | NULLABLE (soft delete)             |
+---------------------+------------------+------------------------------------+

Indexes:
  - agricultural_projects_farm_id_idx ON (farm_id)
  - agricultural_projects_status_idx ON (status)
  - agricultural_projects_crop_variety_id_idx ON (crop_variety_id)
```

### 15. project_documents

Documents associated with projects.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| project_id       | UUID             | FK -> agricultural_projects.id, NOT NULL |
| type             | ENUM             | NOT NULL                             |
|                  |                  |   PLAN | BUDGET | PERMIT | REPORT |  |
|                  |                  |   OTHER                              |
| file_url         | VARCHAR(500)     | NOT NULL                             |
| file_name        | VARCHAR(255)     | NOT NULL                             |
| file_size        | INTEGER          | NOT NULL                             |
| mime_type        | VARCHAR(100)     | NOT NULL                             |
| created_at       | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - project_documents_project_id_idx ON (project_id)
```

### 16. project_milestones

Milestones within a project.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| project_id          | UUID             | FK -> agricultural_projects.id, NOT NULL |
| name                | VARCHAR(255)     | NOT NULL                           |
| description         | TEXT             | NULLABLE                           |
| target_date         | DATE             | NOT NULL                           |
| completion_date     | DATE             | NULLABLE                           |
| order_index         | INTEGER          | NOT NULL, CHECK (>= 0)            |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | IN_PROGRESS |          |
|                     |                  |   COMPLETED | VERIFIED | FAILED    |
| expected_output     | TEXT             | NULLABLE                           |
| verification_data   | JSONB            | NULLABLE (oracle attestation data) |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| verified_by         | UUID             | FK -> users.id, NULLABLE           |
| blockchain_milestone_id | INTEGER      | NULLABLE (on-chain milestone ID)  |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - project_milestones_project_id_idx ON (project_id)
  - project_milestones_status_idx ON (status)
```

### 17. deals

Deal records connecting farmers and investors.

```
+--------------------------+------------------+-----------------------------+
| Column                   | Type             | Constraints                 |
+--------------------------+------------------+-----------------------------+
| id                       | UUID             | PK, DEFAULT uuid_generate_v4() |
| project_id               | UUID             | FK -> agricultural_projects.id, NOT NULL |
| farmer_profile_id        | UUID             | FK -> farmer_profiles.id, NOT NULL |
| title                    | VARCHAR(255)     | NOT NULL                    |
| description              | TEXT             | NOT NULL                    |
| status                   | ENUM             | NOT NULL, DEFAULT 'DRAFT'   |
|                          |                  |   DRAFT | SUBMITTED | UNDER_REVIEW |
|                          |                  |   APPROVED | SMART_CONTRACT_CREATED |
|                          |                  |   PUBLISHED | FUNDING | FUNDED |
|                          |                  |   ACTIVE | HARVESTING | REVENUE_VERIFICATION |
|                          |                  |   PROFIT_CALCULATION | DISTRIBUTION |
|                          |                  |   SETTLED | CLOSED | REJECTED |
| farmer_share_percent     | DECIMAL(5,2)     | NOT NULL, CHECK (0-100)    |
| investor_share_percent   | DECIMAL(5,2)     | NOT NULL, CHECK (0-100)    |
| total_target_amount      | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)      |
| funded_amount            | DECIMAL(15,2)    | DEFAULT 0, CHECK (>= 0)    |
| platform_fee_percent     | DECIMAL(5,2)     | NOT NULL, DEFAULT 2.5       |
| smart_contract_address   | VARCHAR(42)      | NULLABLE                    |
| smart_contract_deployment_tx | VARCHAR(66) | NULLABLE                   |
| published_at             | TIMESTAMPTZ      | NULLABLE                    |
| funding_deadline         | TIMESTAMPTZ      | NULLABLE                    |
| rejected_reason          | TEXT             | NULLABLE                    |
| created_at               | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()     |
| updated_at               | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()     |
| deleted_at               | TIMESTAMPTZ      | NULLABLE (soft delete)      |
+--------------------------+------------------+-----------------------------+

Indexes:
  - deals_project_id_idx ON (project_id)
  - deals_farmer_profile_id_idx ON (farmer_profile_id)
  - deals_status_idx ON (status)
  - deals_smart_contract_address_idx ON (smart_contract_address)
  - deals_published_at_idx ON (published_at)
```

### 18. deal_terms

Detailed terms for a deal.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, UNIQUE, NOT NULL   |
| min_investment      | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| max_investment      | DECIMAL(15,2)    | NULLABLE, CHECK (> min_investment) |
| expected_roi_percent| DECIMAL(5,2)     | NOT NULL, CHECK (> 0)             |
| duration_months     | INTEGER          | NOT NULL, CHECK (> 0)             |
| payment_schedule    | ENUM             | NOT NULL, DEFAULT 'QUARTERLY'      |
|                     |                  |   MONTHLY | QUARTERLY |            |
|                     |                  |   SEMI_ANNUAL | AT_HARVEST         |
| risk_level          | ENUM             | NOT NULL, DEFAULT 'MODERATE'       |
|                     |                  |   LOW | MODERATE | HIGH            |
| insurance_available | BOOLEAN          | DEFAULT FALSE                      |
| collateral_required | BOOLEAN          | DEFAULT FALSE                      |
| terms_document_url  | VARCHAR(500)     | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - deal_terms_deal_id_idx UNIQUE ON (deal_id)
```

### 19. deal_participants

Tracks participants in a deal.

```
+------------------+------------------+--------------------------------------+
| Column           | Type             | Constraints                          |
+------------------+------------------+--------------------------------------+
| id               | UUID             | PK, DEFAULT uuid_generate_v4()       |
| deal_id          | UUID             | FK -> deals.id, NOT NULL             |
| user_id          | UUID             | FK -> users.id, NOT NULL             |
| role             | ENUM             | NOT NULL                             |
|                  |                  |   FARMER | INVESTOR | ADMIN          |
| joined_at        | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()              |
+------------------+------------------+--------------------------------------+

Indexes:
  - deal_participants_deal_id_idx ON (deal_id)
  - deal_participants_user_id_idx ON (user_id)
  - deal_participants_deal_user_idx UNIQUE ON (deal_id, user_id)
```

### 20. investments

Investment records.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| investor_profile_id | UUID             | FK -> investor_profiles.id, NOT NULL |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| unit_count          | INTEGER          | NOT NULL, CHECK (> 0)             |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | CONFIRMED | FAILED |    |
|                     |                  |   CANCELLED                         |
| payment_method      | ENUM             | NOT NULL                            |
|                     |                  |   CRYPTO | FIAT_CARD | FIAT_BANK   |
| confirmed_at        | TIMESTAMPTZ      | NULLABLE                           |
| failed_at           | TIMESTAMPTZ      | NULLABLE                           |
| failure_reason      | TEXT             | NULLABLE                           |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                           |
| ownership_token_ids | INTEGER[]        | NULLABLE (array of on-chain token IDs) |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - investments_deal_id_idx ON (deal_id)
  - investments_investor_profile_id_idx ON (investor_profile_id)
  - investments_status_idx ON (status)
  - investments_deal_investor_idx UNIQUE ON (deal_id, investor_profile_id)
```

### 21. investment_units

Ownership units representing fractional ownership.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| investment_id       | UUID             | FK -> investments.id, NOT NULL     |
| unit_number         | INTEGER          | NOT NULL                           |
| token_id            | INTEGER          | UNIQUE, NULLABLE (on-chain token)  |
| ownership_percent   | DECIMAL(10,6)    | NOT NULL, CHECK (> 0)             |
| status              | ENUM             | NOT NULL, DEFAULT 'ACTIVE'         |
|                     |                  |   ACTIVE | TRANSFERRED | BURNED    |
| transferred_to      | UUID             | FK -> users.id, NULLABLE           |
| transferred_at      | TIMESTAMPTZ      | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - investment_units_investment_id_idx ON (investment_id)
  - investment_units_token_id_idx UNIQUE ON (token_id)
```

### 22. investment_transactions

Transaction history for investments.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| investment_id       | UUID             | FK -> investments.id, NOT NULL     |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   INVEST | REFUND | CANCEL         |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | PROCESSING | COMPLETED  |
|                     |                  | | FAILED                           |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                           |
| payment_reference   | VARCHAR(255)     | NULLABLE                           |
| error_message       | TEXT             | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| completed_at        | TIMESTAMPTZ      | NULLABLE                           |
+---------------------+------------------+------------------------------------+

Indexes:
  - investment_transactions_investment_id_idx ON (investment_id)
  - investment_transactions_status_idx ON (status)
  - investment_transactions_blockchain_tx_hash_idx ON (blockchain_tx_hash)
```

### 23. payments

Payment records.

```
+--------------------------+------------------+-----------------------------+
| Column                   | Type             | Constraints                 |
+--------------------------+------------------+-----------------------------+
| id                       | UUID             | PK, DEFAULT uuid_generate_v4() |
| investment_id            | UUID             | FK -> investments.id, NOT NULL |
| amount                   | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)      |
| currency                 | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'    |
| provider                 | ENUM             | NOT NULL                   |
|                          |                  |   STRIPE | PAYPAL | CRYPTO |
| provider_payment_id      | VARCHAR(255)     | NULLABLE                   |
| status                   | ENUM             | NOT NULL, DEFAULT 'PENDING'|
|                          |                  |   PENDING | PROCESSING |   |
|                          |                  |   SUCCEEDED | FAILED |     |
|                          |                  |   REFUNDED                 |
| checkout_session_id      | VARCHAR(255)     | NULLABLE                   |
| client_secret            | VARCHAR(255)     | NULLABLE                   |
| failure_code             | VARCHAR(50)      | NULLABLE                   |
| failure_message          | TEXT             | NULLABLE                   |
| metadata                 | JSONB            | NULLABLE                   |
| created_at               | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()    |
| updated_at               | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()    |
| completed_at             | TIMESTAMPTZ      | NULLABLE                   |
+--------------------------+------------------+-----------------------------+

Indexes:
  - payments_investment_id_idx ON (investment_id)
  - payments_provider_payment_id_idx ON (provider_payment_id)
  - payments_status_idx ON (status)
  - payments_provider_idx ON (provider)
```

### 24. payment_attempts

History of payment attempts.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| payment_id          | UUID             | FK -> payments.id, NOT NULL        |
| attempt_number      | INTEGER          | NOT NULL, CHECK (> 0)             |
| status              | ENUM             | NOT NULL                            |
|                     |                  |   PENDING | SUCCEEDED | FAILED     |
| error_code          | VARCHAR(50)      | NULLABLE                           |
| error_message       | TEXT             | NULLABLE                           |
| provider_response   | JSONB            | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - payment_attempts_payment_id_idx ON (payment_id)
```

### 25. payment_webhooks

Webhook event log from payment providers.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| provider            | ENUM             | NOT NULL                            |
| event_type          | VARCHAR(100)     | NOT NULL                           |
| provider_event_id   | VARCHAR(255)     | UNIQUE                            |
| payload             | JSONB            | NOT NULL                           |
| signature           | VARCHAR(500)     | NULLABLE                           |
| processed           | BOOLEAN          | DEFAULT FALSE                      |
| processed_at        | TIMESTAMPTZ      | NULLABLE                           |
| processing_error    | TEXT             | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - payment_webhooks_provider_event_id_idx UNIQUE ON (provider_event_id)
  - payment_webhooks_processed_idx ON (processed)
  - payment_webhooks_created_at_idx ON (created_at)
```

### 26. wallets

Connected cryptocurrency wallets.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| user_id             | UUID             | FK -> users.id, NOT NULL           |
| address             | VARCHAR(42)      | NOT NULL                           |
| chain_id            | INTEGER          | NOT NULL                           |
| label               | VARCHAR(100)     | NULLABLE                           |
| is_default          | BOOLEAN          | DEFAULT FALSE                      |
| connected_at        | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| last_used_at        | TIMESTAMPTZ      | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - wallets_user_id_idx ON (user_id)
  - wallets_address_chain_idx UNIQUE ON (address, chain_id)
```

### 27. wallet_transactions

Transaction history for wallets.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| wallet_id           | UUID             | FK -> wallets.id, NOT NULL         |
| tx_hash             | VARCHAR(66)      | UNIQUE, NOT NULL                  |
| from_address        | VARCHAR(42)      | NOT NULL                          |
| to_address          | VARCHAR(42)      | NOT NULL                          |
| value               | VARCHAR(78)      | NOT NULL (wei string)             |
| value_decimal       | DECIMAL(20,8)    | NOT NULL                          |
| currency            | VARCHAR(10)      | NOT NULL, DEFAULT 'ETH'           |
| block_number        | BIGINT           | NOT NULL                          |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'       |
|                     |                  |   PENDING | CONFIRMED | FAILED    |
| gas_used            | BIGINT           | NULLABLE                          |
| gas_price           | VARCHAR(20)      | NULLABLE                          |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()           |
| confirmed_at        | TIMESTAMPTZ      | NULLABLE                          |
+---------------------+------------------+------------------------------------+

Indexes:
  - wallet_transactions_wallet_id_idx ON (wallet_id)
  - wallet_transactions_tx_hash_idx UNIQUE ON (tx_hash)
  - wallet_transactions_block_number_idx ON (block_number)
```

### 28. accounts

General ledger accounts.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| code                | VARCHAR(20)      | UNIQUE, NOT NULL                   |
| name                | VARCHAR(100)     | NOT NULL                           |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   ASSET | LIABILITY | EQUITY |      |
|                     |                  |   REVENUE | EXPENSE                 |
| sub_type            | VARCHAR(50)      | NOT NULL                           |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'            |
| parent_id           | UUID             | FK -> accounts.id, NULLABLE        |
| is_active           | BOOLEAN          | DEFAULT TRUE                       |
| description         | TEXT             | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Account Code Scheme:
  1xxx - Assets (1100 Cash, 1200 Receivable, 1300 Escrow)
  2xxx - Liabilities (2100 Payable, 2200 Deferred Revenue)
  3xxx - Equity (3100 Investment Capital, 3200 Retained Earnings)
  4xxx - Revenue (4100 Sales, 4200 Investment Returns)
  5xxx - Expenses (5100 Operations, 5200 Platform Fees, 5300 Gas)

Indexes:
  - accounts_code_idx UNIQUE ON (code)
  - accounts_type_idx ON (type)
  - accounts_parent_id_idx ON (parent_id)
```

### 29. ledger_entries

Individual debit/credit entries.

```
+-----------------------------+------------------+-----------------------------+
| Column                      | Type             | Constraints                 |
+-----------------------------+------------------+-----------------------------+
| id                          | UUID             | PK, DEFAULT uuid_generate_v4() |
| ledger_transaction_id       | UUID             | FK -> ledger_transactions.id, NOT NULL |
| account_id                  | UUID             | FK -> accounts.id, NOT NULL |
| debit                       | DECIMAL(18,6)    | DEFAULT 0, CHECK (>= 0)    |
| credit                      | DECIMAL(18,6)    | DEFAULT 0, CHECK (>= 0)    |
| balance_after               | DECIMAL(18,6)    | NOT NULL                   |
| description                 | VARCHAR(255)     | NULLABLE                   |
| metadata                    | JSONB            | NULLABLE                   |
| created_at                  | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()    |
+-----------------------------+------------------+-----------------------------+

Constraint: CHECK (debit > 0 OR credit > 0) -- every entry has at least one
Constraint: CHECK (NOT (debit > 0 AND credit > 0)) -- not both

Indexes:
  - ledger_entries_ledger_transaction_id_idx ON (ledger_transaction_id)
  - ledger_entries_account_id_idx ON (account_id)
  - ledger_entries_created_at_idx ON (created_at)
```

### 30. ledger_transactions

Transaction groupings for double-entry ledger.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   INVESTMENT | PAYMENT | REFUND |   |
|                     |                  |   ESCROW_LOCK | ESCROW_RELEASE |   |
|                     |                  |   PROFIT_DISTRIBUTION | FEE |       |
|                     |                  |   SETTLEMENT | WITHDRAWAL | OTHER   |
| reference_type      | VARCHAR(50)      | NULLABLE (polymorphic: deal, investment, etc.) |
| reference_id        | UUID             | NULLABLE (polymorphic FK)          |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | POSTED | REVERSED      |
| description         | TEXT             | NULLABLE                           |
| metadata            | JSONB            | NULLABLE                           |
| reversed_by         | UUID             | FK -> ledger_transactions.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| posted_at           | TIMESTAMPTZ      | NULLABLE                           |
+---------------------+------------------+------------------------------------+

Indexes:
  - ledger_transactions_type_idx ON (type)
  - ledger_transactions_reference_idx ON (reference_type, reference_id)
  - ledger_transactions_status_idx ON (status)
  - ledger_transactions_created_at_idx ON (created_at)
```

### 31. escrow_accounts

Escrow accounts per deal.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, UNIQUE, NOT NULL   |
| total_amount        | DECIMAL(15,2)    | NOT NULL, CHECK (>= 0)            |
| released_amount     | DECIMAL(15,2)    | NOT NULL, DEFAULT 0, CHECK (>= 0) |
| locked_amount       | DECIMAL(15,2)    | NOT NULL, DEFAULT 0, CHECK (>= 0) |
| fee_amount          | DECIMAL(15,2)    | NOT NULL, DEFAULT 0, CHECK (>= 0) |
| status              | ENUM             | NOT NULL, DEFAULT 'ACTIVE'         |
|                     |                  |   ACTIVE | PARTIALLY_RELEASED |     |
|                     |                  |   FULLY_RELEASED | REFUNDED        |
| blockchain_escrow_address | VARCHAR(42) | NULLABLE                          |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Constraint: CHECK (total_amount >= released_amount + locked_amount + fee_amount)

Indexes:
  - escrow_accounts_deal_id_idx UNIQUE ON (deal_id)
  - escrow_accounts_status_idx ON (status)
```

### 32. escrow_transactions

Escrow transaction history.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| escrow_account_id   | UUID             | FK -> escrow_accounts.id, NOT NULL |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   LOCK | RELEASE | REFUND | FEE     |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| reference_type      | VARCHAR(50)      | NULLABLE                           |
| reference_id        | UUID             | NULLABLE                           |
| status              | ENUM             | NOT NULL, DEFAULT 'COMPLETED'      |
|                     |                  |   PENDING | COMPLETED | FAILED     |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                           |
| description         | TEXT             | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - escrow_transactions_escrow_account_id_idx ON (escrow_account_id)
  - escrow_transactions_type_idx ON (type)
```

### 33. expenses

Expense records for deals.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   SEEDS | FERTILIZER | LABOR |     |
|                     |                  |   EQUIPMENT | IRRIGATION |         |
|                     |                  |   TRANSPORT | STORAGE | OTHER      |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'           |
| description         | TEXT             | NOT NULL                           |
| expense_date        | DATE             | NOT NULL                           |
| is_approved         | BOOLEAN          | DEFAULT FALSE                      |
| approved_by         | UUID             | FK -> users.id, NULLABLE           |
| approved_at         | TIMESTAMPTZ      | NULLABLE                           |
| receipt_url         | VARCHAR(500)     | NULLABLE                           |
| ledger_transaction_id | UUID           | FK -> ledger_transactions.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - expenses_deal_id_idx ON (deal_id)
  - expenses_type_idx ON (type)
  - expenses_expense_date_idx ON (expense_date)
```

### 34. expense_documents

Documents attached to expenses.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| expense_id          | UUID             | FK -> expenses.id, NOT NULL        |
| file_url            | VARCHAR(500)     | NOT NULL                           |
| file_name           | VARCHAR(255)     | NOT NULL                           |
| file_size           | INTEGER          | NOT NULL                           |
| mime_type           | VARCHAR(100)     | NOT NULL                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - expense_documents_expense_id_idx ON (expense_id)
```

### 35. harvests

Harvest records for deals.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| crop_variety_id     | UUID             | FK -> crop_varieties.id, NOT NULL  |
| quantity            | DECIMAL(12,2)    | NOT NULL, CHECK (> 0)             |
| unit                | VARCHAR(20)      | NOT NULL, DEFAULT 'kg'            |
| quality_grade       | VARCHAR(10)      | NULLABLE (A, B, C)                |
| harvest_date        | DATE             | NOT NULL                           |
| storage_location    | VARCHAR(255)     | NULLABLE                           |
| is_verified         | BOOLEAN          | DEFAULT FALSE                      |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| oracle_attestation_id | UUID           | FK -> oracle_attestations.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - harvests_deal_id_idx ON (deal_id)
  - harvests_harvest_date_idx ON (harvest_date)
```

### 36. sales

Sale records for harvested produce.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| harvest_id          | UUID             | FK -> harvests.id, NULLABLE        |
| crop_variety_id     | UUID             | FK -> crop_varieties.id, NOT NULL  |
| quantity            | DECIMAL(12,2)    | NOT NULL, CHECK (> 0)             |
| unit_price          | DECIMAL(10,2)    | NOT NULL, CHECK (> 0)             |
| total_amount        | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'           |
| buyer_name          | VARCHAR(255)     | NULLABLE                           |
| sale_date           | DATE             | NOT NULL                           |
| is_verified         | BOOLEAN          | DEFAULT FALSE                      |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| oracle_attestation_id | UUID           | FK -> oracle_attestations.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - sales_deal_id_idx ON (deal_id)
  - sales_harvest_id_idx ON (harvest_id)
  - sales_sale_date_idx ON (sale_date)
```

### 37. revenues

Revenue records aggregated from sales.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| source              | ENUM             | NOT NULL                           |
|                     |                  |   SALE | INSURANCE_PAYOUT | GOV_GRANT |
|                     |                  | | OTHER                            |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'           |
| description         | TEXT             | NULLABLE                           |
| revenue_date        | DATE             | NOT NULL                           |
| is_verified         | BOOLEAN          | DEFAULT FALSE                      |
| verified_at         | TIMESTAMPTZ      | NULLABLE                           |
| oracle_attestation_id | UUID           | FK -> oracle_attestations.id, NULLABLE |
| ledger_transaction_id | UUID           | FK -> ledger_transactions.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - revenues_deal_id_idx ON (deal_id)
  - revenues_revenue_date_idx ON (revenue_date)
  - revenues_source_idx ON (source)
```

### 38. profit_calculations

Profit calculation records.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| total_revenue       | DECIMAL(15,2)    | NOT NULL, CHECK (>= 0)            |
| total_expenses      | DECIMAL(15,2)    | NOT NULL, CHECK (>= 0)            |
| net_profit          | DECIMAL(15,2)    | NOT NULL                           |
| platform_fee        | DECIMAL(15,2)    | NOT NULL, CHECK (>= 0)            |
| farmer_share_amount | DECIMAL(15,2)    | NOT NULL, CHECK (>= 0)            |
| investor_share_amount | DECIMAL(15,2)  | NOT NULL, CHECK (>= 0)            |
| calculation_date    | DATE             | NOT NULL                           |
| period_start        | DATE             | NOT NULL                           |
| period_end          | DATE             | NOT NULL                           |
| status              | ENUM             | NOT NULL, DEFAULT 'CALCULATED'     |
|                     |                  |   CALCULATED | DISTRIBUTED |       |
|                     |                  |   CANCELLED                         |
| calculated_by       | UUID             | FK -> users.id, NULLABLE           |
| ledger_transaction_id | UUID           | FK -> ledger_transactions.id, NULLABLE |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - profit_calculations_deal_id_idx ON (deal_id)
  - profit_calculations_status_idx ON (status)
  - profit_calculations_calculation_date_idx ON (calculation_date)
```

### 39. profit_distributions

Distribution records per investor.

```
+-----------------------------+------------------+-----------------------------+
| Column                      | Type             | Constraints                 |
+-----------------------------+------------------+-----------------------------+
| id                          | UUID             | PK, DEFAULT uuid_generate_v4() |
| profit_calculation_id       | UUID             | FK -> profit_calculations.id, NOT NULL |
| recipient_type              | ENUM             | NOT NULL                   |
|                             |                  |   FARMER | INVESTOR | PLATFORM |
| recipient_id                | UUID             | NOT NULL (user_id or platform) |
| amount                      | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)      |
| percent                     | DECIMAL(5,2)     | NOT NULL, CHECK (0-100)    |
| status                      | ENUM             | NOT NULL, DEFAULT 'PENDING'|
|                             |                  |   PENDING | COMPLETED | FAILED |
| settlement_id               | UUID             | FK -> settlements.id, NULLABLE |
| created_at                  | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()    |
| completed_at                | TIMESTAMPTZ      | NULLABLE                   |
+-----------------------------+------------------+-----------------------------+

Indexes:
  - profit_distributions_profit_calculation_id_idx ON (profit_calculation_id)
  - profit_distributions_recipient_idx ON (recipient_type, recipient_id)
  - profit_distributions_status_idx ON (status)
```

### 40. settlements

Settlement records for investor payouts.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| investor_profile_id | UUID             | FK -> investor_profiles.id, NOT NULL |
| profit_calculation_id | UUID           | FK -> profit_calculations.id, NOT NULL |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'           |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | APPROVED | PROCESSING  |
|                     |                  | | COMPLETED | FAILED               |
| payment_method      | ENUM             | NULLABLE                           |
|                     |                  |   CRYPTO | BANK_TRANSFER           |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                           |
| payment_reference   | VARCHAR(255)     | NULLABLE                           |
| approved_by         | UUID             | FK -> users.id, NULLABLE           |
| approved_at         | TIMESTAMPTZ      | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| completed_at        | TIMESTAMPTZ      | NULLABLE                           |
+---------------------+------------------+------------------------------------+

Indexes:
  - settlements_deal_id_idx ON (deal_id)
  - settlements_investor_profile_id_idx ON (investor_profile_id)
  - settlements_profit_calculation_id_idx ON (profit_calculation_id)
  - settlements_status_idx ON (status)
```

### 41. withdrawals

Withdrawal requests from investors.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| investor_profile_id | UUID             | FK -> investor_profiles.id, NOT NULL |
| amount              | DECIMAL(15,2)    | NOT NULL, CHECK (> 0)             |
| currency            | VARCHAR(3)       | NOT NULL, DEFAULT 'USD'           |
| method              | ENUM             | NOT NULL                           |
|                     |                  |   BANK_TRANSFER | CRYPTO           |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'        |
|                     |                  |   PENDING | APPROVED | PROCESSING  |
|                     |                  | | COMPLETED | REJECTED              |
| bank_name           | VARCHAR(100)     | NULLABLE                           |
| bank_account_number | VARCHAR(50)      | NULLABLE (encrypted)              |
| bank_routing_number | VARCHAR(50)      | NULLABLE (encrypted)              |
| crypto_address      | VARCHAR(42)      | NULLABLE                           |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                           |
| rejection_reason    | TEXT             | NULLABLE                           |
| approved_by         | UUID             | FK -> users.id, NULLABLE           |
| approved_at         | TIMESTAMPTZ      | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| completed_at        | TIMESTAMPTZ      | NULLABLE                           |
+---------------------+------------------+------------------------------------+

Indexes:
  - withdrawals_investor_profile_id_idx ON (investor_profile_id)
  - withdrawals_status_idx ON (status)
```

### 42. blockchain_transactions

Blockchain transaction records.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NULLABLE           |
| tx_hash             | VARCHAR(66)      | UNIQUE, NOT NULL                  |
| from_address        | VARCHAR(42)      | NOT NULL                          |
| to_address          | VARCHAR(42)      | NOT NULL                          |
| value               | VARCHAR(78)      | DEFAULT '0' (wei string)          |
| gas_limit           | BIGINT           | NULLABLE                          |
| gas_used            | BIGINT           | NULLABLE                          |
| gas_price           | VARCHAR(20)      | NULLABLE                          |
| nonce               | BIGINT           | NULLABLE                          |
| block_number        | BIGINT           | NULLABLE                          |
| block_hash          | VARCHAR(66)      | NULLABLE                          |
| status              | ENUM             | NOT NULL, DEFAULT 'PENDING'       |
|                     |                  |   PENDING | SUBMITTED | CONFIRMED  |
|                     |                  | | FAILED | DROPPED                  |
| confirmations       | INTEGER          | DEFAULT 0                         |
| error_message       | TEXT             | NULLABLE                          |
| network             | VARCHAR(20)      | NOT NULL, DEFAULT 'sepolia'       |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()           |
| updated_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()           |
| confirmed_at        | TIMESTAMPTZ      | NULLABLE                          |
+---------------------+------------------+------------------------------------+

Indexes:
  - blockchain_transactions_tx_hash_idx UNIQUE ON (tx_hash)
  - blockchain_transactions_deal_id_idx ON (deal_id)
  - blockchain_transactions_status_idx ON (status)
  - blockchain_transactions_block_number_idx ON (block_number)
  - blockchain_transactions_created_at_idx ON (created_at)
```

### 43. blockchain_events

Indexer events from the blockchain.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| contract_address    | VARCHAR(42)      | NOT NULL                          |
| event_name          | VARCHAR(100)     | NOT NULL                          |
| block_number        | BIGINT           | NOT NULL                          |
| block_hash          | VARCHAR(66)      | NOT NULL                          |
| tx_hash             | VARCHAR(66)      | NOT NULL                          |
| log_index           | INTEGER          | NOT NULL                          |
| event_data          | JSONB            | NOT NULL                          |
| processed           | BOOLEAN          | DEFAULT FALSE                      |
| processed_at        | TIMESTAMPTZ      | NULLABLE                           |
| processing_error    | TEXT             | NULLABLE                           |
| network             | VARCHAR(20)      | NOT NULL, DEFAULT 'sepolia'       |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - blockchain_events_contract_address_idx ON (contract_address)
  - blockchain_events_event_name_idx ON (event_name)
  - blockchain_events_block_number_idx ON (block_number)
  - blockchain_events_processed_idx ON (processed)
  - blockchain_events_tx_hash_log_idx UNIQUE ON (tx_hash, log_index)
```

### 44. smart_contracts

Deployed smart contract records.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| name                | VARCHAR(100)     | NOT NULL                          |
| address             | VARCHAR(42)      | NOT NULL                          |
| network             | VARCHAR(20)      | NOT NULL                          |
| deployer_address    | VARCHAR(42)      | NOT NULL                          |
| deployment_tx_hash  | VARCHAR(66)      | NOT NULL                          |
| implementation_address | VARCHAR(42)   | NULLABLE (proxy pattern)          |
| version             | VARCHAR(20)      | NULLABLE                          |
| abi                 | JSONB            | NOT NULL                          |
| bytecode            | TEXT             | NULLABLE                          |
| deployed_at         | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - smart_contracts_address_network_idx UNIQUE ON (address, network)
  - smart_contracts_name_idx ON (name)
```

### 45. oracle_attestations

Oracle data attestations for off-chain verification.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| deal_id             | UUID             | FK -> deals.id, NOT NULL           |
| attester_id         | UUID             | FK -> users.id, NOT NULL           |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   HARVEST | REVENUE | EXPENSE |     |
|                     |                  |   MILESTONE | OTHER                 |
| data_hash           | VARCHAR(66)      | NOT NULL                          |
| attested_data       | JSONB            | NOT NULL                          |
| blockchain_tx_hash  | VARCHAR(66)      | NULLABLE                          |
| is_confirmed        | BOOLEAN          | DEFAULT FALSE                      |
| confirmed_at        | TIMESTAMPTZ      | NULLABLE                           |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - oracle_attestations_deal_id_idx ON (deal_id)
  - oracle_attestations_attester_id_idx ON (attester_id)
  - oracle_attestations_type_idx ON (type)
  - oracle_attestations_data_hash_idx ON (data_hash)
```

### 46. notifications

User notifications.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| user_id             | UUID             | FK -> users.id, NOT NULL           |
| type                | ENUM             | NOT NULL                           |
|                     |                  |   INVESTMENT | PROFIT | DEAL |      |
|                     |                  |   PAYMENT | KYC | VERIFICATION |   |
|                     |                  |   MILESTONE | SYSTEM               |
| title               | VARCHAR(255)     | NOT NULL                           |
| body                | TEXT             | NOT NULL                           |
| data                | JSONB            | NULLABLE (deep link, IDs, etc.)    |
| channel             | ENUM             | NOT NULL, DEFAULT 'IN_APP'         |
|                     |                  |   IN_APP | EMAIL | SMS | PUSH     |
| is_read             | BOOLEAN          | DEFAULT FALSE                      |
| read_at             | TIMESTAMPTZ      | NULLABLE                           |
| sent_at             | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - notifications_user_id_idx ON (user_id)
  - notifications_user_read_idx ON (user_id, is_read)
  - notifications_created_at_idx ON (created_at)
  - notifications_type_idx ON (type)
```

### 47. audit_logs

Audit trail for all system actions.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| user_id             | UUID             | FK -> users.id, NULLABLE (system)  |
| action              | VARCHAR(100)     | NOT NULL                          |
| resource            | VARCHAR(50)      | NOT NULL                          |
| resource_id         | UUID             | NULLABLE                          |
| old_values          | JSONB            | NULLABLE                          |
| new_values          | JSONB            | NULLABLE                          |
| ip_address          | INET             | NULLABLE                          |
| user_agent          | VARCHAR(500)     | NULLABLE                          |
| request_id          | VARCHAR(50)      | NULLABLE (correlation ID)         |
| metadata            | JSONB            | NULLABLE                          |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - audit_logs_user_id_idx ON (user_id)
  - audit_logs_action_idx ON (action)
  - audit_logs_resource_idx ON (resource)
  - audit_logs_resource_id_idx ON (resource_id)
  - audit_logs_created_at_idx ON (created_at)
```

### 48. idempotency_keys

Idempotency keys for safe request retries.

```
+---------------------+------------------+------------------------------------+
| Column              | Type             | Constraints                        |
+---------------------+------------------+------------------------------------+
| id                  | UUID             | PK, DEFAULT uuid_generate_v4()     |
| key                 | VARCHAR(255)     | UNIQUE, NOT NULL                   |
| user_id             | UUID             | FK -> users.id, NOT NULL           |
| endpoint            | VARCHAR(255)     | NOT NULL                          |
| response_status     | INTEGER          | NOT NULL                          |
| response_body       | JSONB            | NOT NULL                          |
| expires_at          | TIMESTAMPTZ      | NOT NULL                          |
| created_at          | TIMESTAMPTZ      | NOT NULL, DEFAULT NOW()            |
+---------------------+------------------+------------------------------------+

Indexes:
  - idempotency_keys_key_idx UNIQUE ON (key)
  - idempotency_keys_user_endpoint_idx ON (user_id, endpoint)
  - idempotency_keys_expires_at_idx ON (expires_at) -- for TTL cleanup
```

---

## Summary Statistics

| Category | Table Count |
|---|---|
| Authentication & RBAC | 5 (users, roles, permissions, user_roles, role_permissions) |
| Profiles | 2 (farmer_profiles, investor_profiles) |
| Assets | 3 (farms, farm_documents, farm_crop) |
| Crop Catalog | 3 (crops, crop_varieties, growing_seasons) |
| Projects | 3 (agricultural_projects, project_documents, project_milestones) |
| Deals | 3 (deals, deal_terms, deal_participants) |
| Investments | 3 (investments, investment_units, investment_transactions) |
| Payments | 3 (payments, payment_attempts, payment_webhooks) |
| Wallets | 2 (wallets, wallet_transactions) |
| Financial Ledger | 3 (accounts, ledger_entries, ledger_transactions) |
| Escrow | 2 (escrow_accounts, escrow_transactions) |
| Operations | 5 (expenses, expense_documents, harvests, sales, revenues) |
| Profit & Settlement | 4 (profit_calculations, profit_distributions, settlements, withdrawals) |
| Blockchain | 4 (blockchain_transactions, blockchain_events, smart_contracts, oracle_attestations) |
| System | 3 (notifications, audit_logs, idempotency_keys) |
| **Total** | **48 tables** |
