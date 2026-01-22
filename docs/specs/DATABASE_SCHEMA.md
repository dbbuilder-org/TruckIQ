# TruckIQ AI - Database Schema

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Overview

TruckIQ uses PostgreSQL with Prisma ORM, implementing Row-Level Security (RLS) for multi-tenant isolation. The schema is designed for:

- **Multi-tenancy**: Complete data isolation between tenants
- **Audit trails**: Track all changes with timestamps
- **Soft deletes**: Preserve data for compliance
- **Type safety**: Prisma-generated types for the frontend

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   tenants    │──────▶│    users     │       │   vehicles   │
│              │       │              │       │              │
│ id           │       │ id           │       │ id           │
│ name         │       │ clerk_id     │       │ vin          │
│ type         │       │ email        │       │ tenant_id ◀──┼─── FK to tenants
│ settings     │       │ tenant_id ◀──┼─── FK │ unit_number  │
└──────────────┘       │ role         │       │ year         │
       │               └──────────────┘       │ make         │
       │                                      │ model        │
       │                                      │ engine_*     │
       ▼                                      └──────┬───────┘
┌──────────────┐                                     │
│ dealer_      │                                     │
│ customer_    │                                     ▼
│ relationships│                              ┌──────────────┐
│              │                              │ fault_codes  │
│ dealer_id    │                              │              │
│ customer_id  │                              │ id           │
│              │                              │ vehicle_id ◀─┼─── FK
└──────────────┘                              │ spn          │
                                              │ fmi          │
                                              │ severity     │
                                              │ is_active    │
                                              └──────┬───────┘
                                                     │
┌──────────────┐       ┌──────────────┐              │
│ predictions  │◀──────│ vehicle_     │              │
│              │       │ predictions  │              │
│ id           │       │              │              │
│ vehicle_id ◀─┼───────│ vehicle_id   │              │
│ component    │       │ prediction_id│              │
│ probability  │       │              │              │
│ factors      │       └──────────────┘              │
└──────────────┘                                     │
                                                     ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   alerts     │       │ vehicle_     │       │ sync_logs    │
│              │       │ groups       │       │              │
│ id           │       │              │       │ id           │
│ vehicle_id ◀─┼───────│ vehicle_id   │       │ tenant_id    │
│ type         │       │ group_id     │       │ status       │
│ severity     │       │              │       │ records_     │
│ status       │       └──────────────┘       │ synced       │
└──────────────┘              │               └──────────────┘
                              ▼
                       ┌──────────────┐
                       │   groups     │
                       │              │
                       │ id           │
                       │ tenant_id    │
                       │ name         │
                       │ filters      │
                       └──────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp(map: "uuid-ossp"), pgcrypto]
}

// ============================================================================
// TENANT & USER MANAGEMENT
// ============================================================================

enum TenantType {
  DEALER
  FLEET
  OWNER_OPERATOR
}

model Tenant {
  id          String     @id @default(uuid()) @db.Uuid
  name        String
  type        TenantType
  slug        String     @unique
  settings    Json       @default("{}")
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  deletedAt   DateTime?  @map("deleted_at")

  // Relations
  users                User[]
  vehicles             Vehicle[]
  groups               VehicleGroup[]
  alerts               Alert[]
  syncLogs             SyncLog[]
  syncCredentials      SyncCredential[]
  dealerCustomers      DealerCustomerRelationship[] @relation("DealerTenant")
  customerOfDealers    DealerCustomerRelationship[] @relation("CustomerTenant")

  @@map("tenants")
}

enum UserRole {
  SUPER_ADMIN
  DEALER_ADMIN
  FLEET_ADMIN
  SERVICE_MANAGER
  TECHNICIAN
  VIEWER
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  clerkId   String   @unique @map("clerk_id")
  email     String
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  role      UserRole @default(VIEWER)
  tenantId  String   @map("tenant_id") @db.Uuid
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  tenant             Tenant              @relation(fields: [tenantId], references: [id])
  acknowledgedAlerts AlertAcknowledgement[]
  auditLogs          AuditLog[]

  @@index([tenantId])
  @@index([clerkId])
  @@map("users")
}

