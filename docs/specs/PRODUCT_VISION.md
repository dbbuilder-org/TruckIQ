# TruckIQ AI - Product Vision

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Executive Summary

**TruckIQ AI** is a revolutionary fleet intelligence platform designed specifically for Kenworth service dealers and fleet operators. By integrating real-time telematics data from TruckTech+, advanced predictive maintenance AI, and intuitive multi-tier dashboards, TruckIQ transforms reactive service management into proactive fleet optimization.

### The Vision

> *"Predict failures before they happen. Fix trucks before they break. Deliver exceptional uptime."*

TruckIQ AI enables Kenworth dealers to demonstrate the future of service management—moving from "wait until it breaks" to "fix it before the driver knows there's a problem."

---

## Market Opportunity

### The Problem

1. **Reactive Maintenance Culture**: Most fleets still operate on "fix when broken" or basic PM schedules
2. **Costly Downtime**: Single roadside breakdown costs $450-$760 average; large fleets lose millions annually
3. **Fragmented Systems**: Dealers juggle TruckTech+, DMS, parts inventory, and scheduling separately
4. **Data Underutilization**: TruckTech+ generates rich diagnostic data, but insights are buried in alerts
5. **Technician Shortage**: 120,000 annual technician churn requires smarter work allocation

### The Opportunity

- **130,000+ trucks** enrolled in TruckTech+ across US/Canada
- **Predictive maintenance market** growing to $16.75B by 2030
- **AI-driven maintenance** can improve fleet availability by 20-25% (Deloitte)
- **Early adopter advantage** for dealers who embrace AI-first service

---

## Target Users

### Primary: Kenworth Service Dealers

| Role | Pain Points | TruckIQ Value |
|------|-------------|---------------|
| **Service Manager** | Scheduling chaos, unknown incoming work | Predicted service pipeline, capacity planning |
| **Shop Foreman** | Reactive firefighting, technician allocation | AI-prioritized work queue, skill matching |
| **Parts Manager** | Stockouts, overstocking, core returns | Predictive parts demand, inventory optimization |
| **Dealer Principal** | Revenue visibility, customer retention | Fleet health dashboards, proactive outreach |

### Secondary: Fleet Operators

| Role | Pain Points | TruckIQ Value |
|------|-------------|---------------|
| **Fleet Manager** | Surprise breakdowns, maintenance compliance | Predictive alerts, compliance tracking |
| **Owner-Operator** | Unexpected repair costs, downtime | Early warnings, cost forecasting |
| **Dispatcher** | Truck availability uncertainty | Real-time health status, route risk |

---

## Product Pillars

### 1. Intelligent Data Integration

Automated, MFA-aware data synchronization from TruckTech+ portal:
- Real-time fault codes (J1939 DTCs)
- Vehicle health metrics
- Service history and warranty status
- Mileage and engine hours
- GPS location data

### 2. Predictive Maintenance AI

Machine learning models that predict failures before they occur:
- **Survival Analysis**: Remaining useful life estimation
- **Anomaly Detection**: Pattern recognition in sensor data
- **Risk Scoring**: Real-time 30/60/90-day failure probability
- **Root Cause Analysis**: Fault code interpretation with repair recommendations

### 3. Multi-Tier Dashboard

Hierarchical views from individual truck to entire enterprise:
- **Truck View**: Individual unit health, history, upcoming needs
- **Group View**: Fleet segment comparison, aggregate health
- **Company View**: Enterprise metrics, cross-fleet benchmarking
- **Dealer View**: All customer fleets, service pipeline, capacity planning

### 4. Smart Filtering & Discovery

Intelligent filtering that keeps users focused:
- Age-based cohorts (0-2yr, 2-5yr, 5+ yr)
- Mileage bands (0-250K, 250-500K, 500K+)
- Engine hours brackets
- Severity prioritization (Critical/Major/Minor)
- Component system grouping (Engine, Aftertreatment, Electrical, etc.)

### 5. Proactive Alerts & Workflows

Action-oriented notifications that drive service:
- **Imminent Failure**: "DEF pump showing 87% failure probability in 14 days"
- **Warranty Expiring**: "3 trucks leaving warranty coverage in 30 days"
- **PM Due**: "15 trucks due for PM-B service this week"
- **Campaign/Recall**: "TSB-2026-001 applies to 8 trucks in your fleet"

---

## Differentiation

