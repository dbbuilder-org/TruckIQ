'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAlerts } from '@/lib/data/mock-data';
import { Bell, Check, X, Filter } from 'lucide-react';

export default function AlertsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'major': return 'bg-orange-50 border-orange-200';
      case 'minor': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'major': return '🟠';
      case 'minor': return '🟡';
      default: return '🔵';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'critical_fault': return 'Critical Fault';
      case 'high_risk_prediction': return 'Prediction';
      case 'pm_due': return 'PM Due';
      case 'warranty_expiring': return 'Warranty';
      default: return type;
    }
  };

  const criticalCount = mockAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const activeCount = mockAlerts.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="text-slate-600">Monitor and manage fleet alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {criticalCount} Critical
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {activeCount} Active
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔴</span>
              <div>
                <p className="text-2xl font-bold">{mockAlerts.filter(a => a.severity === 'critical').length}</p>
                <p className="text-sm text-slate-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟠</span>
              <div>
                <p className="text-2xl font-bold">{mockAlerts.filter(a => a.severity === 'major').length}</p>
                <p className="text-sm text-slate-600">Major</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="text-2xl font-bold">{mockAlerts.filter(a => a.severity === 'minor').length}</p>
                <p className="text-sm text-slate-600">Minor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-2xl font-bold">{mockAlerts.filter(a => a.status === 'resolved').length}</p>
                <p className="text-sm text-slate-600">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="critical_fault">Critical Fault</SelectItem>
                <SelectItem value="high_risk_prediction">Prediction</SelectItem>
                <SelectItem value="pm_due">PM Due</SelectItem>
                <SelectItem value="warranty_expiring">Warranty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`border ${getSeverityColor(alert.severity)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/vehicles/${alert.vehicleId}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {alert.vehicleUnit}
                      </Link>
                      <Badge variant="outline">{getTypeLabel(alert.type)}</Badge>
                      <Badge
                        variant={alert.status === 'active' ? 'default' : 'secondary'}
                      >
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900">{alert.title}</p>
                    <p className="text-sm text-slate-600">{alert.message}</p>
                    <p className="text-xs text-slate-500">
                      Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {alert.status === 'active' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Check className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="ghost">
                      <X className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No alerts match your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
