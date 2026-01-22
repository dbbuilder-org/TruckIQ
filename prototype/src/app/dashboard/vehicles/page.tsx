'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HealthScore } from '@/components/dashboard/health-score';
import { RiskBadge } from '@/components/dashboard/risk-badge';
import { mockVehicles, type Vehicle, type RiskLevel } from '@/lib/data/mock-data';
import { Search, Filter, Download, Plus, X } from 'lucide-react';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [mileageFilter, setMileageFilter] = useState<string>('all');

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !vehicle.vin.toLowerCase().includes(searchLower) &&
        !vehicle.unitNumber.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    // Risk filter
    if (riskFilter !== 'all' && vehicle.riskLevel !== riskFilter) {
      return false;
    }

    // Age filter
    if (ageFilter !== 'all') {
      const age = new Date().getFullYear() - vehicle.year;
      if (ageFilter === '0-2' && age > 2) return false;
      if (ageFilter === '2-5' && (age < 2 || age > 5)) return false;
      if (ageFilter === '5-10' && (age < 5 || age > 10)) return false;
      if (ageFilter === '10+' && age < 10) return false;
    }

    // Mileage filter
    if (mileageFilter !== 'all') {
      const miles = vehicle.currentOdometer;
      if (mileageFilter === '0-250' && miles > 250000) return false;
      if (mileageFilter === '250-500' && (miles < 250000 || miles > 500000)) return false;
      if (mileageFilter === '500-750' && (miles < 500000 || miles > 750000)) return false;
      if (mileageFilter === '750+' && miles < 750000) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('all');
    setAgeFilter('all');
    setMileageFilter('all');
  };

  const hasActiveFilters = search || riskFilter !== 'all' || ageFilter !== 'all' || mileageFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
          <p className="text-slate-600">Manage and monitor your fleet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
              {/* Risk Level */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Risk Level</label>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">🔴 Critical</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Vehicle Age</label>
                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
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

              {/* Mileage */}
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Mileage</label>
                <Select value={mileageFilter} onValueChange={setMileageFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
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
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by VIN or Unit #..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {filteredVehicles.length} of {mockVehicles.length} vehicles
      </div>

      {/* Vehicle Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-sm text-slate-600">
                  <th className="text-left py-3 px-4 font-medium">Unit</th>
                  <th className="text-left py-3 px-4 font-medium">VIN</th>
                  <th className="text-left py-3 px-4 font-medium">Year</th>
                  <th className="text-left py-3 px-4 font-medium">Model</th>
                  <th className="text-left py-3 px-4 font-medium">Mileage</th>
                  <th className="text-left py-3 px-4 font-medium">Health</th>
                  <th className="text-left py-3 px-4 font-medium">Risk</th>
                  <th className="text-left py-3 px-4 font-medium">Faults</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {vehicle.unitNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-slate-600">
                      {vehicle.vin.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">{vehicle.year}</td>
                    <td className="py-3 px-4">{vehicle.model}</td>
                    <td className="py-3 px-4">{vehicle.currentOdometer.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <HealthScore score={vehicle.healthScore} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge level={vehicle.riskLevel} />
                    </td>
                    <td className="py-3 px-4">
                      {vehicle.activeFaultCount > 0 ? (
                        <span className="text-slate-900">
                          {vehicle.activeFaultCount}
                          {vehicle.criticalFaultCount > 0 && (
                            <span className="text-red-600 ml-1">
                              ({vehicle.criticalFaultCount} crit)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
