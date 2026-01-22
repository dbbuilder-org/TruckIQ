// Mock data for TruckIQ AI Prototype

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Vehicle {
  id: string;
  vin: string;
  unitNumber: string;
  year: number;
  make: string;
  model: string;
  engineMake: string;
  engineModel: string;
  currentOdometer: number;
  engineHours: number;
  healthScore: number;
  riskLevel: RiskLevel;
  activeFaultCount: number;
  criticalFaultCount: number;
  lastSyncAt: string;
  inServiceDate: string;
  warrantyExpiry: string;
}

export interface FaultCode {
  id: string;
  vehicleId: string;
  spn: number;
  fmi: number;
  sourceAddress: number;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  status: 'active' | 'inactive' | 'resolved';
  firstSeenAt: string;
  lastSeenAt: string;
  occurrenceCount: number;
  recommendedAction?: string;
}

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleUnit: string;
  type: 'critical_fault' | 'high_risk_prediction' | 'pm_due' | 'warranty_expiring';
  severity: 'critical' | 'major' | 'minor';
  status: 'active' | 'acknowledged' | 'resolved';
  title: string;
  message: string;
  triggeredAt: string;
}

export interface Prediction {
  component: string;
  probability30d: number;
  probability60d: number;
  probability90d: number;
  confidence: number;
  factors: string[];
}

export interface Fleet {
  id: string;
  name: string;
  vehicleCount: number;
  avgHealthScore: number;
  criticalAlerts: number;
  highRiskCount: number;
  estimatedServiceValue: number;
}

// Sample Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    vin: '1XKAD49X0NJ123456',
    unitNumber: 'T-2045',
    year: 2023,
    make: 'Kenworth',
    model: 'T680',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 145678,
    engineHours: 4521,
    healthScore: 47,
    riskLevel: 'critical',
    activeFaultCount: 3,
    criticalFaultCount: 1,
    lastSyncAt: '2026-01-21T10:30:00Z',
    inServiceDate: '2023-03-15',
    warrantyExpiry: '2027-03-15',
  },
  {
    id: 'v2',
    vin: '1XKYD40X4NJ345678',
    unitNumber: 'T-1892',
    year: 2022,
    make: 'Kenworth',
    model: 'T880',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 287432,
    engineHours: 8934,
    healthScore: 52,
    riskLevel: 'high',
    activeFaultCount: 2,
    criticalFaultCount: 1,
    lastSyncAt: '2026-01-21T09:15:00Z',
    inServiceDate: '2022-06-20',
    warrantyExpiry: '2026-06-20',
  },
  {
    id: 'v3',
    vin: '1XPWD40X9NJ567890',
    unitNumber: 'T-3401',
    year: 2024,
    make: 'Kenworth',
    model: 'T680',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 52891,
    engineHours: 1654,
    healthScore: 61,
    riskLevel: 'medium',
    activeFaultCount: 1,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T11:00:00Z',
    inServiceDate: '2024-01-10',
    warrantyExpiry: '2028-01-10',
  },
  {
    id: 'v4',
    vin: '1XKAD49X2MJ789012',
    unitNumber: 'T-2876',
    year: 2021,
    make: 'Kenworth',
    model: 'T680',
    engineMake: 'Cummins',
    engineModel: 'ISX15',
    currentOdometer: 412567,
    engineHours: 12890,
    healthScore: 68,
    riskLevel: 'medium',
    activeFaultCount: 2,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T08:45:00Z',
    inServiceDate: '2021-09-05',
    warrantyExpiry: '2025-09-05',
  },
  {
    id: 'v5',
    vin: '1XKYD40X6MJ901234',
    unitNumber: 'T-1543',
    year: 2020,
    make: 'Kenworth',
    model: 'T880',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 523891,
    engineHours: 16234,
    healthScore: 71,
    riskLevel: 'medium',
    activeFaultCount: 1,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T10:00:00Z',
    inServiceDate: '2020-04-12',
    warrantyExpiry: '2024-04-12',
  },
  {
    id: 'v6',
    vin: '1XPWD40X8LJ123456',
    unitNumber: 'T-4521',
    year: 2019,
    make: 'Kenworth',
    model: 'W990',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 634215,
    engineHours: 19567,
    healthScore: 82,
    riskLevel: 'low',
    activeFaultCount: 0,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T09:30:00Z',
    inServiceDate: '2019-08-22',
    warrantyExpiry: '2023-08-22',
  },
  {
    id: 'v7',
    vin: '1XKAD49X0LJ345678',
    unitNumber: 'T-2198',
    year: 2023,
    make: 'Kenworth',
    model: 'T680',
    engineMake: 'PACCAR',
    engineModel: 'MX-13',
    currentOdometer: 98765,
    engineHours: 3089,
    healthScore: 89,
    riskLevel: 'low',
    activeFaultCount: 0,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T11:15:00Z',
    inServiceDate: '2023-07-01',
    warrantyExpiry: '2027-07-01',
  },
  {
    id: 'v8',
    vin: '1XKYD40X2KJ567890',
    unitNumber: 'T-3876',
    year: 2022,
    make: 'Kenworth',
    model: 'T880',
    engineMake: 'Cummins',
    engineModel: 'ISX15',
    currentOdometer: 176543,
    engineHours: 5498,
    healthScore: 91,
    riskLevel: 'low',
    activeFaultCount: 0,
    criticalFaultCount: 0,
    lastSyncAt: '2026-01-21T10:45:00Z',
    inServiceDate: '2022-02-28',
    warrantyExpiry: '2026-02-28',
  },
];

