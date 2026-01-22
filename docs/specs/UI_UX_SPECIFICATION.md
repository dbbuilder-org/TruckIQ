# TruckIQ AI - UI/UX Specification

**Version:** 1.0
**Last Updated:** January 2026
**Author:** Chris Therriault <chris@servicevision.net>

---

## Design System

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **UI Library** | shadcn/ui |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Tables** | TanStack Table |
| **Forms** | React Hook Form + Zod |

### Color Palette

```css
/* TruckIQ Brand Colors */
:root {
  /* Primary - Kenworth-inspired blue */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-900: #1e3a8a;

  /* Risk Level Colors */
  --risk-low: #22c55e;      /* Green */
  --risk-medium: #eab308;   /* Yellow */
  --risk-high: #f97316;     /* Orange */
  --risk-critical: #ef4444; /* Red */

  /* Health Score Gradient */
  --health-excellent: #22c55e; /* 80-100 */
  --health-good: #84cc16;      /* 60-79 */
  --health-fair: #eab308;      /* 40-59 */
  --health-poor: #f97316;      /* 20-39 */
  --health-critical: #ef4444;  /* 0-19 */

  /* Severity Colors */
  --severity-critical: #ef4444;
  --severity-major: #f97316;
  --severity-minor: #eab308;
  --severity-info: #3b82f6;

  /* Neutral */
  --background: #ffffff;
  --foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
}

/* Dark Mode */
.dark {
  --background: #0f172a;
  --foreground: #f8fafc;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --border: #334155;
}
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;    /* 12px - Labels, badges */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Section titles */
--text-2xl: 1.5rem;    /* 24px - Page titles */
--text-3xl: 1.875rem;  /* 30px - Dashboard headers */
```

---

## Navigation Structure

### Primary Navigation (Sidebar)

```
┌─────────────────────────────────────┐
│  🚛 TruckIQ                         │
│                                     │
│  ── OVERVIEW ──────────────────     │
│  📊 Dashboard                       │
│  🚨 Alerts (3)                      │
│                                     │
│  ── FLEET ─────────────────────     │
│  🚚 Vehicles                        │
│  📁 Groups                          │
│  📈 Analytics                       │
│                                     │
│  ── REPORTS ───────────────────     │
│  📋 Fleet Health                    │
│  🔧 Maintenance Forecast            │
│  📊 Fault Analysis                  │
│                                     │
│  ── SETTINGS ──────────────────     │
│  ⚙️  Settings                        │
│  👥 Users                           │
│  🔌 Integrations                    │
│                                     │
│  ───────────────────────────────    │
│  🏢 Acme Trucking Co.        ▼      │
│     (Tenant Switcher)               │
└─────────────────────────────────────┘
```

### Breadcrumb Navigation

```
Dashboard > Vehicles > T-2045 (VIN: 1XKAD49X0NJ123456)
```

---

## Page Layouts

