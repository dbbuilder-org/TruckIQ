'use client';

import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HealthScore } from '@/components/dashboard/health-score';
import { RiskBadge } from '@/components/dashboard/risk-badge';
import { mockVehicles, mockFaultCodes, mockPredictions, mockAlerts } from '@/lib/data/mock-data';
import { ArrowLeft, Phone, Calendar, AlertTriangle, Wrench, Activity, History, Bell } from 'lucide-react';

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vehicle = mockVehicles.find((v) => v.id === id) || mockVehicles[0];
  const vehicleAlerts = mockAlerts.filter((a) => a.vehicleId === id);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'major': return 'border-l-orange-500 bg-orange-50';
      case 'minor': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/vehicles"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vehicles
      </Link>

      {/* Vehicle Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{vehicle.unitNumber}</h1>
                <RiskBadge level={vehicle.riskLevel} />
              </div>
              <p className="text-slate-600">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
              <p className="text-sm text-slate-500 font-mono">VIN: {vehicle.vin}</p>
              <p className="text-sm text-slate-500 mt-2">
                🔴 {vehicle.activeFaultCount} Active Faults ({vehicle.criticalFaultCount} Critical)
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-slate-600">Health Score</span>
              <HealthScore score={vehicle.healthScore} size="lg" showLabel />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold">{vehicle.currentOdometer.toLocaleString()}</p>
                <p className="text-xs text-slate-500">miles</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold">{vehicle.engineHours.toLocaleString()}</p>
                <p className="text-xs text-slate-500">eng hours</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold">14</p>
                <p className="text-xs text-slate-500">mo in service</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold">10</p>
                <p className="text-xs text-slate-500">mo warranty</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="faults" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Fault Codes
          </TabsTrigger>
          <TabsTrigger value="predictions" className="gap-2">
            <Wrench className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Service History
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Risk Assessment */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🔴</span>
                  <span className="text-xl font-bold text-red-600">CRITICAL RISK</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Primary Concern:</p>
                  <p className="text-slate-600">
                    DEF pump showing 87% failure probability within 14 days
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Contributing Factors:</p>
                  <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                    <li>Recurring DEF quality codes</li>
                    <li>Increased SCR inlet temperature</li>
                    <li>3 related faults in 30 days</li>
                  </ul>
                </div>
                <div className="text-sm text-slate-500">
                  Confidence: 82%
                </div>
              </CardContent>
            </Card>

            {/* Predicted Failures */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Predicted Failures (90 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPredictions.map((pred) => (
                    <div key={pred.component} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{pred.component}</span>
                        <span className="text-sm text-slate-600">
                          {Math.round(pred.probability30d * 100)}% / {Math.round(pred.probability60d * 100)}% / {Math.round(pred.probability90d * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={pred.probability30d * 100}
                        className={`h-2 ${pred.probability30d > 0.7 ? '[&>div]:bg-red-500' : pred.probability30d > 0.4 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔴</span>
                  <div className="flex-1">
                    <p className="font-medium text-red-900">IMMEDIATE: Schedule DEF pump inspection and replacement</p>
                    <p className="text-sm text-red-700 mt-1">Est. Cost: $800 - $1,200 | Est. Downtime: 4-6 hours</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🟠</span>
                  <div className="flex-1">
                    <p className="font-medium text-orange-900">URGENT: Inspect NOx sensor wiring and connections</p>
                    <p className="text-sm text-orange-700 mt-1">Related to active fault SPN 3226</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🟡</span>
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">MONITOR: Track SCR inlet temperatures</p>
                    <p className="text-sm text-yellow-700 mt-1">Trending 8% above normal</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button>
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Dealer
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fault Codes Tab */}
        <TabsContent value="faults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Fault Codes</CardTitle>
              <CardDescription>Current diagnostic trouble codes from the vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockFaultCodes.map((fault) => (
                <div
                  key={fault.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(fault.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-bold">
                        SPN {fault.spn} / FMI {fault.fmi}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{fault.description}</p>
                    </div>
                    <Badge variant={fault.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {fault.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-slate-500">
                    <span>First seen: {new Date(fault.firstSeenAt).toLocaleDateString()}</span>
                    <span>Occurrences: {fault.occurrenceCount}</span>
                  </div>
                  {fault.recommendedAction && (
                    <div className="mt-3 p-3 bg-white rounded border">
                      <p className="text-sm"><strong>Recommended:</strong> {fault.recommendedAction}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Failure Predictions</CardTitle>
              <CardDescription>AI-powered predictions based on vehicle data and fleet patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-slate-600">
                      <th className="text-left py-3 px-4">Component</th>
                      <th className="text-center py-3 px-4">30 Days</th>
                      <th className="text-center py-3 px-4">60 Days</th>
                      <th className="text-center py-3 px-4">90 Days</th>
                      <th className="text-center py-3 px-4">Confidence</th>
                      <th className="text-left py-3 px-4">Key Factors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPredictions.map((pred) => (
                      <tr key={pred.component} className="border-b">
                        <td className="py-3 px-4 font-medium">{pred.component}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${pred.probability30d > 0.7 ? 'text-red-600' : pred.probability30d > 0.4 ? 'text-orange-600' : 'text-green-600'}`}>
                            {Math.round(pred.probability30d * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${pred.probability60d > 0.7 ? 'text-red-600' : pred.probability60d > 0.4 ? 'text-orange-600' : 'text-green-600'}`}>
                            {Math.round(pred.probability60d * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`font-bold ${pred.probability90d > 0.7 ? 'text-red-600' : pred.probability90d > 0.4 ? 'text-orange-600' : 'text-green-600'}`}>
                            {Math.round(pred.probability90d * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">{Math.round(pred.confidence * 100)}%</td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {pred.factors.slice(0, 2).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service History</CardTitle>
              <CardDescription>Past maintenance and repair records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-slate-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Service history integration coming soon</p>
                <p className="text-sm">Connect with Decisiv SRM for complete records</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vehicle Alerts</CardTitle>
              <CardDescription>Active and historical alerts for this vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleAlerts.length > 0 ? (
                vehicleAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-50 border-red-200' : alert.severity === 'major' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                      </div>
                      <Badge variant={alert.status === 'active' ? 'default' : 'secondary'}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No alerts for this vehicle</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