model DealerCustomerRelationship {
  id                String   @id @default(uuid()) @db.Uuid
  dealerTenantId    String   @map("dealer_tenant_id") @db.Uuid
  customerTenantId  String   @map("customer_tenant_id") @db.Uuid
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  dealerTenant   Tenant @relation("DealerTenant", fields: [dealerTenantId], references: [id])
  customerTenant Tenant @relation("CustomerTenant", fields: [customerTenantId], references: [id])

  @@unique([dealerTenantId, customerTenantId])
  @@map("dealer_customer_relationships")
}

// ============================================================================
// VEHICLE ENTITIES
// ============================================================================

model Vehicle {
  id               String    @id @default(uuid()) @db.Uuid
  vin              String    @db.VarChar(17)
  unitNumber       String?   @map("unit_number")
  year             Int
  make             String
  model            String
  engineMake       String?   @map("engine_make")
  engineModel      String?   @map("engine_model")
  engineSerial     String?   @map("engine_serial")
  currentOdometer  Int       @map("current_odometer")
  engineHours      Int?      @map("engine_hours")
  inServiceDate    DateTime? @map("in_service_date")
  warrantyExpiry   DateTime? @map("warranty_expiry")
  lastLocation     Json?     @map("last_location") // { lat, lng, timestamp }
  tenantId         String    @map("tenant_id") @db.Uuid
  truckTechPlusId  String?   @map("trucktech_plus_id") // External ID from TruckTech+
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  lastSyncAt       DateTime? @map("last_sync_at")

  // Computed fields (updated by triggers/jobs)
  healthScore      Int?      @map("health_score") // 0-100
  riskLevel        RiskLevel? @map("risk_level")
  activeFaultCount Int       @default(0) @map("active_fault_count")

  // Relations
  tenant           Tenant             @relation(fields: [tenantId], references: [id])
  faultCodes       FaultCode[]
  predictions      VehiclePrediction[]
  alerts           Alert[]
  groupMemberships VehicleGroupMember[]
  odometerHistory  OdometerReading[]

  @@unique([vin, tenantId])
  @@index([tenantId])
  @@index([vin])
  @@index([unitNumber])
  @@index([healthScore])
  @@index([riskLevel])
  @@map("vehicles")
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model OdometerReading {
  id         String   @id @default(uuid()) @db.Uuid
  vehicleId  String   @map("vehicle_id") @db.Uuid
  reading    Int
  readingAt  DateTime @map("reading_at")
  source     String   // 'trucktech', 'manual', 'service'
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  vehicle Vehicle @relation(fields: [vehicleId], references: [id])

  @@index([vehicleId, readingAt])
  @@map("odometer_readings")
}

// ============================================================================
// FAULT CODE ENTITIES
// ============================================================================

enum FaultSeverity {
  CRITICAL
  MAJOR
  MINOR
  INFO
}

enum FaultStatus {
  ACTIVE
  INACTIVE
  RESOLVED
}

model FaultCode {
  id               String        @id @default(uuid()) @db.Uuid
  vehicleId        String        @map("vehicle_id") @db.Uuid
  spn              Int           // Suspect Parameter Number
  fmi              Int           // Failure Mode Identifier
  sourceAddress    Int           @map("source_address") // ECU source (0=Engine, etc.)
  occurrenceCount  Int           @default(1) @map("occurrence_count")
  firstSeenAt      DateTime      @map("first_seen_at")
  lastSeenAt       DateTime      @map("last_seen_at")
  status           FaultStatus   @default(ACTIVE)
  severity         FaultSeverity
  description      String?
  recommendedAction String?      @map("recommended_action")
  odometerAtFirst  Int?          @map("odometer_at_first")
  odometerAtLast   Int?          @map("odometer_at_last")
  rawData          Json?         @map("raw_data") // Original data from TruckTech+
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")

  // Relations
  vehicle Vehicle @relation(fields: [vehicleId], references: [id])
  alerts  Alert[]

  @@unique([vehicleId, spn, fmi, sourceAddress, firstSeenAt])
  @@index([vehicleId])
  @@index([status])
  @@index([severity])
  @@index([spn])
  @@map("fault_codes")
}

// Lookup table for SPN/FMI descriptions
model FaultCodeReference {
  id             String        @id @default(uuid()) @db.Uuid
  spn            Int
  fmi            Int?
  sourceAddress  Int?          @map("source_address")
  componentName  String        @map("component_name")
  description    String
  severity       FaultSeverity
  category       String        // Engine, Aftertreatment, Electrical, etc.
  defaultAction  String?       @map("default_action")

  @@unique([spn, fmi, sourceAddress])
  @@index([spn])
  @@index([category])
  @@map("fault_code_references")
}

// ============================================================================
// PREDICTION ENTITIES
// ============================================================================

model Prediction {
  id                   String   @id @default(uuid()) @db.Uuid
  component            String   // Engine, Aftertreatment, DEF System, etc.
  modelVersion         String   @map("model_version")
  probability30d       Decimal  @map("probability_30d") @db.Decimal(5, 4)
  probability60d       Decimal  @map("probability_60d") @db.Decimal(5, 4)
  probability90d       Decimal  @map("probability_90d") @db.Decimal(5, 4)
  confidenceScore      Decimal  @map("confidence_score") @db.Decimal(5, 4)
  contributingFactors  Json     @map("contributing_factors") // Array of factor objects
  recommendedAction    String?  @map("recommended_action")
  estimatedCostLow     Decimal? @map("estimated_cost_low") @db.Decimal(10, 2)
  estimatedCostHigh    Decimal? @map("estimated_cost_high") @db.Decimal(10, 2)
  createdAt            DateTime @default(now()) @map("created_at")

  // Relations
  vehiclePredictions VehiclePrediction[]

  @@map("predictions")
}

model VehiclePrediction {
  id           String   @id @default(uuid()) @db.Uuid
  vehicleId    String   @map("vehicle_id") @db.Uuid
  predictionId String   @map("prediction_id") @db.Uuid
  isLatest     Boolean  @default(true) @map("is_latest")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  vehicle    Vehicle    @relation(fields: [vehicleId], references: [id])
  prediction Prediction @relation(fields: [predictionId], references: [id])

  @@index([vehicleId, isLatest])
  @@map("vehicle_predictions")
}

// ============================================================================
// ALERT ENTITIES
// ============================================================================

enum AlertType {
  CRITICAL_FAULT
  HIGH_RISK_PREDICTION
  PM_DUE
  WARRANTY_EXPIRING
  SYNC_FAILURE
  CUSTOM
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}

model Alert {
  id           String      @id @default(uuid()) @db.Uuid
  tenantId     String      @map("tenant_id") @db.Uuid
  vehicleId    String?     @map("vehicle_id") @db.Uuid
  faultCodeId  String?     @map("fault_code_id") @db.Uuid
  type         AlertType
  severity     FaultSeverity
  status       AlertStatus @default(ACTIVE)
  title        String
  message      String
  metadata     Json?       // Additional context
  triggeredAt  DateTime    @default(now()) @map("triggered_at")
  resolvedAt   DateTime?   @map("resolved_at")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  // Relations
  tenant          Tenant                 @relation(fields: [tenantId], references: [id])
  vehicle         Vehicle?               @relation(fields: [vehicleId], references: [id])
  faultCode       FaultCode?             @relation(fields: [faultCodeId], references: [id])
  acknowledgements AlertAcknowledgement[]
  notifications    AlertNotification[]

  @@index([tenantId, status])
  @@index([vehicleId])
  @@index([type])
  @@index([severity])
  @@map("alerts")
}

model AlertAcknowledgement {
  id           String   @id @default(uuid()) @db.Uuid
  alertId      String   @map("alert_id") @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  action       String   // acknowledged, resolved, dismissed
  note         String?
  acknowledgedAt DateTime @default(now()) @map("acknowledged_at")

  // Relations
  alert Alert @relation(fields: [alertId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@map("alert_acknowledgements")
}

model AlertNotification {
  id          String   @id @default(uuid()) @db.Uuid
  alertId     String   @map("alert_id") @db.Uuid
  channel     String   // email, sms, push
  recipient   String   // email address or phone
  sentAt      DateTime? @map("sent_at")
  deliveredAt DateTime? @map("delivered_at")
  failedAt    DateTime? @map("failed_at")
  error       String?

  // Relations
  alert Alert @relation(fields: [alertId], references: [id])

  @@map("alert_notifications")
}

// ============================================================================
// VEHICLE GROUPING
// ============================================================================

model VehicleGroup {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  name        String
  description String?
  filters     Json?    // Saved filter criteria for dynamic groups
  isDynamic   Boolean  @default(false) @map("is_dynamic")
  isDefault   Boolean  @default(false) @map("is_default")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  tenant  Tenant               @relation(fields: [tenantId], references: [id])
  members VehicleGroupMember[]

  @@unique([tenantId, name])
  @@map("vehicle_groups")
}

model VehicleGroupMember {
  id        String   @id @default(uuid()) @db.Uuid
  groupId   String   @map("group_id") @db.Uuid
  vehicleId String   @map("vehicle_id") @db.Uuid
  addedAt   DateTime @default(now()) @map("added_at")

  // Relations
  group   VehicleGroup @relation(fields: [groupId], references: [id])
  vehicle Vehicle      @relation(fields: [vehicleId], references: [id])

  @@unique([groupId, vehicleId])
  @@map("vehicle_group_members")
}

// ============================================================================
// DATA SYNC & INTEGRATION
// ============================================================================

enum SyncStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  PARTIAL
}

model SyncCredential {
  id             String   @id @default(uuid()) @db.Uuid
  tenantId       String   @map("tenant_id") @db.Uuid
  provider       String   @default("trucktech_plus") // trucktech_plus, geotab, etc.
  username       String
  passwordEnc    String   @map("password_enc") // Encrypted password
  totpSecretEnc  String?  @map("totp_secret_enc") // Encrypted TOTP secret
  isActive       Boolean  @default(true)
  lastUsedAt     DateTime? @map("last_used_at")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, provider])
  @@map("sync_credentials")
}

