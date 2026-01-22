# TruckIQ AI - MVP Roadmap

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Executive Summary

This roadmap outlines the development path to **MVP 1.0** of TruckIQ AI, a fleet intelligence platform for Kenworth service dealers. The MVP focuses on demonstrating core value: automated data sync from TruckTech+, predictive maintenance scoring, and multi-tier dashboards.

---

## MVP Scope Definition

### In Scope (MVP 1.0)

| Feature | Priority | Description |
|---------|----------|-------------|
| TruckTech+ Data Sync | P0 | Automated scraping with MFA handling |
| Vehicle Dashboard | P0 | List view with health scores, filters |
| Vehicle Detail | P0 | Fault codes, predictions, recommendations |
| Company Dashboard | P0 | Fleet overview with aggregate metrics |
| Dealer Dashboard | P0 | Multi-fleet view for dealer users |
| Risk Scoring | P0 | Rule-based scoring (ML-enhanced post-MVP) |
| Alert System | P1 | Critical alerts with email notifications |
| User Management | P1 | Clerk auth with RBAC |
| Multi-Tenancy | P1 | RLS-based tenant isolation |

### Out of Scope (Post-MVP)

| Feature | Target | Rationale |
|---------|--------|-----------|
| ML-based predictions | v1.1 | Need data collection period first |
| Service scheduling | v1.2 | Requires DMS integration |
| Parts ordering | v1.2 | Requires supplier APIs |
| Mobile app | v1.3 | Web responsive is sufficient for MVP |
| Platform Science integration | v1.1 | Secondary data source |
| Decisiv SRM API | v1.1 | Requires PACCAR partnership |

---

## Development Phases

### Phase 0: Foundation (Pre-MVP)

**Objective:** Set up project infrastructure and development environment.

#### Tasks

- [ ] **P0-1**: Initialize Next.js project with App Router
- [ ] **P0-2**: Configure Tailwind CSS + shadcn/ui
- [ ] **P0-3**: Set up Prisma with PostgreSQL
- [ ] **P0-4**: Configure Clerk authentication
- [ ] **P0-5**: Create Render deployment pipeline
- [ ] **P0-6**: Set up Sentry error tracking
- [ ] **P0-7**: Create database schema and migrations
- [ ] **P0-8**: Seed demo data for development

#### Deliverables
- Running development environment
- Empty dashboard with auth flow
- Database with seed data

---

### Phase 1: Data Integration

**Objective:** Build automated TruckTech+ data synchronization.

#### Tasks

- [ ] **P1-1**: Create Python sync service skeleton
- [ ] **P1-2**: Implement browser automation with Playwright
- [ ] **P1-3**: Build TruckTech+ login flow with MFA handling
- [ ] **P1-4**: Extract vehicle list data
- [ ] **P1-5**: Extract fault code data per vehicle
- [ ] **P1-6**: Implement batch state management
- [ ] **P1-7**: Create credential encryption utilities
- [ ] **P1-8**: Build sync status monitoring
- [ ] **P1-9**: Set up Render cron job (every 4 hours)
- [ ] **P1-10**: Add failure alerting via email

#### Deliverables
- Working TruckTech+ scraper
- Automated 4-hour sync schedule
- Sync status dashboard page

#### Technical Notes
```
Integration Options (prioritized):
1. Web scraping (MVP) - Proven pattern from AestheticIQ
2. Decisiv SRM API (post-MVP) - Requires partnership
3. Platform Science SDK (post-MVP) - For real-time data
```

---

### Phase 2: Core Dashboard

**Objective:** Build the primary user interface for fleet health monitoring.

#### Tasks

- [ ] **P2-1**: Create dashboard layout with sidebar navigation
- [ ] **P2-2**: Build company overview dashboard (KPI cards, charts)
- [ ] **P2-3**: Build vehicle list page with data table
- [ ] **P2-4**: Implement filter bar (risk, age, mileage, system)
- [ ] **P2-5**: Build vehicle detail page with tabs
- [ ] **P2-6**: Create fault code display components
- [ ] **P2-7**: Add health score visualization
- [ ] **P2-8**: Implement search functionality

