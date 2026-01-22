'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockReports, mockFinancialSummary } from '@/lib/data/mock-data';
import {
  BarChart3,
  Activity,
  Brain,
  AlertTriangle,
  Calendar,
  DollarSign,
  Shield,
  FileCheck,
  Wrench,
  Search,
  Download,
  Mail,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Play,
  FileText,
  RefreshCw,
  MessageSquare,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Activity,
  Brain,
  AlertTriangle,
  Calendar,
  DollarSign,
  Shield,
  FileCheck,
  Wrench,
};

const categoryColors: Record<string, string> = {
  fleet: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-green-100 text-green-800',
  financial: 'bg-purple-100 text-purple-800',
  compliance: 'bg-orange-100 text-orange-800',
};

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredReports = mockReports.filter((report) => {
    if (search && !report.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && report.category !== categoryFilter) return false;
    return true;
  });

  const formatLastRun = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600">AI-powered insights for your fleet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        </div>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">AI Weekly Summary</h3>
                <p className="text-blue-100 mb-3 max-w-2xl">
                  Based on this week&apos;s data: <strong>3 vehicles require immediate attention</strong> with high-risk
                  DEF system predictions. Fleet health declined 2.1% - primarily driven by aftertreatment
                  faults in vehicles over 400K miles. Recommended action: Schedule preventive DEF pump
                  replacements for T-2045, T-1892, and T-3401.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Follow-up
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Download className="h-4 w-4 mr-2" />
                    Export Summary
                  </Button>
                </div>
              </div>
            </div>
            <Badge className="bg-white/20 text-white">
              <Zap className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Downtime Avoided</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(mockFinancialSummary.downtimeAvoided / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">YTD savings from predictive maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Prediction Accuracy</p>
                <p className="text-2xl font-bold">{Math.round(mockFinancialSummary.actualVsPredicted * 100)}%</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">30-day failure prediction accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cost Per Mile</p>
                <p className="text-2xl font-bold">${mockFinancialSummary.costPerMile.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {Math.abs(mockFinancialSummary.costPerMileTrend).toFixed(2)} vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">90-Day Forecast</p>
                <p className="text-2xl font-bold">${(mockFinancialSummary.predictedMaintenance90d / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Predicted maintenance spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Report Categories */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Health</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => {
              const Icon = iconMap[report.icon] || BarChart3;
              return (
                <Card key={report.id} className="hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${categoryColors[report.category].split(' ')[0]}`}>
                        <Icon className={`h-6 w-6 ${categoryColors[report.category].split(' ')[1]}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {report.name}
                              {report.aiInsights && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </h3>
                            <Badge className={categoryColors[report.category]} variant="secondary">
                              {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatLastRun(report.lastRun)}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              {report.frequency}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/dashboard/reports/${report.id}`}>
                              <Button size="sm">
                                <Play className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {['fleet', 'maintenance', 'financial', 'compliance'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockReports
                .filter((r) => r.category === category)
                .map((report) => {
                  const Icon = iconMap[report.icon] || BarChart3;
                  return (
                    <Card key={report.id} className="hover:border-blue-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${categoryColors[report.category].split(' ')[0]}`}>
                            <Icon className={`h-6 w-6 ${categoryColors[report.category].split(' ')[1]}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                  {report.name}
                                  {report.aiInsights && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </h3>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatLastRun(report.lastRun)}
                                </span>
                              </div>
                              <Link href={`/dashboard/reports/${report.id}`}>
                                <Button size="sm">
                                  View Report
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Scheduled Reports</CardTitle>
              <CardDescription>Automated report delivery</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Fleet Health Overview</p>
                  <p className="text-sm text-slate-500">Daily at 6:00 AM PT</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">mike.johnson@acme.com</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Financial Impact Summary</p>
                  <p className="text-sm text-slate-500">Weekly on Mondays</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">leadership@acme.com</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Critical Alerts Digest</p>
                  <p className="text-sm text-slate-500">Real-time (as they occur)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">ops-team@acme.com</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Natural Language Query */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Ask TruckIQ AI
          </CardTitle>
          <CardDescription>Get instant answers about your fleet data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Which trucks are most likely to fail in the next 30 days?"
              className="flex-1"
            />
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Ask
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Show me high-risk aftertreatment systems
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Compare fleet health vs last month
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
              Which vehicles need immediate attention?
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