model SyncLog {
  id            String     @id @default(uuid()) @db.Uuid
  tenantId      String     @map("tenant_id") @db.Uuid
  provider      String     @default("trucktech_plus")
  status        SyncStatus
  startedAt     DateTime   @map("started_at")
  completedAt   DateTime?  @map("completed_at")
  vehiclesSynced Int       @default(0) @map("vehicles_synced")
  faultsSynced  Int        @default(0) @map("faults_synced")
  errorMessage  String?    @map("error_message")
  metadata      Json?      // Additional sync details

  // Relations
  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId, startedAt])
  @@index([status])
  @@map("sync_logs")
}

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  tenantId   String?  @map("tenant_id") @db.Uuid
  action     String   // CREATE, UPDATE, DELETE, LOGIN, etc.
  entityType String   @map("entity_type") // Vehicle, Alert, User, etc.
  entityId   String?  @map("entity_id") @db.Uuid
  oldValues  Json?    @map("old_values")
  newValues  Json?    @map("new_values")
  ipAddress  String?  @map("ip_address")
  userAgent  String?  @map("user_agent")
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  user User? @relation(fields: [userId], references: [id])

  @@index([tenantId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

## Row-Level Security (RLS)

### Enabling RLS

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create app user for Prisma
CREATE ROLE truckiq_app WITH LOGIN PASSWORD 'xxx';
GRANT USAGE ON SCHEMA public TO truckiq_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO truckiq_app;
```

### RLS Policies

```sql
-- Vehicles: Tenant isolation
CREATE POLICY vehicles_tenant_isolation ON vehicles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Vehicles: Dealer can see customer vehicles
CREATE POLICY vehicles_dealer_view ON vehicles
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT customer_tenant_id
      FROM dealer_customer_relationships
      WHERE dealer_tenant_id = current_setting('app.current_tenant_id')::uuid
        AND is_active = true
    )
  );