#### Deliverables
- Functional company dashboard
- Vehicle list with filtering
- Vehicle detail with fault codes

---

### Phase 3: Risk Scoring

**Objective:** Implement vehicle health scoring and risk assessment.

#### Tasks

- [ ] **P3-1**: Build feature extraction from fault data
- [ ] **P3-2**: Implement rule-based risk scorer (MVP)
- [ ] **P3-3**: Calculate health scores (0-100)
- [ ] **P3-4**: Determine risk levels (Low/Medium/High/Critical)
- [ ] **P3-5**: Generate recommended actions
- [ ] **P3-6**: Create prediction display components
- [ ] **P3-7**: Build health score history tracking
- [ ] **P3-8**: Add risk trend visualization

#### Deliverables
- Health scores for all vehicles
- Risk level classification
- Actionable recommendations

#### Scoring Logic (MVP Rules)
```python
# Simple rule-based scoring for MVP
score = 100
score -= active_critical_faults * 25
score -= active_major_faults * 10
score -= min(total_active_faults, 10) * 2
score -= 10 if fault_trend_increasing else 0
score -= 15 if recurring_fault_rate > 0.3 else 0
# ... additional rules
```

---

### Phase 4: Multi-Tenancy

**Objective:** Implement secure tenant isolation for dealers and fleets.

#### Tasks

- [ ] **P4-1**: Configure Clerk organizations
- [ ] **P4-2**: Implement tenant context middleware
- [ ] **P4-3**: Create RLS policies in PostgreSQL
- [ ] **P4-4**: Build dealer-customer relationship management
- [ ] **P4-5**: Create dealer dashboard view
- [ ] **P4-6**: Implement role-based permissions
- [ ] **P4-7**: Add tenant switching for multi-tenant users
- [ ] **P4-8**: Test tenant isolation

#### Deliverables
- Isolated tenant data access
- Dealer view of customer fleets
- RBAC enforcement

---

### Phase 5: Alerts & Notifications

**Objective:** Implement proactive alerting for critical issues.

#### Tasks

- [ ] **P5-1**: Define alert types and thresholds
- [ ] **P5-2**: Build alert generation logic
- [ ] **P5-3**: Create alert list page
- [ ] **P5-4**: Implement alert acknowledgment flow
- [ ] **P5-5**: Set up email notifications (Resend)
- [ ] **P5-6**: Create alert configuration UI
- [ ] **P5-7**: Add alert badges to navigation

#### Deliverables
- Critical alert notifications
- Alert management interface
- Email delivery

---

### Phase 6: Polish & Launch

**Objective:** Prepare for MVP launch with testing and documentation.

#### Tasks

- [ ] **P6-1**: End-to-end testing of critical flows
- [ ] **P6-2**: Performance optimization (< 2s page loads)
- [ ] **P6-3**: Security audit and penetration testing
- [ ] **P6-4**: Create user documentation
- [ ] **P6-5**: Build admin setup guide
- [ ] **P6-6**: Prepare demo data for sales
- [ ] **P6-7**: Set up monitoring dashboards
- [ ] **P6-8**: Create customer onboarding flow

#### Deliverables
- Production-ready application
- Documentation
- Demo environment

---

## Technical Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+ (App Router), React Server Components |
| UI | Tailwind CSS, shadcn/ui, Recharts |
| Auth | Clerk |
| Database | PostgreSQL (Render), Prisma ORM |
| Caching | Redis (Upstash) |
| Data Sync | Python, Playwright, Camoufox |
| AI/ML | Python, scikit-learn (post-MVP) |
| Hosting | Render (web, cron, database) |
| Monitoring | Sentry |
| Email | Resend |