// Sample Fault Codes for Vehicle T-2045
export const mockFaultCodes: FaultCode[] = [
  {
    id: 'f1',
    vehicleId: 'v1',
    spn: 3226,
    fmi: 4,
    sourceAddress: 0,
    description: 'Aftertreatment 1 Intake NOx Sensor - Voltage Below Normal',
    severity: 'critical',
    status: 'active',
    firstSeenAt: '2026-01-15T08:00:00Z',
    lastSeenAt: '2026-01-21T10:30:00Z',
    occurrenceCount: 3,
    recommendedAction: 'Inspect NOx sensor wiring and connections. Check for corroded pins or damaged harness. Test sensor output voltage.',
  },
  {
    id: 'f2',
    vehicleId: 'v1',
    spn: 3216,
    fmi: 3,
    sourceAddress: 0,
    description: 'DEF Tank Level Sensor - Voltage Above Normal',
    severity: 'major',
    status: 'active',
    firstSeenAt: '2026-01-18T14:00:00Z',
    lastSeenAt: '2026-01-21T09:00:00Z',
    occurrenceCount: 2,
    recommendedAction: 'Check DEF tank level sensor connector. Verify DEF fluid level is adequate. Test sensor circuit.',
  },
  {
    id: 'f3',
    vehicleId: 'v1',
    spn: 4094,
    fmi: 31,
    sourceAddress: 0,
    description: 'NOx Limits Exceeded Due to Insufficient DEF Quality',
    severity: 'minor',
    status: 'active',
    firstSeenAt: '2026-01-20T16:00:00Z',
    lastSeenAt: '2026-01-21T08:00:00Z',
    occurrenceCount: 1,
    recommendedAction: 'Test DEF quality with refractometer. If below spec, drain and refill with fresh DEF from certified supplier.',
  },
];

// Sample Predictions for Vehicle T-2045
export const mockPredictions: Prediction[] = [
  {
    component: 'DEF Pump',
    probability30d: 0.87,
    probability60d: 0.92,
    probability90d: 0.96,
    confidence: 0.82,
    factors: ['Recurring DEF quality codes', 'Increased SCR inlet temperature', '3 related faults in 30 days'],
  },
  {
    component: 'NOx Sensor',
    probability30d: 0.42,
    probability60d: 0.58,
    probability90d: 0.71,
    confidence: 0.75,
    factors: ['Active voltage fault', 'Sensor age (14 months)', 'High duty cycle usage'],
  },
  {
    component: 'Turbocharger',
    probability30d: 0.15,
    probability60d: 0.23,
    probability90d: 0.35,
    confidence: 0.68,
    factors: ['Normal wear pattern', 'Mileage within expected range'],
  },
  {
    component: 'DPF System',
    probability30d: 0.08,
    probability60d: 0.12,
    probability90d: 0.18,
    confidence: 0.71,
    factors: ['Regular regeneration cycles', 'Soot load within spec'],
  },
];

// Sample Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    vehicleId: 'v1',
    vehicleUnit: 'T-2045',
    type: 'high_risk_prediction',
    severity: 'critical',
    status: 'active',
    title: 'DEF Pump Failure Predicted',
    message: '87% probability of failure within 14 days. Schedule immediate inspection.',
    triggeredAt: '2026-01-21T08:00:00Z',
  },
  {
    id: 'a2',
    vehicleId: 'v1',
    vehicleUnit: 'T-2045',
    type: 'critical_fault',
    severity: 'critical',
    status: 'active',
    title: 'Active Critical Fault: SPN 3226',
    message: 'NOx Sensor voltage below normal. Derate may occur if not addressed.',
    triggeredAt: '2026-01-21T10:30:00Z',
  },
  {
    id: 'a3',
    vehicleId: 'v2',
    vehicleUnit: 'T-1892',
    type: 'critical_fault',
    severity: 'critical',
    status: 'active',
    title: 'Active Critical Fault: Turbo Actuator',
    message: 'Turbocharger VGT actuator showing intermittent response.',
    triggeredAt: '2026-01-20T14:00:00Z',
  },
  {
    id: 'a4',
    vehicleId: 'v3',
    vehicleUnit: 'T-3401',
    type: 'high_risk_prediction',
    severity: 'major',
    status: 'active',
    title: 'NOx Sensor Anomaly Detected',
    message: 'Unusual sensor readings detected. Monitor for 48 hours.',
    triggeredAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'a5',
    vehicleId: 'v4',
    vehicleUnit: 'T-2876',
    type: 'pm_due',
    severity: 'minor',
    status: 'active',
    title: 'PM-B Service Due',
    message: 'Scheduled PM-B service due in 3 days or 2,500 miles.',
    triggeredAt: '2026-01-19T08:00:00Z',
  },
  {
    id: 'a6',
    vehicleId: 'v5',
    vehicleUnit: 'T-1543',
    type: 'warranty_expiring',
    severity: 'minor',
    status: 'active',
    title: 'Warranty Expired',
    message: 'Extended warranty expired April 2024. Consider renewal options.',
    triggeredAt: '2026-01-18T08:00:00Z',
  },
];

