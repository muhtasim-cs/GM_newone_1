# Deployment Architecture

## Overview

This document covers the deployment architecture across development, staging, and production environments, including CI/CD pipelines, infrastructure configuration, scaling strategies, and disaster recovery.

---

## Environment Overview

```
ENVIRONMENT TOPOLOGY
=====================

Development          Staging              Production
+-----------+        +-----------+        +-----------+
| Local     |        | AWS ECS   |        | AWS ECS   |
| Docker    |        | Fargate   |        | Fargate   |
| Compose   |        |           |        |           |
+-----------+        +-----------+        +-----------+
     |                    |                    |
     v                    v                    v
+-----------+        +-----------+        +-----------+
| Hardhat   |        | Sepolia   |        | Polygon   |
| Local     |        | Testnet   |        | Mainnet   |
+-----------+        +-----------+        +-----------+
     |                    |                    |
     v                    v                    v
+-----------+        +-----------+        +-----------+
| Local     |        | AWS RDS   |        | AWS RDS   |
| PostgreSQL|        | db.t3.med |        | db.r6g.lg |
+-----------+        +-----------+        +-----------+
     |                    |                    |
     v                    v                    v
+-----------+        +-----------+        +-----------+
| Local     |        | AWS       |        | AWS       |
| Redis     |        | ElastiCache|       | ElastiCache|
+-----------+        +-----------+        +-----------+
```

---

## Development Environment

### Docker Compose Configuration

```
DEVELOPMENT DOCKER COMPOSE
============================

Services:
  web:
    Build: apps/web (Next.js)
    Port: 3000
    Volume mount: ./apps/web/src:/app/src (hot reload)
    Environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
      NEXT_PUBLIC_CHAIN_ID: 31337

  api:
    Build: apps/api (NestJS)
    Port: 3001
    Volume mount: ./apps/api/src:/app/src (hot reload)
    Environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/agri_dev
      REDIS_URL: redis://redis:6379
      JWT_PRIVATE_KEY_FILE: /app/keys/private.pem
      CHAIN_ID: 31337
      RPC_URL: http://hardhat:8545
      NODE_ENV: development

  db:
    Image: postgres:15-alpine
    Port: 5432
    Environment:
      POSTGRES_DB: agri_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    Volumes:
      - pgdata:/var/lib/postgresql/data
      - ./prisma/migrations:/docker-entrypoint-initdb.d

  redis:
    Image: redis:7-alpine
    Port: 6379

  hardhat:
    Build: ./contracts (Foundry)
    Port: 8545
    Command: anvil --host 0.0.0.0
    Volumes:
      - ./contracts:/contracts

  bull-board:
    Image: bullboard/bull-board
    Port: 3002
    Environment:
      BULL_QUEUES: email,blockchain,payment,settlement,notification,audit

  mailhog:
    Image: mailhog/mailhog
    Port: 1025 (SMTP), 8025 (Web UI)

  minio:
    Image: minio/minio
    Port: 9000 (API), 9001 (Console)
    Command: server /data --console-address ":9001"
    Environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

Volumes:
  pgdata:
```

### Local Development Setup

```
LOCAL DEVELOPMENT SETUP
=========================

Prerequisites:
  - Node.js 20+
  - Docker & Docker Compose
  - pnpm 8+
  - Foundry (forge, cast)

Setup Steps:
  1. Clone repository
  2. Copy .env.example to .env
  3. Run: pnpm install
  4. Run: docker compose up -d
  5. Run: pnpm prisma migrate dev
  6. Run: pnpm prisma db seed
  7. Deploy contracts: cd contracts && forge script script/Deploy.s.sol
  8. Run: pnpm dev

Available URLs:
  Frontend:    http://localhost:3000
  API:         http://localhost:3001
  Swagger:     http://localhost:3001/api/docs
  Bull Board:  http://localhost:3002
  MailHog:     http://localhost:8025
  MinIO:       http://localhost:9001
  Hardhat:     http://localhost:8545
```

---

## Staging Environment