---

## Milestone Definitions

### Milestone 1: "Data Flowing"
**Criteria:**
- TruckTech+ sync completes for 1 test tenant
- Vehicles and fault codes in database
- Basic dashboard displays data

### Milestone 2: "Single Tenant MVP"
**Criteria:**
- Complete dashboard for one fleet
- Health scores calculated
- Alerts generated
- Basic filtering works

### Milestone 3: "Multi-Tenant Ready"
**Criteria:**
- Multiple tenants isolated
- Dealer can view customer fleets
- RBAC enforced

### Milestone 4: "MVP 1.0 Release"
**Criteria:**
- All acceptance criteria met (see below)
- Documentation complete
- Demo environment ready
- 1+ pilot customer onboarded

---

## Acceptance Criteria (MVP 1.0)

| # | Criterion | Measurement |
|---|-----------|-------------|
| AC-1 | Data sync operational | TruckTech+ sync completes for 3+ consecutive days |
| AC-2 | Dashboard functional | All four tier views render correctly |
| AC-3 | Health scores | Scores calculated for >90% of vehicles |
| AC-4 | Alerts working | Critical alerts delivered within 15 minutes |
| AC-5 | Multi-tenant | 2+ tenants isolated correctly |
| AC-6 | Performance | Dashboard loads <2s with 1,000 vehicles |
| AC-7 | Mobile responsive | Core features usable on tablet |
| AC-8 | Security | No high/critical vulnerabilities |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TruckTech+ blocks scraping | Medium | High | Use anti-detect browser, rate limiting, pursue API access |
| TruckTech+ portal changes | Medium | Medium | Modular extractors, monitoring, quick updates |
| Clerk pricing at scale | Low | Medium | Evaluate alternatives if needed |
| ML model accuracy | Medium | Low | Start with rules, collect data for ML |
| Render performance limits | Low | Medium | Can migrate to AWS/GCP if needed |

---

## Success Metrics

### Technical Metrics
- **Uptime**: >99.5%
- **Sync success rate**: >95%
- **Page load time**: <2 seconds
- **API response time**: <200ms (95th percentile)

### Business Metrics (90 days post-launch)
- **Pilot customers**: 2-3 dealers
- **Monitored vehicles**: 500+
- **User engagement**: 3+ logins/week per user
- **Alert response rate**: >80% acknowledged within 24h

### Value Metrics (to track)
- Roadside breakdowns prevented (self-reported)
- Service capture rate improvement
- Mean time to detect issues
- Customer satisfaction (NPS)

---

## Post-MVP Roadmap

### v1.1 - ML Enhancement
- Train survival analysis models on collected data
- Component-specific failure predictions
- Improved confidence scoring

### v1.2 - Service Integration
- Decisiv SRM API integration
- Service scheduling
- Parts recommendation

### v1.3 - Mobile & Expansion
- React Native mobile app
- Driver-facing features
- Platform Science integration

### v1.4 - Analytics & Reporting
- Custom report builder
- Scheduled report delivery
- Fleet benchmarking

### v2.0 - Autonomous Operations
- Auto-scheduling maintenance
- Predictive parts ordering
- Integration with autonomous truck systems

---

## Getting Started

### Prerequisites
```bash
# Required tools
node >= 18.0.0
python >= 3.9
docker (for local PostgreSQL)
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/dbbuilder-org/TruckIQ.git
cd TruckIQ

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Start database
docker-compose up -d postgres

# Run migrations
npx prisma migrate dev

# Seed demo data
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Redis
REDIS_URL=redis://...

# Encryption
ENCRYPTION_KEY=<32-byte-base64>

# Sentry
SENTRY_DSN=https://...

# Email
RESEND_API_KEY=re_...
```

---

## Contact

**Project Lead:** Chris Therriault
**Email:** chris@servicevision.net
**Repository:** https://github.com/dbbuilder-org/TruckIQ
