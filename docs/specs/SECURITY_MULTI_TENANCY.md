# TruckIQ AI - Security & Multi-Tenancy Specification

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Overview

This document specifies the security architecture and multi-tenant isolation strategy for TruckIQ AI, ensuring data protection and proper access control across dealers and fleets.

---

## Multi-Tenancy Architecture

### Tenant Types

| Type | Description | Data Access |
|------|-------------|-------------|
| **Dealer** | Kenworth service dealership | Own data + customer fleet data |
| **Fleet** | Trucking company / fleet operator | Own fleet data only |
| **Owner-Operator** | Single truck owner | Own vehicle data only |

### Tenant Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TENANT HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                    SUPER ADMIN (Platform)                       │        │
│  │  • Full access to all tenants                                  │        │
│  │  • System configuration                                        │        │
│  │  • Tenant provisioning                                         │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              ▼               ▼               ▼                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                   │
│  │    DEALER     │  │    DEALER     │  │    DEALER     │                   │
│  │  Metro KW     │  │  Valley KW    │  │  Coastal KW   │                   │
│  │               │  │               │  │               │                   │
│  │ Own Data +    │  │ Own Data +    │  │ Own Data +    │                   │
│  │ Customers ↓   │  │ Customers ↓   │  │ Customers ↓   │                   │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘                   │
│          │                  │                  │                            │
│    ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐                     │
│    ▼           ▼      ▼           ▼      ▼           ▼                     │
│ ┌──────┐  ┌──────┐ ┌──────┐  ┌──────┐ ┌──────┐  ┌──────┐                  │
│ │Fleet │  │Fleet │ │Fleet │  │Fleet │ │Fleet │  │Owner │                  │
│ │ A    │  │ B    │ │ C    │  │ D    │ │ E    │  │  Op  │                  │
│ │      │  │      │ │      │  │      │ │      │  │      │                  │
│ │Own   │  │Own   │ │Own   │  │Own   │ │Own   │  │Own   │                  │
│ │Data  │  │Data  │ │Data  │  │Data  │ │Data  │  │Data  │                  │
│ └──────┘  └──────┘ └──────┘  └──────┘ └──────┘  └──────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dealer-Customer Relationships

```sql
-- Relationship table enabling dealers to view customer data
CREATE TABLE dealer_customer_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_tenant_id UUID NOT NULL REFERENCES tenants(id),
  customer_tenant_id UUID NOT NULL REFERENCES tenants(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (dealer_tenant_id, customer_tenant_id)
);

-- Dealers can only be linked to fleet/owner-operator tenants
-- Fleets cannot be linked to other fleets
ALTER TABLE dealer_customer_relationships
ADD CONSTRAINT valid_dealer_customer
CHECK (
  EXISTS (SELECT 1 FROM tenants WHERE id = dealer_tenant_id AND type = 'DEALER')
  AND EXISTS (SELECT 1 FROM tenants WHERE id = customer_tenant_id AND type IN ('FLEET', 'OWNER_OPERATOR'))
);
```

---

## Row-Level Security (RLS)

### Implementation Strategy

RLS is implemented at the PostgreSQL level, ensuring data isolation even if application-level bugs occur.

### Setting Tenant Context

```typescript
// lib/db/tenant-context.ts
import { prisma } from './client';

/**
 * Execute a database operation within a tenant context.
 * Sets PostgreSQL session variables for RLS policies.
 */
export async function withTenantContext<T>(
  tenantId: string,
  userId: string,
  userRole: string,
  operation: () => Promise<T>
): Promise<T> {
  // Set session variables for RLS
  await prisma.$executeRaw`
    SELECT
      set_config('app.current_tenant_id', ${tenantId}, true),
      set_config('app.current_user_id', ${userId}, true),
      set_config('app.current_user_role', ${userRole}, true)
  `;

  return operation();
}

// Usage in API route
export async function GET(req: Request) {
  const { userId, orgId: tenantId, orgRole: role } = await auth();

  if (!tenantId) {
    return Response.json({ error: 'No tenant context' }, { status: 401 });
  }

  return withTenantContext(tenantId, userId, role, async () => {
    // RLS automatically filters results
    const vehicles = await prisma.vehicle.findMany();
    return Response.json({ data: vehicles });
  });
}
```