```
STAGING ARCHITECTURE
=====================

AWS ECS Fargate:
  Service: agri-staging-web
    Tasks: 1 (fixed)
    CPU: 0.5 vCPU
    Memory: 1 GB

  Service: agri-staging-api
    Tasks: 1 (fixed)
    CPU: 0.5 vCPU
    Memory: 1 GB

  Service: agri-staging-worker
    Tasks: 1 (fixed)
    CPU: 0.25 vCPU
    Memory: 512 MB

AWS RDS:
  Instance: db.t3.medium
  Storage: 20 GB GP3
  Backup: Daily, 7-day retention
  Multi-AZ: No (staging)

AWS ElastiCache:
  Instance: cache.t3.small
  Redis 7.x

CloudFront:
  Origin: ALB
  PriceClass: PriceClass_100
  SSL: ACM certificate

Blockchain:
  Network: Sepolia Testnet
  RPC: Alchemy (separate API key)

Domain: staging.agriplatform.com
SSL: ACM (auto-renewed)
```

---

## Production Environment

```
PRODUCTION ARCHITECTURE
========================

+-------------------------------------------------------+
|                    Cloudflare                          |
|  CDN | WAF | DDoS | Edge Caching | SSL               |
+-------------------------------------------------------+
         |
+--------v---------------------------------------------+
|                 Application Load Balancer             |
|  SSL Termination | Path-based Routing | Health Checks |
+--------+--------+--------+--------+------------------+
         |                 |                |
+--------v------+  +------v------+  +------v------+
| ECS: web      |  | ECS: api    |  | ECS: worker |
| (Next.js)     |  | (NestJS)    |  | (BullMQ)    |
|               |  |             |  |             |
| Tasks: 2-6    |  | Tasks: 2-8  |  | Tasks: 1-3  |
| CPU: 1 vCPU   |  | CPU: 2 vCPU |  | CPU: 0.5 vCPU|
| Mem: 2 GB     |  | Mem: 4 GB   |  | Mem: 1 GB   |
+--------+------+  +------+------+  +------+------+
         |                 |                |
         +--------+--------+--------+-------+
                  |                 |
         +--------v------+  +------v------+
         | RDS PostgreSQL |  | ElastiCache |
         | db.r6g.large   |  | cache.r6g.lg|
         | Multi-AZ       |  | Cluster     |
         | Read Replica   |  | Mode        |
         | 100 GB GP3     |  | 10 GB       |
         +----------------+  +-------------+
                  |
         +--------v------+
         | S3 / R2        |
         | Document Store |
         | 50 GB          |
         +----------------+

Blockchain:
  Network: Polygon Mainnet
  RPC: Alchemy (production key) + Infura (fallback)
  Chain ID: 137

Monitoring:
  Sentry (errors)
  Prometheus + Grafana (metrics)
  Cloudflare Analytics (traffic)
  UptimeRobot (uptime)
```

### Auto-Scaling Configuration

```
AUTO-SCALING RULES
====================

Web Service:
  Min Tasks: 2
  Max Tasks: 6
  Target CPU: 70%
  Target Memory: 75%
  Scale-up cooldown: 60s
  Scale-down cooldown: 300s

API Service:
  Min Tasks: 2
  Max Tasks: 8
  Target CPU: 65%
  Target Memory: 70%
  Scale-up cooldown: 60s
  Scale-down cooldown: 300s

Worker Service:
  Min Tasks: 1
  Max Tasks: 3
  Target CPU: 80%
  Scale-up cooldown: 120s
  Scale-down cooldown: 300s

Database:
  Min: db.r6g.large (2 vCPU, 16 GB)
  Max: db.r6g.2xlarge (8 vCPU, 64 GB)
  Auto-scaling: Storage-based (80% threshold)
  Read replica: Auto-added at 70% read capacity
```

---

## CI/CD Pipeline

