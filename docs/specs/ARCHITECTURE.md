# TruckIQ AI - System Architecture

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Data Flow](#data-flow)
5. [Deployment Architecture](#deployment-architecture)
6. [Security Architecture](#security-architecture)
7. [API Design](#api-design)
8. [Type Safety Strategy](#type-safety-strategy)

---

## Architecture Overview

TruckIQ AI follows a modern, serverless-first architecture designed for:
- **Scalability**: Handle 10,000+ vehicles across 100+ tenants
- **Security**: Multi-tenant isolation with row-level security
- **Reliability**: 99.5% uptime with graceful degradation
- **Developer Experience**: Type-safe end-to-end with OpenAPI generation

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TRUCKIQ AI PLATFORM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Next.js    │    │   Next.js    │    │   Mobile     │                  │
│  │  Dashboard   │    │  Admin UI    │    │    (PWA)     │                  │
│  │  (Dealer)    │    │  (Internal)  │    │   (Future)   │                  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                   │                           │
│         └───────────────────┼───────────────────┘                           │
│                             │                                               │
│                             ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API LAYER (Next.js API Routes)                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │  Vehicles   │  │   Alerts    │  │ Predictions │  │  Reports   │  │   │
│  │  │   API       │  │    API      │  │     API     │  │    API     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                             │                                               │
│         ┌───────────────────┼───────────────────┐                           │
│         │                   │                   │                           │
│         ▼                   ▼                   ▼                           │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐                    │
│  │   Clerk    │      │ PostgreSQL │      │   Redis    │                    │
│  │   Auth     │      │  (Render)  │      │  (Cache)   │                    │
│  └────────────┘      └────────────┘      └────────────┘                    │
│                             │                                               │
│                             ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     BACKGROUND SERVICES                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │   │
│  │  │ TruckTech+  │  │     AI      │  │   Alert     │                  │   │
│  │  │   Sync      │  │  Predictor  │  │  Processor  │                  │   │
│  │  │  (Python)   │  │  (Python)   │  │  (Node.js)  │                  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────┐
              │      TruckTech+          │
              │   (PACCAR Solutions)     │
              │    External Portal       │
              └──────────────────────────┘
```

---

## Technology Stack

### Frontend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14+ (App Router) | Server components, API routes, optimal DX |
| **UI Components** | shadcn/ui | Accessible, customizable, Tailwind-native |
| **Styling** | Tailwind CSS | Utility-first, consistent design system |
| **State Management** | TanStack Query | Server state, caching, optimistic updates |
| **Forms** | React Hook Form + Zod | Type-safe validation |
| **Charts** | Recharts | React-native, responsive charting |
| **Tables** | TanStack Table | Headless, sortable, filterable |

### Backend

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **API** | Next.js API Routes | Unified deployment, type sharing |
| **Database** | PostgreSQL (Render) | RLS support, JSON, robust |
| **ORM** | Prisma | Type-safe, migrations, RLS integration |
| **Caching** | Redis (Upstash) | Session cache, rate limiting |
| **Auth** | Clerk | Managed auth, multi-tenant, webhooks |
| **Background Jobs** | Render Cron + Workers | Scheduled sync, async processing |

### Data Integration

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Scraper** | Python + Playwright | Browser automation, MFA handling |
| **Anti-Detection** | Camoufox | Realistic browser fingerprints |
| **Session Mgmt** | Persistent browser contexts | Reduce MFA frequency |
| **TOTP** | Python TOTP library | Automated 2FA code generation |

### AI/ML Pipeline

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **ML Framework** | scikit-learn + XGBoost | Survival analysis, gradient boosting |
| **Feature Store** | PostgreSQL + Redis | Real-time feature serving |
| **Model Serving** | FastAPI (Python) | Low-latency inference |
| **Training Pipeline** | GitHub Actions + Manual | Batch retraining |

### Infrastructure

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Hosting** | Render | Simple, PostgreSQL-native, cron |
| **CDN** | Cloudflare (optional) | Edge caching, DDoS protection |
| **Monitoring** | Sentry | Error tracking, performance |
| **Logging** | Render Logs + Datadog | Centralized logging |

---

## System Components

### Component 1: Web Application (Next.js)

```
apps/web/
├── app/
│   ├── (auth)/                 # Auth pages (Clerk)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── layout.tsx          # Dashboard shell with nav
│   │   ├── page.tsx            # Home/overview
│   │   ├── vehicles/
│   │   │   ├── page.tsx        # Vehicle list
│   │   │   └── [id]/page.tsx   # Vehicle detail
│   │   ├── groups/
│   │   ├── alerts/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/                    # API routes
│   │   ├── vehicles/
│   │   ├── alerts/
│   │   ├── predictions/
│   │   └── webhooks/
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn components
│   ├── dashboard/              # Dashboard-specific
│   ├── vehicles/               # Vehicle-specific
│   └── shared/                 # Shared components
├── lib/
│   ├── api/                    # API client & generated types
│   ├── auth/                   # Clerk utilities
│   ├── db/                     # Prisma client
│   └── utils/                  # Helpers
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### Component 2: Data Sync Service (Python)

```
services/sync/
├── src/
│   ├── trucktechplus/
│   │   ├── client.py           # TruckTech+ scraper
│   │   ├── browser.py          # Browser management
│   │   ├── auth.py             # MFA/TOTP handling
│   │   └── extractors.py       # Data extraction
│   ├── database/
│   │   ├── models.py           # SQLAlchemy models
│   │   └── persistence.py      # Data writing
│   ├── batch/
│   │   ├── manager.py          # Batch processing
│   │   └── scheduler.py        # Job scheduling
│   └── utils/
│       ├── alerting.py         # Failure alerts
│       └── logging.py          # Structured logging
├── config/
│   ├── tenants/                # Per-tenant credentials
│   └── settings.yaml           # Global settings
├── tests/
└── requirements.txt
```

### Component 3: AI Prediction Service (Python)

```
services/predictor/
├── src/
│   ├── models/
│   │   ├── survival.py         # Survival analysis model
│   │   ├── anomaly.py          # Anomaly detection
│   │   └── risk_scorer.py      # Composite risk scoring
│   ├── features/
│   │   ├── extractor.py        # Feature engineering
│   │   └── store.py            # Feature caching
│   ├── api/
│   │   └── server.py           # FastAPI inference API
│   └── training/
│       ├── pipeline.py         # Training workflow
│       └── evaluation.py       # Model validation
├── models/                     # Serialized model artifacts
├── data/                       # Training data (gitignored)
└── notebooks/                  # Jupyter experimentation
```

---

## Data Flow

### Flow 1: TruckTech+ Data Sync

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TRUCKTECH+ SYNC FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────┐         ┌───────────┐         ┌───────────┐
  │  Render   │ trigger │  Python   │ scrape  │TruckTech+ │
  │   Cron    │────────▶│  Sync     │────────▶│  Portal   │
  │ (4 hours) │         │  Service  │         │           │
  └───────────┘         └─────┬─────┘         └───────────┘
                              │
                              │ vehicles, fault codes,
                              │ odometer, location
                              ▼
                        ┌───────────┐
                        │PostgreSQL │
                        │           │
                        │ vehicles  │
                        │ fault_codes│
                        │ sync_logs │
                        └─────┬─────┘
                              │
                              │ trigger
                              ▼
                        ┌───────────┐
                        │Prediction │
                        │  Service  │
                        │           │
                        │ Calculate │
                        │risk scores│
                        └─────┬─────┘
                              │
                              │ update
                              ▼
                        ┌───────────┐
                        │PostgreSQL │
                        │           │
                        │predictions│
                        │           │
                        └─────┬─────┘
                              │
                              │ check thresholds
                              ▼
                        ┌───────────┐
                        │  Alert    │
                        │ Processor │
                        │           │
                        │ Generate  │
                        │  alerts   │
                        └───────────┘
```

### Flow 2: Dashboard Request

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD REQUEST FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌───────────┐         ┌───────────┐         ┌───────────┐
  │  Browser  │ request │  Next.js  │ verify  │   Clerk   │
  │           │────────▶│  Server   │────────▶│   Auth    │
  │           │         │           │         │           │
  └───────────┘         └─────┬─────┘         └───────────┘
                              │
                              │ JWT claims with
                              │ tenant_id, role
                              ▼
                        ┌───────────┐
                        │  Prisma   │
                        │  Query    │
                        │           │
                        │ + RLS     │
                        │ WHERE     │
                        │ tenant_id │
                        └─────┬─────┘
                              │
                              ▼
                        ┌───────────┐
                        │PostgreSQL │
                        │           │
                        │ Filtered  │
                        │  Results  │
                        └─────┬─────┘
                              │
                              │ data + predictions
                              ▼
                        ┌───────────┐
                        │  React    │
                        │  Server   │
                        │ Component │
                        │           │
                        │  Render   │
                        └─────┬─────┘
                              │
                              │ HTML + RSC payload
                              ▼
                        ┌───────────┐
                        │  Browser  │
                        │           │
                        │ Dashboard │
                        │  Display  │
                        └───────────┘
```

---

## Deployment Architecture

### Render Deployment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RENDER DEPLOYMENT                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      WEB SERVICE: truckiq-web                        │   │
│  │  Type: Node.js                                                       │   │
│  │  Build: npm run build                                                │   │
│  │  Start: npm run start                                                │   │
│  │  Env: NODE_ENV, DATABASE_URL, CLERK_*, REDIS_URL                     │   │
│  │  Health: /api/health                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BACKGROUND WORKER: truckiq-sync                   │   │
│  │  Type: Python                                                        │   │
│  │  Build: pip install -r requirements.txt                              │   │
│  │  Start: python -m src.batch.scheduler run-once                       │   │
│  │  Cron: 0 */4 * * * (every 4 hours)                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PRIVATE SERVICE: truckiq-predictor                │   │
│  │  Type: Python (FastAPI)                                              │   │
│  │  Internal URL: predictor.internal:8000                               │   │
│  │  Start: uvicorn src.api.server:app                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      DATABASE: truckiq-db                            │   │
│  │  Type: PostgreSQL 15                                                 │   │
│  │  Plan: Starter ($7/mo) → Standard ($25/mo)                           │   │
│  │  Extensions: uuid-ossp, pgcrypto                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       REDIS: truckiq-cache                           │   │
│  │  Type: Upstash Redis (external)                                      │   │
│  │  Purpose: Session cache, rate limiting, feature cache                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/truckiq?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Redis Cache
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379

# TruckTech+ Credentials (per-tenant, stored encrypted)
# Managed via admin UI, not environment variables

# AI/ML Service
PREDICTOR_URL=http://predictor.internal:8000

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
ENABLE_PREDICTIONS=true
ENABLE_ALERTS=true
```

---

## Security Architecture

### Multi-Tenant Isolation

```sql
-- Row-Level Security (RLS) Example

-- Enable RLS on vehicles table
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see vehicles in their tenant
CREATE POLICY tenant_isolation_vehicles ON vehicles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Policy: Dealer admins can see customer fleet vehicles
CREATE POLICY dealer_view_customers ON vehicles
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT customer_tenant_id
      FROM dealer_customer_relationships
      WHERE dealer_tenant_id = current_setting('app.current_tenant_id')::uuid
    )
  );
```

### Authentication Flow

```
┌───────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User visits /sign-in                                          │
│     └─▶ Clerk handles authentication (email/password, social)     │
│                                                                   │
│  2. Clerk issues JWT with claims:                                 │
│     {                                                             │
│       "sub": "user_xxx",                                          │
│       "org_id": "org_xxx",        // Tenant ID                    │
│       "org_role": "admin",        // Role                         │
│       "org_permissions": ["vehicles:read", "alerts:manage"]       │
│     }                                                             │
│                                                                   │
│  3. Next.js middleware validates JWT on every request             │
│     └─▶ Extracts tenant_id, role, permissions                     │
│     └─▶ Sets session context for RLS                              │
│                                                                   │
│  4. API routes enforce permissions                                │
│     └─▶ Check role-based access before operations                 │
│     └─▶ Prisma queries automatically filtered by tenant           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### RBAC Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | All operations, all tenants, system config |
| **Dealer Admin** | Manage dealer + customer fleets, users, settings |
| **Fleet Admin** | Full access to own fleet data and users |
| **Service Manager** | View all data, manage alerts, create reports |
| **Technician** | View vehicles, update service records |
| **Viewer** | Read-only access to dashboards |

---

## API Design

### RESTful Endpoints

```yaml
# Vehicles API
GET    /api/vehicles                    # List vehicles (filtered by tenant)
GET    /api/vehicles/:id                # Get vehicle details
GET    /api/vehicles/:id/fault-codes    # Get fault code history
GET    /api/vehicles/:id/predictions    # Get AI predictions
PUT    /api/vehicles/:id                # Update vehicle metadata

# Alerts API
GET    /api/alerts                      # List alerts (filtered)
GET    /api/alerts/:id                  # Get alert details
PUT    /api/alerts/:id/acknowledge      # Acknowledge alert
PUT    /api/alerts/:id/resolve          # Resolve alert

# Groups API
GET    /api/groups                      # List vehicle groups
POST   /api/groups                      # Create group
GET    /api/groups/:id                  # Get group details with metrics
PUT    /api/groups/:id                  # Update group
DELETE /api/groups/:id                  # Delete group
POST   /api/groups/:id/vehicles         # Add vehicles to group

# Reports API
GET    /api/reports/fleet-health        # Fleet health summary
GET    /api/reports/maintenance-forecast# Upcoming maintenance
GET    /api/reports/fault-frequency     # Fault code analytics
POST   /api/reports/export              # Export report (PDF/CSV)

# Admin API (Super Admin only)
GET    /api/admin/tenants               # List all tenants
POST   /api/admin/tenants               # Create tenant
GET    /api/admin/sync-status           # Data sync health
POST   /api/admin/sync/trigger          # Manual sync trigger
```

### Response Format

```typescript
// Standard API response
interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Error response
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Example: GET /api/vehicles
{
  "data": [
    {
      "id": "uuid",
      "vin": "1XKAD49X0NJ123456",
      "unitNumber": "T-2045",
      "year": 2023,
      "make": "Kenworth",
      "model": "T680",
      "currentOdometer": 145678,
      "healthScore": 87,
      "activeFaultCount": 2,
      "riskLevel": "medium",
      "lastSyncAt": "2026-01-21T10:30:00Z"
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Type Safety Strategy

### Backend-First Type Generation

Following the pattern from CLAUDE.md, we ensure frontend/backend type alignment:

```
Backend DTOs (Prisma) → OpenAPI Spec → Generated TypeScript → Frontend
```

### Implementation

```typescript
// 1. Prisma generates base types
// prisma/schema.prisma
model Vehicle {
  id              String   @id @default(uuid())
  vin             String   @unique
  unitNumber      String?
  year            Int
  make            String
  model           String
  currentOdometer Int
  tenantId        String
  // ...
}

// 2. API route defines response DTO
// app/api/vehicles/route.ts
import { z } from 'zod';

export const VehicleResponseSchema = z.object({
  id: z.string().uuid(),
  vin: z.string().length(17),
  unitNumber: z.string().nullable(),
  year: z.number().int(),
  make: z.string(),
  model: z.string(),
  currentOdometer: z.number().int(),
  healthScore: z.number().min(0).max(100),
  activeFaultCount: z.number().int(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  lastSyncAt: z.string().datetime(),
});

export type VehicleResponse = z.infer<typeof VehicleResponseSchema>;

// 3. Frontend imports types directly
// components/vehicles/VehicleCard.tsx
import type { VehicleResponse } from '@/lib/api/types';

export function VehicleCard({ vehicle }: { vehicle: VehicleResponse }) {
  // Full type safety
}
```

### Type Generation Scripts

```json
// package.json
{
  "scripts": {
    "generate:api-types": "npx openapi-typescript http://localhost:3000/api/openapi.json -o lib/api/generated/api-types.ts",
    "verify:api-types": "bash ./scripts/verify-api-types.sh"
  }
}
```

### CI Verification

```yaml
# .github/workflows/ci.yml
- name: Verify API types
  run: npm run verify:api-types
```

This ensures any backend DTO changes are immediately reflected in frontend types, with CI failing if types drift.
