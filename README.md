# TruckIQ AI

**Revolutionary Fleet Intelligence Platform for Predictive Maintenance and Service Management**

TruckIQ AI transforms how Kenworth dealers and fleet operators manage truck health. By integrating real-time telematics data from TruckTech+, advanced AI predictions, and intuitive multi-tier dashboards, TruckIQ delivers proactive fleet optimization.

## Vision

> *"Predict failures before they happen. Fix trucks before they break. Deliver exceptional uptime."*

## Key Features

- **TruckTech+ Integration**: Automated data sync with MFA handling
- **Predictive Maintenance AI**: 30/60/90-day failure probability predictions
- **Multi-Tier Dashboards**: Truck → Group → Company → Dealer views
- **Smart Filtering**: Age, mileage, severity, and component-based filters
- **Proactive Alerts**: Critical notifications before breakdowns occur
- **Multi-Tenant Security**: RLS-based isolation for dealers and fleets

## Documentation

Comprehensive specifications are available in `/docs/specs/`:

| Document | Description |
|----------|-------------|
| [Product Vision](docs/specs/PRODUCT_VISION.md) | Market opportunity and product strategy |
| [Requirements](docs/specs/REQUIREMENTS.md) | Functional requirements and user stories |
| [Architecture](docs/specs/ARCHITECTURE.md) | System design and technology stack |
| [Database Schema](docs/specs/DATABASE_SCHEMA.md) | Prisma schema with RLS policies |
| [Data Integration](docs/specs/DATA_INTEGRATION.md) | TruckTech+ scraping strategy |
| [AI/ML Specification](docs/specs/AI_ML_SPECIFICATION.md) | Predictive models and risk scoring |
| [UI/UX Specification](docs/specs/UI_UX_SPECIFICATION.md) | Dashboard designs and components |
| [Security & Multi-Tenancy](docs/specs/SECURITY_MULTI_TENANCY.md) | RBAC and tenant isolation |
| [MVP Roadmap](docs/specs/MVP_ROADMAP.md) | Development phases and milestones |
| [Bibliography](docs/specs/BIBLIOGRAPHY.md) | Research sources and references |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+, React, Tailwind CSS, shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL, Prisma ORM |
| Data Sync | Python, Playwright, Camoufox |
| AI/ML | Python, scikit-learn |
| Hosting | Render |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

## Project Status

**Current Phase**: Prototype Demo

The prototype demonstrates all planned dashboard interfaces with placeholder data. Next step is connecting real TruckTech+ data integration.

## Contact

**Project Lead**: Chris Therriault
**Email**: chris@servicevision.net
**Organization**: ServiceVision

---

*Built with care for the future of fleet maintenance.*