```
CI/CD PIPELINE
===============

Trigger: Push to main (production), Push to staging (staging)

+--------+    +--------+    +--------+    +--------+    +--------+
| Lint   |--->| Test   |--->| Build  |--->| Push   |--->| Deploy |
|        |    |        |    |        |    | Image  |    |        |
+--------+    +--------+    +--------+    +--------+    +--------+

Stage 1: Lint (2 min)
  - ESLint (apps/web, apps/api)
  - Prettier check
  - TypeScript type checking
  - Solidity linting (contracts/)

Stage 2: Test (5 min)
  - Unit tests (apps/api): Jest
  - Unit tests (apps/web): Jest + React Testing Library
  - Integration tests (apps/api): Jest + Testcontainers
  - Smart contract tests (contracts/): Foundry forge test
  - Security scan: npm audit, snyk test

Stage 3: Build (3 min)
  - Build Next.js (output: standalone)
  - Build NestJS (output: dist/)
  - Build Docker images
  - Tag with commit SHA

Stage 4: Push (2 min)
  - Push to ECR (AWS Elastic Container Registry)
  - Image scanning (Trivy)
  - Sign image (cosign)

Stage 5: Deploy
  Staging:
    - Update ECS task definition
    - Rolling deploy (10% at a time)
    - Health check validation
    - Smoke tests

  Production:
    - Blue-green deployment
    - Traffic shifting (10% -> 50% -> 100%)
    - Automated rollback on health check failure
    - Post-deploy smoke tests
    - Notify Slack

Pipeline Secrets:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - ALCHEMY_API_KEY
  - STRIPE_SECRET_KEY
  - SENTRY_AUTH_TOKEN
```

---

## Infrastructure Diagram

```
PRODUCTION INFRASTRUCTURE
===========================

+-------------------------------------------------------+
|                    AWS Account                         |
|                                                        |
|  +--------------------------------------------------+ |
|  | VPC: 10.0.0.0/16                                  | |
|  |                                                   | |
|  |  +----------------------------------------------+| |
|  |  | Public Subnets                               || |
|  |  | 10.0.1.0/24 (AZ-a)                           || |
|  |  | 10.0.2.0/24 (AZ-b)                           || |
|  |  | 10.0.3.0/24 (AZ-c)                           || |
|  |  |                                               || |
|  |  | ALB | NAT Gateway | Bastion Host             || |
|  |  +----------------------------------------------+| |
|  |                                                   | |
|  |  +----------------------------------------------+| |
|  |  | Private Subnets (Application)                 || |
|  |  | 10.0.10.0/24 (AZ-a)                          || |
|  |  | 10.0.11.0/24 (AZ-b)                          || |
|  |  | 10.0.12.0/24 (AZ-c)                          || |
|  |  |                                               || |
|  |  | ECS Fargate: web, api, worker                 || |
|  |  | CloudWatch Agent                             || |
|  |  +----------------------------------------------+| |
|  |                                                   | |
|  |  +----------------------------------------------+| |
|  |  | Private Subnets (Data)                        || |
|  |  | 10.0.20.0/24 (AZ-a)                          || |
|  |  | 10.0.21.0/24 (AZ-b)                          || |
|  |  |                                               || |
|  |  | RDS PostgreSQL (Multi-AZ)                     || |
|  |  | ElastiCache Redis (Cluster)                   || |
|  |  | S3 VPC Endpoint                              || |
|  |  +----------------------------------------------+| |
|  +--------------------------------------------------+ |
|                                                        |
|  +--------------------------------------------------+ |
|  | Other AWS Services                               | |
|  | - CloudFront (CDN)                               | |
|  | - Route53 (DNS)                                  | |
|  | - ACM (SSL Certificates)                         | |
|  | - Secrets Manager                                | |
|  | - KMS (Encryption Keys)                          | |
|  | - CloudWatch (Logs, Alarms)                      | |
|  | - ECR (Container Registry)                       | |
|  | - S3 (Backups, Static Assets)                    | |
|  +--------------------------------------------------+ |
+-------------------------------------------------------+
```

---

## Environment Configuration