-- Fault codes: Via vehicle tenant
CREATE POLICY fault_codes_via_vehicle ON fault_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = fault_codes.vehicle_id
      AND (
        v.tenant_id = current_setting('app.current_tenant_id')::uuid
        OR v.tenant_id IN (
          SELECT customer_tenant_id
          FROM dealer_customer_relationships
          WHERE dealer_tenant_id = current_setting('app.current_tenant_id')::uuid
        )
      )
    )
  );

-- Alerts: Tenant isolation
CREATE POLICY alerts_tenant_isolation ON alerts
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Super admin bypass
CREATE POLICY super_admin_bypass_vehicles ON vehicles
  FOR ALL
  USING (current_setting('app.user_role', true) = 'SUPER_ADMIN');
```

### Setting Tenant Context

```typescript
// lib/db/context.ts
import { prisma } from './client';

export async function withTenantContext<T>(
  tenantId: string,
  userRole: string,
  operation: () => Promise<T>
): Promise<T> {
  await prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`;
  await prisma.$executeRaw`SELECT set_config('app.user_role', ${userRole}, true)`;

  return operation();
}

// Usage in API routes
export async function GET(req: Request) {
  const { tenantId, role } = await getAuth(req);

  return withTenantContext(tenantId, role, async () => {
    const vehicles = await prisma.vehicle.findMany();
    return Response.json({ data: vehicles });
  });
}
```

---

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_vehicles_tenant_health ON vehicles(tenant_id, health_score DESC);
CREATE INDEX idx_vehicles_tenant_risk ON vehicles(tenant_id, risk_level);
CREATE INDEX idx_fault_codes_vehicle_status ON fault_codes(vehicle_id, status, severity);
CREATE INDEX idx_alerts_tenant_status_type ON alerts(tenant_id, status, type);
CREATE INDEX idx_sync_logs_tenant_status ON sync_logs(tenant_id, status, started_at DESC);

-- Full-text search on vehicle
CREATE INDEX idx_vehicles_search ON vehicles
  USING gin(to_tsvector('english', vin || ' ' || COALESCE(unit_number, '')));

-- Partial indexes for active records
CREATE INDEX idx_active_faults ON fault_codes(vehicle_id, spn, fmi)
  WHERE status = 'ACTIVE';

CREATE INDEX idx_active_alerts ON alerts(tenant_id, triggered_at)
  WHERE status = 'ACTIVE';
```

---

## Seed Data

```typescript
// prisma/seed.ts
import { PrismaClient, TenantType, UserRole, FaultSeverity } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo dealer tenant
  const dealer = await prisma.tenant.create({
    data: {
      name: 'Demo Kenworth Dealer',
      type: TenantType.DEALER,
      slug: 'demo-dealer',
      settings: {
        alertEmail: 'alerts@demo-dealer.com',
        syncInterval: 4,
      },
    },
  });

  // Create demo fleet tenant
  const fleet = await prisma.tenant.create({
    data: {
      name: 'Demo Fleet Inc',
      type: TenantType.FLEET,
      slug: 'demo-fleet',
    },
  });

  // Create dealer-customer relationship
  await prisma.dealerCustomerRelationship.create({
    data: {
      dealerTenantId: dealer.id,
      customerTenantId: fleet.id,
    },
  });

  // Create sample vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        vin: '1XKAD49X0NJ123456',
        unitNumber: 'T-2045',
        year: 2023,
        make: 'Kenworth',
        model: 'T680',
        engineMake: 'PACCAR',
        engineModel: 'MX-13',
        currentOdometer: 145678,
        engineHours: 4521,
        tenantId: fleet.id,
        healthScore: 87,
        riskLevel: 'MEDIUM',
        activeFaultCount: 2,
      },
    }),
    // Add more vehicles...
  ]);

  // Create sample fault codes
  await prisma.faultCode.createMany({
    data: [
      {
        vehicleId: vehicles[0].id,
        spn: 3226,
        fmi: 4,
        sourceAddress: 0,
        severity: FaultSeverity.MAJOR,
        status: 'ACTIVE',
        description: 'Aftertreatment 1 Intake NOx - Voltage Below Normal',
        firstSeenAt: new Date('2026-01-15'),
        lastSeenAt: new Date('2026-01-21'),
        occurrenceCount: 3,
      },
      // Add more fault codes...
    ],
  });

  // Create fault code reference data
  await prisma.faultCodeReference.createMany({
    data: [
      { spn: 3226, fmi: 4, componentName: 'NOx Sensor', description: 'Aftertreatment 1 Intake NOx - Voltage Below Normal', severity: FaultSeverity.MAJOR, category: 'Aftertreatment' },
      { spn: 3216, fmi: 3, componentName: 'DEF Tank Level', description: 'Aftertreatment 1 Diesel Exhaust Fluid Tank Level - Voltage Above Normal', severity: FaultSeverity.MINOR, category: 'Aftertreatment' },
      { spn: 91, fmi: 2, componentName: 'Accelerator Pedal', description: 'Accelerator Pedal Position - Erratic or Incorrect', severity: FaultSeverity.MAJOR, category: 'Engine' },
      // Add comprehensive reference data...
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Migration Strategy

```bash
# Development
npx prisma migrate dev --name init

# Production (via Render deploy hook)
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset
```
