'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockFleets } from '@/lib/data/mock-data';
import { Building2, Truck, AlertTriangle, DollarSign, ChevronRight, Plus, Phone, FileText } from 'lucide-react';

export default function DealerDashboardPage() {
  const totalVehicles = mockFleets.reduce((acc, f) => acc + f.vehicleCount, 0);
  const totalCritical = mockFleets.reduce((acc, f) => acc + f.criticalAlerts, 0);
  const totalHighRisk = mockFleets.reduce((acc, f) => acc + f.highRiskCount, 0);
  const totalServiceValue = mockFleets.reduce((acc, f) => acc + f.estimatedServiceValue, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dealer Dashboard</h1>
          <p className="text-slate-600">Multi-fleet overview for Metro Kenworth</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Fleet
        </Button>
      </div>

      {/* Service Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalVehicles}</p>
                <p className="text-sm text-slate-600">Total Monitored</p>
                <p className="text-xs text-slate-500">{mockFleets.length} fleets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalCritical}</p>
                <p className="text-sm text-slate-600">Critical Alerts</p>
                <p className="text-xs text-slate-500">{mockFleets.filter(f => f.criticalAlerts > 0).length} fleets affected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalHighRisk}</p>
                <p className="text-sm text-slate-600">Predicted Failures</p>
                <p className="text-xs text-slate-500">Next 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold">${(totalServiceValue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-slate-600">Service Pipeline</p>
                <p className="text-xs text-slate-500">Estimated 90-day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Fleets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Customer Fleets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-sm text-slate-600">
                  <th className="text-left py-3 px-4 font-medium">Fleet Name</th>
                  <th className="text-center py-3 px-4 font-medium">Vehicles</th>
                  <th className="text-center py-3 px-4 font-medium">Health</th>
                  <th className="text-center py-3 px-4 font-medium">Critical</th>
                  <th className="text-center py-3 px-4 font-medium">High Risk</th>
                  <th className="text-right py-3 px-4 font-medium">Est. Service $</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockFleets.map((fleet) => (
                  <tr key={fleet.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-slate-200 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium">{fleet.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">{fleet.vehicleCount}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress
                          value={fleet.avgHealthScore}
                          className={`w-20 h-2 ${fleet.avgHealthScore >= 80 ? '[&>div]:bg-green-500' : fleet.avgHealthScore >= 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                        />
                        <span className="text-sm font-medium">{fleet.avgHealthScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {fleet.criticalAlerts > 0 ? (
                        <span className="text-red-600 font-bold">{fleet.criticalAlerts}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {fleet.highRiskCount > 0 ? (
                        <span className="text-orange-600 font-medium">{fleet.highRiskCount}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${fleet.estimatedServiceValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicted Service Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Predicted Service Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Next 30 Days</span>
              <span className="text-2xl font-bold">$187,400</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Next 60 Days</span>
              <span className="text-2xl font-bold">$342,100</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Next 90 Days</span>
              <span className="text-2xl font-bold">$498,700</span>
            </div>
            <Button variant="outline" className="w-full">
              View Breakdown
            </Button>
          </CardContent>
        </Card>

        {/* Outreach Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outreach Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔴</span>
                <div>
                  <p className="font-medium text-red-900">3 trucks with critical risk</p>
                  <p className="text-sm text-red-700">Not scheduled for service</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🟡</span>
                <div>
                  <p className="font-medium text-yellow-900">12 trucks PM overdue</p>
                  <p className="text-sm text-yellow-700">No appointment booked</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-medium text-blue-900">8 warranty expirations in 30d</p>
                  <p className="text-sm text-blue-700">Schedule inspection</p>
                </div>
              </div>
            </div>
            <Button className="w-full">
              Generate Outreach List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