// Sample Fleets for Dealer View
export const mockFleets: Fleet[] = [
  {
    id: 'fleet1',
    name: 'Acme Trucking Co.',
    vehicleCount: 142,
    avgHealthScore: 72,
    criticalAlerts: 3,
    highRiskCount: 12,
    estimatedServiceValue: 45200,
  },
  {
    id: 'fleet2',
    name: 'FastFreight LLC',
    vehicleCount: 89,
    avgHealthScore: 81,
    criticalAlerts: 1,
    highRiskCount: 5,
    estimatedServiceValue: 23100,
  },
  {
    id: 'fleet3',
    name: 'Mountain Transport',
    vehicleCount: 234,
    avgHealthScore: 68,
    criticalAlerts: 8,
    highRiskCount: 19,
    estimatedServiceValue: 78500,
  },
  {
    id: 'fleet4',
    name: 'Coastal Logistics',
    vehicleCount: 67,
    avgHealthScore: 85,
    criticalAlerts: 0,
    highRiskCount: 3,
    estimatedServiceValue: 12800,
  },
  {
    id: 'fleet5',
    name: 'Valley Haulers',
    vehicleCount: 98,
    avgHealthScore: 74,
    criticalAlerts: 4,
    highRiskCount: 8,
    estimatedServiceValue: 34600,
  },
];

// Dashboard Stats
export const mockDashboardStats = {
  totalVehicles: 142,
  atRiskVehicles: 12,
  activeAlerts: 7,
  pmDueThisWeek: 15,
  criticalAlerts: 3,
  overdueServices: 5,
};

// Health Distribution
export const mockHealthDistribution = [
  { name: 'Healthy (80+)', value: 72, color: '#22c55e' },
  { name: 'Warning (60-79)', value: 18, color: '#84cc16' },
  { name: 'At Risk (40-59)', value: 8, color: '#eab308' },
  { name: 'Critical (<40)', value: 2, color: '#ef4444' },
];

// Risk Trend Data
export const mockRiskTrend = [
  { date: 'Oct', avgScore: 78, atRisk: 8 },
  { date: 'Nov', avgScore: 76, atRisk: 10 },
  { date: 'Dec', avgScore: 74, atRisk: 11 },
  { date: 'Jan', avgScore: 72, atRisk: 12 },
];

// Spec Documents for Landing Page
export const specDocuments = [
  {
    title: 'Product Vision',
    description: 'Market opportunity, target users, and product strategy for TruckIQ AI.',
    href: '/docs/specs/PRODUCT_VISION.md',
    icon: 'Target',
  },
  {
    title: 'Requirements',
    description: 'Functional requirements, user stories, and acceptance criteria.',
    href: '/docs/specs/REQUIREMENTS.md',
    icon: 'ClipboardList',
  },
  {
    title: 'Architecture',
    description: 'System design, technology stack, and data flow diagrams.',
    href: '/docs/specs/ARCHITECTURE.md',
    icon: 'Network',
  },
  {
    title: 'Database Schema',
    description: 'Prisma schema with multi-tenant RLS policies.',
    href: '/docs/specs/DATABASE_SCHEMA.md',
    icon: 'Database',
  },
  {
    title: 'Data Integration',
    description: 'TruckTech+ scraping strategy with MFA automation.',
    href: '/docs/specs/DATA_INTEGRATION.md',
    icon: 'RefreshCw',
  },
  {
    title: 'AI/ML Specification',
    description: 'Predictive maintenance models and risk scoring algorithms.',
    href: '/docs/specs/AI_ML_SPECIFICATION.md',
    icon: 'Brain',
  },
  {
    title: 'UI/UX Specification',
    description: 'Dashboard designs, components, and interaction patterns.',
    href: '/docs/specs/UI_UX_SPECIFICATION.md',
    icon: 'Layout',
  },
  {
    title: 'Security & Multi-Tenancy',
    description: 'RBAC, RLS policies, and tenant isolation strategy.',
    href: '/docs/specs/SECURITY_MULTI_TENANCY.md',
    icon: 'Shield',
  },
  {
    title: 'MVP Roadmap',
    description: 'Development phases, milestones, and acceptance criteria.',
    href: '/docs/specs/MVP_ROADMAP.md',
    icon: 'Map',
  },
  {
    title: 'Bibliography',
    description: 'Research sources, competitor analysis, and references.',
    href: '/docs/specs/BIBLIOGRAPHY.md',
    icon: 'BookOpen',
  },
];
