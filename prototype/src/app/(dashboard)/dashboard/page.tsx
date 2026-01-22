'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { HealthScore } from '@/components/dashboard/health-score';
import { RiskBadge } from '@/components/dashboard/risk-badge';
import { mockVehicles, mockAlerts, mockDashboardStats, mockHealthDistribution, mockRiskTrend } from '@/lib/data/mock-data';
import { Truck, AlertTriangle, Bell, Wrench, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function DashboardPage() {
  const atRiskVehicles = mockVehicles.filter(v => v.riskLevel === 'high' || v.riskLevel === 'critical');
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fleet Dashboard</h1>
        <p className="text-slate-600">Overview of your fleet health and alerts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vehicles"
          value={mockDashboardStats.totalVehicles}
          subtitle="+3 this month"
          icon={Truck}
        />
        <StatCard
          title="At Risk"
          value={mockDashboardStats.atRiskVehicles}
          subtitle="🔴 3 critical"
          icon={AlertTriangle}
          className="border-l-4 border-l-orange-500"
        />
        <StatCard
          title="Active Alerts"
          value={mockDashboardStats.activeAlerts}
          subtitle="🔴 2 critical"
          icon={Bell}
          className="border-l-4 border-l-red-500"
        />
        <StatCard
          title="PM Due This Week"
          value={mockDashboardStats.pmDueThisWeek}
          subtitle="🟡 5 overdue"
          icon={Wrench}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fleet Health Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockHealthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {mockHealthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {mockHealthDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Trends (90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockRiskTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Avg Health Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="atRisk"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="At Risk Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Critical Alerts</CardTitle>
          <Link href="/dashboard/alerts" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔴</span>
                  <div>
                    <p className="font-medium text-slate-900">{alert.vehicleUnit}</p>
                    <p className="text-sm text-slate-600">{alert.title}</p>
                  </div>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Requiring Attention */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Vehicles Requiring Attention</CardTitle>
          <Link href="/dashboard/vehicles?risk=high,critical" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-slate-600">
                  <th className="text-left py-3 px-4">Unit</th>
                  <th className="text-left py-3 px-4">Health</th>
                  <th className="text-left py-3 px-4">Risk</th>
                  <th className="text-left py-3 px-4">Active Faults</th>
                  <th className="text-left py-3 px-4">Next Service</th>
                </tr>
              </thead>
              <tbody>
                {atRiskVehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-blue-600 hover:underline font-medium">
                        {vehicle.unitNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <HealthScore score={vehicle.healthScore} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={vehicle.riskLevel} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-900">
                        {vehicle.activeFaultCount} ({vehicle.criticalFaultCount} critical)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600">DEF Pump - 14d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