### Dashboard (Company Overview)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 Dashboard                                          🔔 Alerts  👤 User   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ TOTAL       │ │ AT RISK     │ │ ACTIVE      │ │ PM DUE      │           │
│  │ VEHICLES    │ │             │ │ ALERTS      │ │ THIS WEEK   │           │
│  │    142      │ │    12       │ │    7        │ │    15       │           │
│  │  ▲ 3 new    │ │ 🔴 3 crit   │ │ 🔴 2 crit   │ │ 🟡 5 overdue│           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                             │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│  │ FLEET HEALTH DISTRIBUTION       │ │ RISK TRENDS (30 DAYS)           │   │
│  │                                 │ │                                 │   │
│  │  ████████████████░░░░░ 72%     │ │  📈 [Line chart showing risk    │   │
│  │  Healthy (>80 score)           │ │      score trend over time]     │   │
│  │                                 │ │                                 │   │
│  │  █████░░░░░░░░░░░░░░░ 18%     │ │                                 │   │
│  │  Warning (60-79)               │ │                                 │   │
│  │                                 │ │                                 │   │
│  │  ███░░░░░░░░░░░░░░░░░  8%     │ │                                 │   │
│  │  At Risk (40-59)               │ │                                 │   │
│  │                                 │ │                                 │   │
│  │  █░░░░░░░░░░░░░░░░░░░  2%     │ │                                 │   │
│  │  Critical (<40)                │ │                                 │   │
│  └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CRITICAL ALERTS                                        View All →   │   │
│  │                                                                     │   │
│  │  🔴 T-2045  DEF Pump Failure Predicted (87% in 14 days)   2h ago   │   │
│  │  🔴 T-1892  Active Critical Fault: SPN 3226 FMI 4         4h ago   │   │
│  │  🟠 T-3401  NOx Sensor Anomaly Detected                   6h ago   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ VEHICLES REQUIRING ATTENTION                           View All →   │   │
│  │                                                                     │   │
│  │  Unit        Health   Risk      Active Faults    Next Service       │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  T-2045      [==47==] 🔴 CRIT   3 (1 critical)   DEF Pump - 14d    │   │
│  │  T-1892      [==52==] 🟠 HIGH   2 (1 critical)   PM-B Due - 3d     │   │
│  │  T-3401      [==61==] 🟡 MED    1 (0 critical)   Inspect NOx       │   │
│  │  T-2876      [==68==] 🟡 MED    2 (0 critical)   PM-A Due - 7d     │   │
│  │  T-1543      [==71==] 🟡 MED    1 (0 critical)   Monitor only      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Vehicle List View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🚚 Vehicles                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── QUICK FILTERS ────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │  Risk Level:  [All ▼] [Critical] [High] [Medium] [Low]               │  │
│  │                                                                       │  │
│  │  Age:         [All ▼] [0-2 yr] [2-5 yr] [5-10 yr] [10+ yr]          │  │
│  │                                                                       │  │
│  │  Mileage:     [All ▼] [<250K] [250-500K] [500K-750K] [750K+]        │  │
│  │                                                                       │  │
│  │  System:      [All ▼] [Engine] [Aftertreatment] [Electrical] [Brakes]│  │
│  │                                                                       │  │
│  │  [🔍 Search by VIN or Unit #...]                    [Clear Filters]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Showing 142 vehicles                                  [Export CSV] [+ Add] │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ □  Unit ↕    VIN              Year  Model   Mileage   Health  Risk   │  │
│  │ ─────────────────────────────────────────────────────────────────────│  │
│  │ □  T-2045    1XKAD49X0NJ12... 2023  T680    145,678   [47]   🔴 CRIT │  │
│  │ □  T-1892    1XKYD40X4NJ34... 2022  T880    287,432   [52]   🟠 HIGH │  │
│  │ □  T-3401    1XPWD40X9NJ56... 2024  T680    52,891    [61]   🟡 MED  │  │
│  │ □  T-2876    1XKAD49X2MJ78... 2021  T680    412,567   [68]   🟡 MED  │  │
│  │ □  T-1543    1XKYD40X6MJ90... 2020  T880    523,891   [71]   🟡 MED  │  │
│  │ □  T-4521    1XPWD40X8LJ12... 2019  W990    634,215   [82]   🟢 LOW  │  │
│  │ □  T-2198    1XKAD49X0LJ34... 2023  T680    98,765    [89]   🟢 LOW  │  │
│  │ □  T-3876    1XKYD40X2KJ56... 2022  T880    176,543   [91]   🟢 LOW  │  │
│  │ ...                                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ◀ Previous   Page 1 of 8   Next ▶         [10 ▼] [25] [50] [100] per page  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Vehicle Detail View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Vehicles                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  T-2045                                              Health Score   │   │
│  │  2023 Kenworth T680                                               │   │
│  │  VIN: 1XKAD49X0NJ123456                                  [===47===]│   │
│  │                                                           CRITICAL  │   │
│  │  🔴 3 Active Faults (1 Critical)                                   │   │
│  │                                                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │   │
│  │  │ Odometer │ │ Eng Hrs  │ │ In Svc   │ │ Warranty │              │   │
│  │  │ 145,678  │ │ 4,521    │ │ 14 mo    │ │ 10 mo    │              │   │
│  │  │ miles    │ │ hours    │ │ ago      │ │ left     │              │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─ TABS ──────────────────────────────────────────────────────────────┐   │
│  │ [Overview]  [Fault Codes]  [Predictions]  [Service History]  [Alerts]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ═══ OVERVIEW TAB ═══════════════════════════════════════════════════════  │
│                                                                             │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│  │ AI RISK ASSESSMENT              │ │ PREDICTED FAILURES (90 DAYS)    │   │
│  │                                 │ │                                 │   │
│  │ 🔴 CRITICAL RISK                │ │ Component          30d  60d 90d │   │
│  │                                 │ │ ─────────────────────────────── │   │
│  │ Primary Concern:                │ │ DEF Pump           87%  92% 96% │   │
│  │ DEF pump showing 87% failure    │ │ NOx Sensor         42%  58% 71% │   │
│  │ probability within 14 days      │ │ Turbocharger       15%  23% 35% │   │
│  │                                 │ │ DPF System          8%  12% 18% │   │
│  │ Contributing Factors:           │ │                                 │   │
│  │ • Recurring DEF quality codes   │ │ [View All Predictions →]        │   │
│  │ • Increased SCR inlet temp      │ │                                 │   │
│  │ • 3 related faults in 30 days   │ │                                 │   │
│  │                                 │ │                                 │   │
│  │ Confidence: 82%                 │ │                                 │   │
│  └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ RECOMMENDED ACTIONS                                                 │   │
│  │                                                                     │   │
│  │ 1. 🔴 IMMEDIATE: Schedule DEF pump inspection and replacement      │   │
│  │    └ Est. Cost: $800 - $1,200  |  Est. Downtime: 4-6 hours         │   │
│  │                                                                     │   │
│  │ 2. 🟠 URGENT: Inspect NOx sensor wiring and connections            │   │
│  │    └ Related to active fault SPN 3226                              │   │
│  │                                                                     │   │
│  │ 3. 🟡 MONITOR: Track SCR inlet temperatures                        │   │
│  │    └ Trending 8% above normal                                      │   │
│  │                                                                     │   │
│  │                                    [📞 Contact Dealer] [📅 Schedule] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ACTIVE FAULT CODES                                                  │   │
│  │                                                                     │   │
│  │ 🔴 SPN 3226 / FMI 4  |  Aftertreatment 1 Intake NOx Sensor         │   │
│  │    └ First seen: Jan 15, 2026  |  Occurrences: 3  |  CRITICAL      │   │
│  │                                                                     │   │
│  │ 🟠 SPN 3216 / FMI 3  |  DEF Tank Level Sensor                      │   │
│  │    └ First seen: Jan 18, 2026  |  Occurrences: 2  |  MAJOR         │   │
│  │                                                                     │   │
│  │ 🟡 SPN 4094 / FMI 31 |  NOx Limits - DEF Quality                   │   │
│  │    └ First seen: Jan 20, 2026  |  Occurrences: 1  |  MINOR         │   │
│  │                                                                     │   │
│  │                                              [View All Fault Codes →]│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ HEALTH SCORE TREND (90 DAYS)                                        │   │
│  │                                                                     │   │
│  │  100 ┤                                                              │   │
│  │   80 ┤  ████████████████████████████                               │   │
│  │   60 ┤                              ████████████                    │   │
│  │   40 ┤                                          ████████████████   │   │
│  │   20 ┤                                                             │   │
│  │    0 ┤──────────────────────────────────────────────────────────   │   │
│  │       Oct       Nov       Dec       Jan                             │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dealer Dashboard (Multi-Fleet View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📊 Dealer Dashboard                    🏢 Metro Kenworth           👤 Admin│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SERVICE PIPELINE                                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ TOTAL       │ │ CRITICAL    │ │ PREDICTED   │ │ PM DUE      │           │
│  │ MONITORED   │ │ ALERTS      │ │ FAILURES    │ │ THIS WEEK   │           │
│  │    847      │ │    23       │ │    45       │ │    89       │           │
│  │ 12 fleets   │ │ 7 fleets    │ │ next 30 days│ │ across all  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ CUSTOMER FLEETS                                        [+ Add Fleet] │   │
│  │                                                                     │   │
│  │  Fleet Name          Vehicles  Health  Critical  High   Service $   │   │
│  │  ────────────────────────────────────────────────────────────────── │   │
│  │  Acme Trucking Co.      142    [72%]     3        12    $45,200     │   │
│  │  FastFreight LLC         89    [81%]     1         5    $23,100     │   │
│  │  Mountain Transport     234    [68%]     8        19    $78,500     │   │
│  │  Coastal Logistics       67    [85%]     0         3    $12,800     │   │
│  │  Valley Haulers          98    [74%]     4         8    $34,600     │   │
│  │  ...                                                                │   │
│  │                                                                     │   │
│  │                                              [View All Customers →]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐ ┌─────────────────────────────────────┐   │
│  │ PREDICTED SERVICE REVENUE   │ │ OUTREACH OPPORTUNITIES              │   │
│  │                             │ │                                     │   │
│  │ Next 30 Days: $187,400     │ │ 🔴 3 trucks with critical risk -   │   │
│  │ Next 60 Days: $342,100     │ │    not scheduled for service        │   │
│  │ Next 90 Days: $498,700     │ │                                     │   │
│  │                             │ │ 🟡 12 trucks PM overdue -          │   │
│  │ [📊 View Breakdown]         │ │    no appointment booked           │   │
│  │                             │ │                                     │   │
│  │                             │ │ 📞 8 warranty expirations in 30d - │   │
│  │                             │ │    schedule inspection              │   │
│  │                             │ │                                     │   │
│  │                             │ │ [Generate Outreach List →]          │   │
│  └─────────────────────────────┘ └─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### Health Score Indicator

```tsx
// components/dashboard/HealthScore.tsx
interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthScore({ score, size = 'md', showLabel = true }: HealthScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'At Risk';
    if (score >= 20) return 'Poor';
    return 'Critical';
  };

  return (
    <div className={cn('flex items-center gap-2', sizeClasses[size])}>
      <div className={cn('rounded-full flex items-center justify-center', getColor(score))}>
        {score}
      </div>
      {showLabel && <span className="text-sm text-muted-foreground">{getLabel(score)}</span>}
    </div>
  );
}
```

### Risk Badge

```tsx
// components/ui/RiskBadge.tsx
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const riskConfig = {
  low: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'LOW' },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', label: 'MED' },
  high: { color: 'bg-orange-100 text-orange-800', icon: '🟠', label: 'HIGH' },
  critical: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'CRIT' },
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = riskConfig[level];
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.color)}>
      {config.icon} {config.label}
    </span>
  );
}
```

### Fault Code Card

```tsx
// components/vehicles/FaultCodeCard.tsx
interface FaultCodeCardProps {
  spn: number;
  fmi: number;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  firstSeen: Date;
  occurrences: number;
  recommendedAction?: string;
}

export function FaultCodeCard({
  spn,
  fmi,
  description,
  severity,
  firstSeen,
  occurrences,
  recommendedAction,
}: FaultCodeCardProps) {
  const severityColors = {
    critical: 'border-l-red-500',
    major: 'border-l-orange-500',
    minor: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <Card className={cn('border-l-4', severityColors[severity])}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">
            SPN {spn} / FMI {fmi}
          </CardTitle>
          <SeverityBadge severity={severity} />
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>First seen: {formatDate(firstSeen)}</span>
          <span>Occurrences: {occurrences}</span>
        </div>
        {recommendedAction && (
          <Alert className="mt-2">
            <AlertDescription>{recommendedAction}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

### Filter Bar

```tsx
// components/vehicles/FilterBar.tsx
export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Risk Level */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Risk Level</Label>
          <ToggleGroup type="multiple" value={filters.riskLevels} onValueChange={(v) => onFilterChange({ riskLevels: v })}>
            <ToggleGroupItem value="critical" className="data-[state=on]:bg-red-100">🔴 Critical</ToggleGroupItem>
            <ToggleGroupItem value="high" className="data-[state=on]:bg-orange-100">🟠 High</ToggleGroupItem>
            <ToggleGroupItem value="medium" className="data-[state=on]:bg-yellow-100">🟡 Medium</ToggleGroupItem>
            <ToggleGroupItem value="low" className="data-[state=on]:bg-green-100">🟢 Low</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Age Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Vehicle Age</Label>
          <Select value={filters.ageRange} onValueChange={(v) => onFilterChange({ ageRange: v })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="0-2">0-2 years</SelectItem>
              <SelectItem value="2-5">2-5 years</SelectItem>
              <SelectItem value="5-10">5-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mileage Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Mileage</Label>
          <Select value={filters.mileageRange} onValueChange={(v) => onFilterChange({ mileageRange: v })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0-250">Under 250K</SelectItem>
              <SelectItem value="250-500">250K - 500K</SelectItem>
              <SelectItem value="500-750">500K - 750K</SelectItem>
              <SelectItem value="750+">750K+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* System Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">System</Label>
          <Select value={filters.system} onValueChange={(v) => onFilterChange({ system: v })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Systems" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Systems</SelectItem>
              <SelectItem value="engine">Engine</SelectItem>
              <SelectItem value="aftertreatment">Aftertreatment</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="brakes">Brakes</SelectItem>
              <SelectItem value="transmission">Transmission</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by VIN or Unit #..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="max-w-sm"
        />
        <Button variant="ghost" size="sm" onClick={() => onFilterChange(defaultFilters)}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile Adaptations

1. **Navigation**: Collapsible sidebar becomes bottom tab bar on mobile
2. **Tables**: Convert to card-based list view on small screens
3. **Filters**: Full-screen filter modal on mobile
4. **Charts**: Simplified views with swipe gestures
5. **Vehicle Detail**: Stacked layout instead of side-by-side

---

## Accessibility

### Requirements (WCAG 2.1 AA)

1. **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
2. **Focus Indicators**: Visible focus rings on all interactive elements
3. **Screen Reader**: Proper ARIA labels and landmarks
4. **Keyboard Navigation**: Full functionality without mouse
5. **Motion**: Respect `prefers-reduced-motion`

### Implementation

```tsx
// Example: Accessible button with proper contrast and focus
<Button
  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  aria-label="View vehicle details"
>
  View Details
</Button>

// Example: Screen reader announcements for alerts
<div role="alert" aria-live="assertive">
  {newAlerts.length} new critical alerts require attention
</div>

// Example: Skip link for keyboard users
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```