### RLS Policies

```sql
-- ============================================================================
-- VEHICLES TABLE
-- ============================================================================

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles FORCE ROW LEVEL SECURITY;

-- Policy 1: Tenant isolation (fleet/owner-operator users see only their vehicles)
CREATE POLICY vehicles_tenant_isolation ON vehicles
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Policy 2: Dealer view of customer vehicles (read-only)
CREATE POLICY vehicles_dealer_customer_view ON vehicles
  FOR SELECT
  USING (
    -- Check if current tenant is a dealer with relationship to this vehicle's tenant
    tenant_id IN (
      SELECT customer_tenant_id
      FROM dealer_customer_relationships
      WHERE dealer_tenant_id = current_setting('app.current_tenant_id', true)::uuid
        AND is_active = true
    )
  );

-- Policy 3: Super admin bypass
CREATE POLICY vehicles_super_admin ON vehicles
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'SUPER_ADMIN');

-- ============================================================================
-- FAULT CODES TABLE
-- ============================================================================

ALTER TABLE fault_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fault_codes FORCE ROW LEVEL SECURITY;

-- Fault codes accessible via vehicle tenant
CREATE POLICY fault_codes_via_vehicle ON fault_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = fault_codes.vehicle_id
      AND (
        -- Direct tenant access
        v.tenant_id = current_setting('app.current_tenant_id', true)::uuid
        -- Or dealer-customer relationship
        OR v.tenant_id IN (
          SELECT customer_tenant_id
          FROM dealer_customer_relationships
          WHERE dealer_tenant_id = current_setting('app.current_tenant_id', true)::uuid
            AND is_active = true
        )
        -- Or super admin
        OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
      )
    )
  );

-- ============================================================================
-- ALERTS TABLE
-- ============================================================================

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts FORCE ROW LEVEL SECURITY;

-- Alerts scoped to tenant
CREATE POLICY alerts_tenant_isolation ON alerts
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    OR current_setting('app.current_user_role', true) = 'SUPER_ADMIN'
  );

-- Dealers can see alerts for customer vehicles (but only vehicle-related alerts)
CREATE POLICY alerts_dealer_view ON alerts
  FOR SELECT
  USING (
    vehicle_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM vehicles v
      WHERE v.id = alerts.vehicle_id
      AND v.tenant_id IN (
        SELECT customer_tenant_id
        FROM dealer_customer_relationships
        WHERE dealer_tenant_id = current_setting('app.current_tenant_id', true)::uuid
          AND is_active = true
      )
    )
  );

-- ============================================================================
-- SYNC CREDENTIALS TABLE (Highly Sensitive)
-- ============================================================================

ALTER TABLE sync_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_credentials FORCE ROW LEVEL SECURITY;

-- Only tenant admins can access their own credentials
CREATE POLICY sync_credentials_admin_only ON sync_credentials
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id', true)::uuid
    AND current_setting('app.current_user_role', true) IN ('DEALER_ADMIN', 'FLEET_ADMIN', 'SUPER_ADMIN')
  );
```

### Testing RLS Policies

```sql
-- Test: Verify tenant isolation
SET app.current_tenant_id = 'fleet-a-uuid';
SET app.current_user_role = 'FLEET_ADMIN';

SELECT * FROM vehicles; -- Should only return Fleet A's vehicles

-- Test: Verify dealer can see customer vehicles
SET app.current_tenant_id = 'metro-kw-dealer-uuid';
SET app.current_user_role = 'DEALER_ADMIN';

SELECT * FROM vehicles; -- Should return Metro KW vehicles AND customer fleet vehicles

-- Test: Verify super admin bypass
SET app.current_user_role = 'SUPER_ADMIN';

SELECT * FROM vehicles; -- Should return ALL vehicles
```

