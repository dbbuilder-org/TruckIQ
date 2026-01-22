# TruckIQ AI - Requirements Specification

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Table of Contents

1. [Functional Requirements](#functional-requirements)
2. [Non-Functional Requirements](#non-functional-requirements)
3. [User Stories by Persona](#user-stories-by-persona)
4. [Data Requirements](#data-requirements)
5. [Integration Requirements](#integration-requirements)
6. [Acceptance Criteria](#acceptance-criteria)

---

## Functional Requirements

### FR-1: Data Integration

#### FR-1.1: TruckTech+ Data Synchronization
- **FR-1.1.1**: System SHALL automatically authenticate with TruckTech+ portal using stored credentials
- **FR-1.1.2**: System SHALL handle MFA/2FA using TOTP automation or session persistence
- **FR-1.1.3**: System SHALL sync vehicle data at configurable intervals (default: every 4 hours)
- **FR-1.1.4**: System SHALL capture and store fault codes with SPN, FMI, and timestamp
- **FR-1.1.5**: System SHALL track sync status and alert on failures after 24 hours without data

#### FR-1.2: Vehicle Data Capture
- **FR-1.2.1**: System SHALL store vehicle identification (VIN, unit number, year, make, model, engine)
- **FR-1.2.2**: System SHALL track current odometer reading and engine hours
- **FR-1.2.3**: System SHALL capture GPS location when available
- **FR-1.2.4**: System SHALL record active fault codes with severity classification
- **FR-1.2.5**: System SHALL maintain historical fault code timeline

#### FR-1.3: Batch Processing
- **FR-1.3.1**: System SHALL support batch import of historical data
- **FR-1.3.2**: System SHALL deduplicate records based on VIN + timestamp + fault code
- **FR-1.3.3**: System SHALL track import batches for audit trail

---

### FR-2: Predictive Maintenance AI

#### FR-2.1: Risk Scoring
- **FR-2.1.1**: System SHALL calculate failure probability scores for each monitored component
- **FR-2.1.2**: System SHALL provide 30-day, 60-day, and 90-day prediction windows
- **FR-2.1.3**: System SHALL update risk scores within 1 hour of new data ingestion
- **FR-2.1.4**: System SHALL explain risk score factors in human-readable format

#### FR-2.2: Anomaly Detection
- **FR-2.2.1**: System SHALL identify unusual patterns in vehicle telemetry
- **FR-2.2.2**: System SHALL flag deviations from baseline vehicle behavior
- **FR-2.2.3**: System SHALL compare individual truck patterns against fleet cohort

#### FR-2.3: Maintenance Recommendations
- **FR-2.3.1**: System SHALL generate actionable maintenance recommendations
- **FR-2.3.2**: System SHALL prioritize recommendations by severity (Critical/Major/Minor)
- **FR-2.3.3**: System SHALL estimate repair urgency (Immediate/This Week/Next PM/Monitor)
- **FR-2.3.4**: System SHALL suggest related inspections based on fault patterns

---

### FR-3: Multi-Tier Dashboard

#### FR-3.1: Truck Level View
- **FR-3.1.1**: System SHALL display individual vehicle health summary
- **FR-3.1.2**: System SHALL show active fault codes with descriptions and recommended actions
- **FR-3.1.3**: System SHALL present maintenance history timeline
- **FR-3.1.4**: System SHALL display predicted upcoming maintenance needs
- **FR-3.1.5**: System SHALL show warranty status and expiration

#### FR-3.2: Group Level View
- **FR-3.2.1**: System SHALL aggregate health metrics across user-defined vehicle groups
- **FR-3.2.2**: System SHALL enable group comparison (e.g., regional, by age, by application)
- **FR-3.2.3**: System SHALL highlight outliers within groups
- **FR-3.2.4**: System SHALL display group-level maintenance compliance

#### FR-3.3: Company Level View
- **FR-3.3.1**: System SHALL provide enterprise-wide fleet health overview
- **FR-3.3.2**: System SHALL display total vehicles, active alerts, upcoming maintenance
- **FR-3.3.3**: System SHALL show cost and downtime trends over time
- **FR-3.3.4**: System SHALL enable drill-down from company → group → truck

#### FR-3.4: Dealer Level View (Multi-Tenant)
- **FR-3.4.1**: System SHALL aggregate all customer fleets for dealer users
- **FR-3.4.2**: System SHALL display service pipeline (predicted incoming work)
- **FR-3.4.3**: System SHALL show dealer-wide metrics (trucks monitored, alerts active)
- **FR-3.4.4**: System SHALL enable dealer to view individual customer fleets
- **FR-3.4.5**: System SHALL track dealer performance metrics (response time, capture rate)

---

### FR-4: Smart Filtering & Search

#### FR-4.1: Quick Filters
- **FR-4.1.1**: System SHALL provide age-based filters (0-2yr, 2-5yr, 5-10yr, 10+yr)
- **FR-4.1.2**: System SHALL provide mileage-based filters (configurable bands)
- **FR-4.1.3**: System SHALL provide engine hours filters
- **FR-4.1.4**: System SHALL provide severity filters (Critical/Major/Minor/All)
- **FR-4.1.5**: System SHALL provide component system filters (Engine, Aftertreatment, Electrical, Brakes, etc.)

#### FR-4.2: Advanced Search
- **FR-4.2.1**: System SHALL support search by VIN (partial match)
- **FR-4.2.2**: System SHALL support search by unit number
- **FR-4.2.3**: System SHALL support search by fault code (SPN or description)
- **FR-4.2.4**: System SHALL support saved filter combinations

#### FR-4.3: Smart Suggestions
- **FR-4.3.1**: System SHALL suggest relevant filters based on user context
- **FR-4.3.2**: System SHALL remember user's frequently used filters
- **FR-4.3.3**: System SHALL provide quick-access to "at-risk" vehicle lists

---

### FR-5: Alerts & Notifications

#### FR-5.1: Alert Configuration
- **FR-5.1.1**: System SHALL allow users to configure alert thresholds
- **FR-5.1.2**: System SHALL support alert channels: in-app, email, SMS (future)
- **FR-5.1.3**: System SHALL allow alerts to be assigned to specific users/roles

#### FR-5.2: Alert Types
- **FR-5.2.1**: System SHALL generate Critical Failure alerts (>80% probability within 7 days)
- **FR-5.2.2**: System SHALL generate High Risk alerts (>60% probability within 30 days)
- **FR-5.2.3**: System SHALL generate PM Due alerts based on mileage/hours/time
- **FR-5.2.4**: System SHALL generate Warranty Expiring alerts (30/60/90 day warnings)
- **FR-5.2.5**: System SHALL generate Data Sync Failure alerts

#### FR-5.3: Alert Management
- **FR-5.3.1**: System SHALL track alert acknowledgment and resolution
- **FR-5.3.2**: System SHALL provide alert history and audit trail
- **FR-5.3.3**: System SHALL auto-close alerts when resolved

---

### FR-6: Reporting & Analytics

#### FR-6.1: Standard Reports
- **FR-6.1.1**: System SHALL provide Fleet Health Summary report
- **FR-6.1.2**: System SHALL provide Maintenance Forecast report
- **FR-6.1.3**: System SHALL provide Fault Code Frequency report
- **FR-6.1.4**: System SHALL provide PM Compliance report
- **FR-6.1.5**: System SHALL provide Cost Analysis report (when cost data available)

#### FR-6.2: Report Delivery
- **FR-6.2.1**: System SHALL support on-demand report generation
- **FR-6.2.2**: System SHALL support scheduled report delivery (daily/weekly/monthly)
- **FR-6.2.3**: System SHALL export reports in PDF and CSV formats

#### FR-6.3: Custom Analytics
- **FR-6.3.1**: System SHALL provide interactive data exploration
- **FR-6.3.2**: System SHALL support custom date range selection
- **FR-6.3.3**: System SHALL enable trend comparison across time periods

---

### FR-7: User Management

#### FR-7.1: Authentication
- **FR-7.1.1**: System SHALL integrate with Clerk for authentication
- **FR-7.1.2**: System SHALL support email/password login
- **FR-7.1.3**: System SHALL support social login (Google, Microsoft)
- **FR-7.1.4**: System SHALL enforce MFA for admin roles

#### FR-7.2: Authorization (RBAC)
- **FR-7.2.1**: System SHALL implement role-based access control
- **FR-7.2.2**: System SHALL support roles: Super Admin, Dealer Admin, Fleet Admin, User, Viewer
- **FR-7.2.3**: System SHALL restrict data access based on tenant assignment
- **FR-7.2.4**: System SHALL log all permission changes

#### FR-7.3: Multi-Tenancy
- **FR-7.3.1**: System SHALL isolate tenant data at the database level (RLS)
- **FR-7.3.2**: System SHALL support users belonging to multiple tenants
- **FR-7.3.3**: System SHALL allow tenant switching for multi-tenant users
- **FR-7.3.4**: System SHALL prevent cross-tenant data leakage

---

## Non-Functional Requirements

### NFR-1: Performance

| Requirement | Specification |
|-------------|---------------|
| **NFR-1.1**: Page load time | <2 seconds for dashboard views |
| **NFR-1.2**: Search response | <500ms for filtered queries |
| **NFR-1.3**: API response time | <200ms for 95th percentile |
| **NFR-1.4**: Concurrent users | Support 100+ simultaneous users |
| **NFR-1.5**: Data freshness | <4 hours from TruckTech+ to dashboard |

### NFR-2: Scalability

| Requirement | Specification |
|-------------|---------------|
| **NFR-2.1**: Vehicle capacity | Support 10,000+ monitored vehicles |
| **NFR-2.2**: Tenant capacity | Support 100+ dealer/fleet tenants |
| **NFR-2.3**: Historical data | Retain 5 years of fault history |
| **NFR-2.4**: Horizontal scaling | Architecture supports adding nodes |

### NFR-3: Reliability

| Requirement | Specification |
|-------------|---------------|
| **NFR-3.1**: Uptime SLA | 99.5% availability |
| **NFR-3.2**: Data durability | Daily backups with 30-day retention |
| **NFR-3.3**: Disaster recovery | RTO <4 hours, RPO <1 hour |
| **NFR-3.4**: Error handling | Graceful degradation on component failure |

### NFR-4: Security

| Requirement | Specification |
|-------------|---------------|
| **NFR-4.1**: Encryption at rest | AES-256 for all stored data |
| **NFR-4.2**: Encryption in transit | TLS 1.3 for all communications |
| **NFR-4.3**: Authentication | OAuth 2.0 / OIDC via Clerk |
| **NFR-4.4**: Session management | JWT with 24-hour expiry |
| **NFR-4.5**: Audit logging | All data access logged |

### NFR-5: Usability

| Requirement | Specification |
|-------------|---------------|
| **NFR-5.1**: Mobile responsive | Full functionality on tablet/phone |
| **NFR-5.2**: Accessibility | WCAG 2.1 AA compliance |
| **NFR-5.3**: Learning curve | <30 minutes to core proficiency |
| **NFR-5.4**: Help system | Contextual tooltips and documentation |

---

## User Stories by Persona

### Dealer Service Manager

```
US-SM-001: As a Service Manager, I want to see predicted incoming service work
so that I can plan technician schedules and parts ordering.

US-SM-002: As a Service Manager, I want to view all customer fleets in one dashboard
so that I can identify which customers need proactive outreach.

US-SM-003: As a Service Manager, I want to receive alerts when a customer's truck
shows critical fault probability so that I can contact them before breakdown.

US-SM-004: As a Service Manager, I want to see PM compliance across all fleets
so that I can identify customers falling behind on maintenance.

US-SM-005: As a Service Manager, I want to export reports showing service value
delivered so that I can demonstrate ROI to customers.
```

### Fleet Manager

```
US-FM-001: As a Fleet Manager, I want to see health status of all my trucks
on a single dashboard so that I can quickly identify problems.

US-FM-002: As a Fleet Manager, I want to filter trucks by age, mileage, and
severity so that I can focus on the highest priority issues.

US-FM-003: As a Fleet Manager, I want to receive email alerts when a truck
needs immediate attention so that I can act before breakdown.

US-FM-004: As a Fleet Manager, I want to see predicted maintenance costs for
the next 90 days so that I can budget accurately.

US-FM-005: As a Fleet Manager, I want to compare truck groups to identify
which routes or drivers are hardest on equipment.
```

### Shop Foreman

```
US-SF-001: As a Shop Foreman, I want a prioritized work queue based on AI
recommendations so that I can assign the most urgent jobs first.

US-SF-002: As a Shop Foreman, I want to see related fault codes and repair
history when a truck arrives so that I can diagnose faster.

US-SF-003: As a Shop Foreman, I want AI-suggested inspection items based on
fault patterns so that I don't miss related issues.

US-SF-004: As a Shop Foreman, I want to log completed work and see it reflected
in the truck's health score immediately.
```

### Owner-Operator

```
US-OO-001: As an Owner-Operator, I want a simple dashboard showing my truck's
health score so that I know if everything is okay.

US-OO-002: As an Owner-Operator, I want clear explanations of fault codes
so that I understand what's wrong without being a mechanic.

US-OO-003: As an Owner-Operator, I want to see estimated repair costs and
urgency so that I can plan financially.

US-OO-004: As an Owner-Operator, I want text alerts for critical issues
so that I don't miss important warnings.
```

### Dealer Principal

```
US-DP-001: As a Dealer Principal, I want to see aggregate metrics across all
customers so that I understand my service business performance.

US-DP-002: As a Dealer Principal, I want to identify at-risk customers (trucks
not being serviced at my dealer) so that I can improve capture rate.

US-DP-003: As a Dealer Principal, I want ROI reporting showing downtime prevented
so that I can market TruckIQ to prospects.
```

---

## Data Requirements

### DR-1: Vehicle Master Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| VIN | String(17) | Yes | Vehicle Identification Number |
| unit_number | String(50) | No | Fleet-assigned unit ID |
| year | Integer | Yes | Model year |
| make | String(50) | Yes | Manufacturer (Kenworth, Peterbilt) |
| model | String(50) | Yes | Vehicle model |
| engine_make | String(50) | Yes | Engine manufacturer |
| engine_model | String(50) | Yes | Engine model |
| current_odometer | Integer | Yes | Latest odometer reading (miles) |
| engine_hours | Integer | No | Total engine hours |
| in_service_date | Date | No | Date truck entered service |

### DR-2: Fault Code Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| spn | Integer | Yes | Suspect Parameter Number |
| fmi | Integer | Yes | Failure Mode Identifier |
| source_address | Integer | Yes | ECU source (0=Engine, 33=BCM, etc.) |
| occurrence_count | Integer | Yes | Times this code occurred |
| first_seen | Timestamp | Yes | First occurrence |
| last_seen | Timestamp | Yes | Most recent occurrence |
| is_active | Boolean | Yes | Currently active flag |
| severity | Enum | Yes | Critical/Major/Minor |
| description | Text | Yes | Human-readable description |

### DR-3: Prediction Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| component | String | Yes | Component/system being predicted |
| failure_probability_30d | Decimal | Yes | 0.0-1.0 probability |
| failure_probability_60d | Decimal | Yes | 0.0-1.0 probability |
| failure_probability_90d | Decimal | Yes | 0.0-1.0 probability |
| confidence_score | Decimal | Yes | Model confidence 0.0-1.0 |
| contributing_factors | JSONB | Yes | Factors driving prediction |
| recommended_action | Text | Yes | Suggested next step |
| estimated_repair_cost | Decimal | No | Predicted cost range |

---

## Integration Requirements

### IR-1: TruckTech+ Integration

| Requirement | Specification |
|-------------|---------------|
| **IR-1.1**: Authentication | OAuth or session-based with TOTP MFA support |
| **IR-1.2**: Data refresh | Minimum every 4 hours |
| **IR-1.3**: Fault code capture | All active and historical DTCs |
| **IR-1.4**: Vehicle metadata | VIN, odometer, engine hours, location |
| **IR-1.5**: Error handling | Retry with exponential backoff, alert on persistent failure |

### IR-2: Clerk Authentication

| Requirement | Specification |
|-------------|---------------|
| **IR-2.1**: SSO | Support Google, Microsoft, email/password |
| **IR-2.2**: MFA | Enforce for admin roles |
| **IR-2.3**: Webhooks | Sync user events to database |
| **IR-2.4**: Session management | Handle JWT validation and refresh |

### IR-3: Future Integrations (Post-MVP)

- Dealer Management Systems (CDK, Karmak)
- Parts ordering (PACCAR Parts, Karmak)
- Service scheduling (Decisiv SRM)
- Accounting (QuickBooks, Sage)

---

## Acceptance Criteria

### AC-1: MVP Launch Criteria

| Criterion | Measurement |
|-----------|-------------|
| **AC-1.1**: Data sync operational | TruckTech+ sync completes for 3+ consecutive days |
| **AC-1.2**: Dashboard functional | All four tier views (Truck/Group/Company/Dealer) render correctly |
| **AC-1.3**: Predictions active | AI generates risk scores for >90% of monitored vehicles |
| **AC-1.4**: Alerts working | Critical alerts delivered within 15 minutes of detection |
| **AC-1.5**: Multi-tenant | 2+ tenants isolated correctly with no data leakage |
| **AC-1.6**: Performance | Dashboard loads <2s with 1,000 vehicles |
| **AC-1.7**: Mobile responsive | Core features usable on tablet |

### AC-2: Quality Gates

| Gate | Requirement |
|------|-------------|
| **AC-2.1**: Unit test coverage | >80% coverage on business logic |
| **AC-2.2**: E2E test pass rate | 100% of critical path tests passing |
| **AC-2.3**: Security scan | No high/critical vulnerabilities |
| **AC-2.4**: Performance test | Meets NFR-1 requirements under load |
| **AC-2.5**: Accessibility audit | WCAG 2.1 AA compliance verified |
