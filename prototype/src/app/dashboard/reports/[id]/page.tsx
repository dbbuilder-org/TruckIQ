'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  mockReports,
  mockFleetHealthTrend,
  mockComponentFailures,
  mockFaultsBySystem,
  mockVehicles,
} from '@/lib/data/mock-data';
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Truck,
  Target,
  BarChart3,
  PieChart,
  FileText,
  Mail,
  Printer,
  ChevronRight,
} from 'lucide-react';

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const report = mockReports.find((r) => r.id === id) || mockReports[0];

  // Get at-risk vehicles
  const criticalVehicles = mockVehicles.filter(v => v.riskLevel === 'critical' || v.riskLevel === 'high');
  const latestTrend = mockFleetHealthTrend[mockFleetHealthTrend.length - 1];
  const previousTrend = mockFleetHealthTrend[mockFleetHealthTrend.length - 2];
  const healthChange = latestTrend.avgScore - previousTrend.avgScore;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Link>

      {/* Report Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{report.name}</h1>
            {report.aiInsights && (
              <Badge className="bg-blue-100 text-blue-800">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
          <p className="text-slate-600">{report.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last updated: {report.lastRun ? new Date(report.lastRun).toLocaleString() : 'Never'}
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              {report.frequency}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* AI Summary Card */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">AI Analysis Summary</h3>
              <p className="text-slate-300 mb-4">
                Fleet health score has <strong>{healthChange < 0 ? 'declined' : 'improved'} by {Math.abs(healthChange)} points</strong> this month.
                The primary drivers are:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span><strong>3 vehicles moved to critical status</strong> - primarily aftertreatment-related issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span><strong>DEF system failures up 23%</strong> - consider fleet-wide preventive replacement for units over 400K miles</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span><strong>DPF system health improving</strong> - new regeneration schedule showing positive results</span>
                </li>
              </ul>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm">View Recommended Actions</Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Ask Follow-up</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Fleet Health Score</span>
              <Badge className={healthChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {healthChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {healthChange >= 0 ? '+' : ''}{healthChange}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{latestTrend.avgScore}%</p>
            <Progress
              value={latestTrend.avgScore}
              className={`h-2 mt-2 ${latestTrend.avgScore >= 70 ? '[&>div]:bg-green-500' : latestTrend.avgScore >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
            />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Critical Vehicles</span>
              <span className="text-2xl">🔴</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{latestTrend.critical}</p>
            <p className="text-xs text-slate-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">High Risk</span>
              <span className="text-2xl">🟠</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{latestTrend.high}</p>
            <p className="text-xs text-slate-500 mt-1">Monitor closely</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Healthy</span>
              <span className="text-2xl">🟢</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{latestTrend.low}</p>
            <p className="text-xs text-slate-500 mt-1">Operating normally</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Health Score Trend</CardTitle>
                <CardDescription>6-month fleet health overview</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simplified chart visualization */}
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {mockFleetHealthTrend.map((data, i) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t transition-all ${i === mockFleetHealthTrend.length - 1 ? 'bg-blue-500' : 'bg-blue-300'}`}
                    style={{ height: `${(data.avgScore / 100) * 200}px` }}
                  />
                  <span className="text-xs text-slate-500">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                Current Month
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-300 rounded" />
                Previous Months
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Risk Distribution</CardTitle>
                <CardDescription>Current fleet status breakdown</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              {/* Simplified donut chart */}
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="330 440" transform="rotate(-90 90 90)" />
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#eab308" strokeWidth="20" strokeDasharray="80 440" strokeDashoffset="-330" transform="rotate(-90 90 90)" />
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="40 440" strokeDashoffset="-410" transform="rotate(-90 90 90)" />
                  <circle cx="90" cy="90" r="70" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="10 440" strokeDashoffset="-430" transform="rotate(-90 90 90)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">142</span>
                  <span className="text-sm text-slate-500">vehicles</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm">Low Risk: {latestTrend.low}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span className="text-sm">Medium: {latestTrend.medium}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-sm">High: {latestTrend.high}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm">Critical: {latestTrend.critical}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Failures Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Component Failures</CardTitle>
              <CardDescription>Most frequent failures in the last 90 days</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-sm text-slate-600">
                  <th className="text-left py-3 px-4 font-medium">Component</th>
                  <th className="text-center py-3 px-4 font-medium">Failures</th>
                  <th className="text-center py-3 px-4 font-medium">Avg Cost</th>
                  <th className="text-center py-3 px-4 font-medium">Trend</th>
                  <th className="text-center py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockComponentFailures.map((component) => (
                  <tr key={component.component} className="border-b">
                    <td className="py-3 px-4 font-medium">{component.component}</td>
                    <td className="py-3 px-4 text-center">{component.count}</td>
                    <td className="py-3 px-4 text-center">${component.avgCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      {component.trend === 'up' && (
                        <Badge className="bg-red-100 text-red-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Up
                        </Badge>
                      )}
                      {component.trend === 'down' && (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Down
                        </Badge>
                      )}
                      {component.trend === 'stable' && (
                        <Badge className="bg-slate-100 text-slate-800">
                          Stable
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Vehicles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vehicles Requiring Attention</CardTitle>
              <CardDescription>Critical and high-risk vehicles</CardDescription>
            </div>
            <Link href="/dashboard/vehicles?risk=critical,high">
              <Button variant="outline" size="sm">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalVehicles.slice(0, 4).map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${vehicle.riskLevel === 'critical' ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <Truck className={`h-5 w-5 ${vehicle.riskLevel === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <Link href={`/dashboard/vehicles/${vehicle.id}`} className="font-medium text-blue-600 hover:underline">
                      {vehicle.unitNumber}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {vehicle.year} {vehicle.make} {vehicle.model} • {vehicle.currentOdometer.toLocaleString()} mi
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${vehicle.healthScore < 50 ? 'text-red-600' : 'text-orange-600'}`}>
                      {vehicle.healthScore}%
                    </p>
                    <p className="text-xs text-slate-500">Health Score</p>
                  </div>
                  <Badge className={vehicle.riskLevel === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                    {vehicle.riskLevel === 'critical' ? '🔴 Critical' : '🟠 High'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export & Share</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <FileText className="h-6 w-6 mb-2 text-blue-600" />
              <span>PDF Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <BarChart3 className="h-6 w-6 mb-2 text-green-600" />
              <span>Excel Data</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Mail className="h-6 w-6 mb-2 text-purple-600" />
              <span>Email Report</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <Printer className="h-6 w-6 mb-2 text-slate-600" />
              <span>Print</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