---

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Scope | Capabilities |
|------|-------|-------------|
| **SUPER_ADMIN** | Platform | All operations, all tenants, system config |
| **DEALER_ADMIN** | Dealer tenant | Manage dealer, view customers, manage users |
| **FLEET_ADMIN** | Fleet tenant | Full access to fleet, manage users |
| **SERVICE_MANAGER** | Tenant | View all data, manage alerts, reports |
| **TECHNICIAN** | Tenant | View vehicles, update service records |
| **VIEWER** | Tenant | Read-only dashboard access |

### Permission Matrix

```typescript
// lib/auth/permissions.ts

export const PERMISSIONS = {
  // Vehicle permissions
  'vehicles:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER', 'TECHNICIAN', 'VIEWER'],
  'vehicles:write': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER'],
  'vehicles:delete': ['SUPER_ADMIN', 'FLEET_ADMIN'],

  // Alert permissions
  'alerts:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER', 'TECHNICIAN', 'VIEWER'],
  'alerts:acknowledge': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER', 'TECHNICIAN'],
  'alerts:configure': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],

  // Report permissions
  'reports:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER', 'VIEWER'],
  'reports:export': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER'],

  // User management
  'users:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],
  'users:write': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],
  'users:delete': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],

  // Settings
  'settings:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN', 'SERVICE_MANAGER'],
  'settings:write': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],

  // Sync credentials (highly sensitive)
  'sync_credentials:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],
  'sync_credentials:write': ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'],

  // Tenant management
  'tenants:read': ['SUPER_ADMIN'],
  'tenants:write': ['SUPER_ADMIN'],

  // Dealer-specific
  'customers:read': ['SUPER_ADMIN', 'DEALER_ADMIN', 'SERVICE_MANAGER'],
  'customers:manage': ['SUPER_ADMIN', 'DEALER_ADMIN'],
} as const;

type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: string, permission: Permission): boolean {
  return PERMISSIONS[permission]?.includes(role as any) ?? false;
}

// Middleware helper
export function requirePermission(permission: Permission) {
  return async (req: Request) => {
    const { orgRole: role } = await auth();
    if (!hasPermission(role, permission)) {
      throw new Error('Forbidden');
    }
  };
}
```

### Clerk Integration

```typescript
// lib/auth/clerk.ts
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Get authenticated user with tenant context.
 */
export async function getAuthContext() {
  const { userId, orgId, orgRole, orgPermissions } = await auth();

  if (!userId) {
    throw new AuthError('Not authenticated');
  }

  if (!orgId) {
    throw new AuthError('No organization selected');
  }

  // Map Clerk org to our tenant
  const tenant = await prisma.tenant.findUnique({
    where: { clerkOrgId: orgId },
  });

  if (!tenant) {
    throw new AuthError('Tenant not found');
  }

  return {
    userId,
    tenantId: tenant.id,
    tenantType: tenant.type,
    role: orgRole as UserRole,
    permissions: orgPermissions,
  };
}

/**
 * Clerk webhook handler for syncing user/org changes.
 */
export async function handleClerkWebhook(event: WebhookEvent) {
  switch (event.type) {
    case 'organization.created':
      await createTenant(event.data);
      break;
    case 'organization.deleted':
      await deactivateTenant(event.data.id);
      break;
    case 'organizationMembership.created':
      await syncUserToTenant(event.data);
      break;
    case 'organizationMembership.deleted':
      await removeUserFromTenant(event.data);
      break;
  }
}
```

---

## Authentication

### Clerk Configuration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Session Management

```typescript
// lib/auth/session.ts

/**
 * Validate and refresh session.
 * JWT tokens from Clerk are validated on each request.
 */
export async function validateSession(req: Request) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  // Check session expiry
  const exp = sessionClaims?.exp;
  if (exp && Date.now() / 1000 > exp) {
    return null;
  }

  return {
    userId,
    tenantId: sessionClaims?.org_id,
    role: sessionClaims?.org_role,
  };
}
```

### MFA Requirements