### vs. TruckTech+ Portal (Native)

| Capability | TruckTech+ | TruckIQ AI |
|------------|------------|------------|
| Fault code alerts | Email notifications | AI-prioritized dashboard with severity scoring |
| Failure prediction | None | 30/60/90-day probability with component-level detail |
| Multi-fleet view | Single account | Dealer-wide customer aggregation |
| Historical analytics | Basic history | Trend analysis, failure patterns, cohort comparison |
| Integration | Standalone | Connected to DMS, scheduling, parts |

### vs. Samsara/Geotab (Generic Telematics)

| Capability | Generic Telematics | TruckIQ AI |
|------------|-------------------|------------|
| OEM data depth | Third-party sensors | Native TruckTech+ data (800+ parameters) |
| PACCAR expertise | Generic algorithms | Trained on Kenworth/Peterbilt failure patterns |
| Dealer integration | Fleet-only focus | Dealer + Fleet bi-directional view |
| Service workflow | Alerting only | Service scheduling, parts ordering, work assignment |

### vs. Decisiv SRM (Service Platform)

| Capability | Decisiv SRM | TruckIQ AI |
|------------|-------------|------------|
| Predictive AI | Reactive service events | Proactive failure prediction |
| Data source | Dealer-initiated | Continuous telematics ingestion |
| Fleet visibility | Service event view | Complete vehicle health view |
| Pricing | Enterprise contracts | SMB-accessible SaaS |

---

## Success Metrics (MVP)

### Dealer Value Metrics

| Metric | Baseline | Target (90 days) |
|--------|----------|------------------|
| Unscheduled repair rate | Industry: 35-40% | <25% for monitored trucks |
| Service capture rate | ~60% | >75% (proactive outreach) |
| Parts inventory turns | 4-6x annually | >8x with predictive ordering |
| Average repair time | 4-6 hours | <4 hours with pre-staging |

### Fleet Value Metrics

| Metric | Baseline | Target (90 days) |
|--------|----------|------------------|
| Roadside breakdown rate | 15-20/year per 100 trucks | <10/year per 100 trucks |
| PM compliance | 75-85% | >95% |
| Cost per mile (maintenance) | $0.12-0.18 | <$0.12 |
| Vehicle uptime | 92-95% | >97% |

---

## Revenue Model

### SaaS Subscription Tiers

| Tier | Target | Pricing | Features |
|------|--------|---------|----------|
| **Starter** | Owner-Operators | $29/truck/month | Basic health dashboard, alerts |
| **Professional** | Small Fleets (5-50) | $49/truck/month | + Predictive AI, reporting |
| **Enterprise** | Large Fleets (50+) | $39/truck/month | + API access, custom integrations |
| **Dealer** | Kenworth Dealers | $999/month + $19/truck | Multi-tenant, all customer fleets |

### Additional Revenue Streams

- **Parts Marketplace Integration**: Affiliate revenue on recommended parts
- **Service Scheduling**: Transaction fee on dealer-booked appointments
- **Data Analytics**: Anonymized fleet insights for OEM/suppliers
- **White-Label**: Branded portals for large fleet operators

---

## Competitive Moat

1. **TruckTech+ Data Depth**: Native access to PACCAR's 800+ diagnostic parameters
2. **Kenworth/Peterbilt Specialization**: ML models trained specifically on PACCAR failure patterns
3. **Dealer Network Effect**: Each dealer adds customer fleets, improving AI accuracy
4. **Bi-Directional Value**: Dealers and fleets both benefit, creating sticky ecosystem
5. **MFA Automation Expertise**: Proven pattern from AestheticIQ for reliable data sync

---

## Long-Term Vision (2027+)

### Phase 1: Predictive Maintenance (MVP - 2026)
Core health monitoring, AI predictions, multi-tier dashboards

### Phase 2: Service Orchestration (2026-2027)
Integrated scheduling, parts ordering, work order generation, DMS integration

### Phase 3: Autonomous Fleet Operations (2027+)
- Self-scheduling maintenance based on route optimization
- Automated parts procurement with just-in-time delivery
- Driver mobile app with trip health scoring
- Integration with autonomous truck systems

---

## Call to Action

TruckIQ AI positions Kenworth dealers at the forefront of fleet technology:

> *"Show your customers what the future of truck service looks like—before your competitors do."*

**The technology exists. The data exists. The market is ready.**

Let's build it.