```
ENVIRONMENT VARIABLES
=======================

Development:
  NODE_ENV=development
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agri_dev
  REDIS_URL=redis://localhost:6379
  JWT_PRIVATE_KEY_PATH=./keys/private.pem
  JWT_PUBLIC_KEY_PATH=./keys/public.pem
  CHAIN_ID=31337
  RPC_URL=http://localhost:8545
  S3_ENDPOINT=http://localhost:9000
  S3_BUCKET=agri-dev-documents
  STRIPE_SECRET_KEY=sk_test_...
  SENTRY_DSN=
  LOG_LEVEL=debug

Staging:
  NODE_ENV=staging
  DATABASE_URL=postgresql://...@rds-staging:5432/agri_staging
  REDIS_URL=redis://...@elasticache-staging:6379
  JWT_PRIVATE_KEY_ARN=arn:aws:secretsmanager:...
  JWT_PUBLIC_KEY_ARN=arn:aws:secretsmanager:...
  CHAIN_ID=11155111
  RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
  S3_BUCKET=agri-staging-documents
  STRIPE_SECRET_KEY=sk_test_...
  SENTRY_DSN=https://...@sentry.io/...
  LOG_LEVEL=info

Production:
  NODE_ENV=production
  DATABASE_URL=postgresql://...@rds-prod:5432/agri_production
  REDIS_URL=redis://...@elasticache-prod:6379
  JWT_PRIVATE_KEY_ARN=arn:aws:secretsmanager:...
  JWT_PUBLIC_KEY_ARN=arn:aws:secretsmanager:...
  CHAIN_ID=137
  RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/...
  RPC_FALLBACK_URL=https://polygon-mainnet.infura.io/v3/...
  S3_BUCKET=agri-production-documents
  STRIPE_SECRET_KEY=sk_live_...
  SENTRY_DSN=https://...@sentry.io/...
  LOG_LEVEL=warn
```

---

## Scaling Strategy

```
SCALING STRATEGY
==================

Horizontal Scaling:
  Web: Next.js stateless (CDN-cached static, SSR stateless)
  API: NestJS stateless (JWT auth, no session state)
  Worker: BullMQ distributed (Redis-backed, multiple workers)

Vertical Scaling:
  Database: Upgrade instance type as needed
  Redis: Enable cluster mode at scale
  Blockchain: Multiple RPC providers, load balance

Database Scaling:
  Read replicas for dashboards and reports
  Connection pooling via PgBouncer
  Query optimization (indexes, query plans)
  Table partitioning for large tables (audit_logs, blockchain_events)
  Archive old data (> 2 years) to cold storage

Cache Strategy:
  Redis for hot data (5-min TTL)
  CDN for static assets (1hr TTL)
  API response caching (5-min TTL for public endpoints)
  Stale-while-revalidate pattern for deal listings

Queue Scaling:
  Horizontal: Add worker instances
  Vertical: Increase concurrency per worker
  Priority queues for critical operations (payments, blockchain)
```

---

## Backup and Disaster Recovery

```
BACKUP STRATEGY
================

PostgreSQL:
  Automated Backups:
    - Daily snapshots (30-day retention)
    - Transaction log archival (continuous)
    - Cross-region backup replication
  Manual Backups:
    - Before deployments
    - Before migrations
    - On-demand via AWS console
  Recovery:
    - Point-in-time recovery (up to 35 days)
    - Restore to new instance (< 15 min)
    - Cross-region restore (< 1 hour)

Redis:
  - Daily snapshots to S3
  - AOF (Append-Only File) enabled
  - Recovery: Restore from snapshot + replay AOF

S3 / R2:
  - Versioning enabled
  - Cross-region replication
  - Lifecycle policies (IA after 90d, Glacier after 1yr)

Blockchain:
  - State is on-chain (inherent backup)
  - DB state can be reconstructed from chain events
  - Smart contract ABIs and bytecode stored in repo

Disaster Recovery:
  RTO (Recovery Time Objective): 1 hour
  RPO (Recovery Point Objective): 1 hour (max data loss)

  DR Procedure:
    1. Detect failure (monitoring alerts)
    2. Assess impact (< 15 min)
    3. Initiate recovery (< 30 min)
    4. Restore from backup
    5. Verify data integrity
    6. Update DNS if region failover
    7. Notify affected users
    8. Post-incident review
```

---

## Monitoring and Alerting

```
ALERTING CONFIGURATION
=======================

Critical (Page immediately):
  - API error rate > 5% (5 min window)
  - Database connection pool exhausted
  - Blockchain transaction failure rate > 10%
  - Payment processing failure rate > 5%
  - Service health check failures (> 2 consecutive)
  - Memory usage > 90%

Warning (Slack notification):
  - API response time p95 > 2s
  - Queue depth > 100
  - Database CPU > 80%
  - Redis memory > 80%
  - Blockchain sync lag > 100 blocks
  - Disk usage > 80%

Info (Dashboard only):
  - Deployment completed
  - Reconciliation completed
  - Daily financial summary
  - Weekly metrics report
```