```typescript
// Enforce MFA for admin roles
const ROLES_REQUIRING_MFA = ['SUPER_ADMIN', 'DEALER_ADMIN', 'FLEET_ADMIN'];

export async function enforceMFA(role: string) {
  if (ROLES_REQUIRING_MFA.includes(role)) {
    const { sessionClaims } = await auth();
    if (!sessionClaims?.factors?.includes('phone_code') &&
        !sessionClaims?.factors?.includes('totp')) {
      throw new Error('MFA required for this role');
    }
  }
}
```

---

## Data Protection

### Encryption at Rest

```typescript
// lib/crypto/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

export function encrypt(plaintext: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivBase64, authTagBase64, ciphertext] = encryptedData.split(':');

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage: Encrypting TruckTech+ credentials
const credential = await prisma.syncCredential.create({
  data: {
    tenantId,
    provider: 'trucktech_plus',
    username: email,
    passwordEnc: encrypt(password),
    totpSecretEnc: totpSecret ? encrypt(totpSecret) : null,
  },
});
```

### Encryption in Transit

All traffic is served over TLS 1.3:

```typescript
// next.config.js
module.exports = {
  // Force HTTPS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};
```

### Sensitive Data Handling

```typescript
// lib/api/sanitize.ts

/**
 * Remove sensitive fields before API response.
 */
export function sanitizeVehicle(vehicle: Vehicle): SafeVehicle {
  const { tenantId, truckTechPlusId, ...safe } = vehicle;
  return safe;
}

/**
 * Mask sensitive data for logs.
 */
export function maskSensitive(data: any): any {
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };
  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitive(masked[key]);
    }
  }

  return masked;
}
```

---

## Audit Logging

### Audit Trail Implementation

```typescript
// lib/audit/logger.ts

interface AuditEntry {
  userId?: string;
  tenantId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      tenantId: entry.tenantId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValues: entry.oldValues ? maskSensitive(entry.oldValues) : null,
      newValues: entry.newValues ? maskSensitive(entry.newValues) : null,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  });
}

// Prisma middleware for automatic audit logging
prisma.$use(async (params, next) => {
  const result = await next(params);

  // Log write operations
  if (['create', 'update', 'delete'].includes(params.action)) {
    const ctx = getRequestContext();
    await logAudit({
      userId: ctx?.userId,
      tenantId: ctx?.tenantId,
      action: params.action.toUpperCase(),
      entityType: params.model!,
      entityId: params.args?.where?.id || result?.id,
      newValues: params.action === 'create' ? result : params.args?.data,
    });
  }

  return result;
});
```

### Audit Query API

```typescript
// app/api/admin/audit/route.ts
export async function GET(req: Request) {
  await requirePermission('audit:read')(req);

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId');
  const entityType = searchParams.get('entityType');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId: tenantId || undefined,
      entityType: entityType || undefined,
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return Response.json({ data: logs });
}
```

---

## Security Headers

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.clerk.dev;"
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}
```

---

## Rate Limiting

```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limits for different endpoints
const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min
    analytics: true,
  }),
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 req/hour
    analytics: true,
  }),
};

export async function rateLimit(
  identifier: string,
  type: keyof typeof rateLimiters = 'api'
) {
  const limiter = rateLimiters[type];
  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    throw new RateLimitError(`Rate limit exceeded. Reset at ${new Date(reset)}`);
  }

  return { limit, remaining, reset };
}
```

---

## Incident Response

### Security Monitoring

```typescript
// lib/security/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function reportSecurityEvent(event: {
  type: 'auth_failure' | 'permission_denied' | 'suspicious_activity';
  details: Record<string, any>;
}) {
  Sentry.captureMessage(`Security Event: ${event.type}`, {
    level: 'warning',
    tags: { security: true, eventType: event.type },
    extra: event.details,
  });

  // Log to audit trail
  logAudit({
    action: `SECURITY_${event.type.toUpperCase()}`,
    entityType: 'security_event',
    newValues: event.details,
  });
}

// Example: Report failed login attempts
export function reportFailedLogin(email: string, ipAddress: string) {
  reportSecurityEvent({
    type: 'auth_failure',
    details: { email, ipAddress, timestamp: new Date().toISOString() },
  });
}
```
