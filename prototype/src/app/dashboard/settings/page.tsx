'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Bell,
  Shield,
  RefreshCw,
  Mail,
  Smartphone,
  Clock,
  Database,
  Key,
  CheckCircle2,
  AlertTriangle,
  Settings as SettingsIcon,
  Plug,
} from 'lucide-react';

export default function SettingsPage() {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [predictionAlerts, setPredictionAlerts] = useState(true);
  const [pmAlerts, setPmAlerts] = useState(true);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your organization and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Organization</CardTitle>
              </div>
              <CardDescription>Manage your company profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company Name</label>
                  <Input defaultValue="Acme Trucking Co." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account ID</label>
                  <Input value="ACM-2024-001" disabled className="bg-slate-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Contact</label>
                  <Input defaultValue="mike.johnson@acmetrucking.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input defaultValue="(555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <Select defaultValue="america-los_angeles">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-los_angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="america-denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="america-chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="america-new_york">Eastern Time (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
              <CardDescription>Configure how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Channels */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Notification Channels</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="rounded"
                    />
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="rounded"
                    />
                    <Smartphone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">SMS</span>
                  </label>
                </div>
              </div>

              {/* Alert Types */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Alert Types</p>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔴</span>
                      <div>
                        <p className="font-medium text-sm">Critical Alerts</p>
                        <p className="text-xs text-slate-500">Immediate notification for critical faults</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={criticalAlerts}
                      onChange={(e) => setCriticalAlerts(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🧠</span>
                      <div>
                        <p className="font-medium text-sm">AI Predictions</p>
                        <p className="text-xs text-slate-500">High-risk failure predictions</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={predictionAlerts}
                      onChange={(e) => setPredictionAlerts(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔧</span>
                      <div>
                        <p className="font-medium text-sm">PM Reminders</p>
                        <p className="text-xs text-slate-500">Scheduled maintenance due alerts</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={pmAlerts}
                      onChange={(e) => setPmAlerts(e.target.checked)}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Integration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plug className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Data Integration</CardTitle>
              </div>
              <CardDescription>TruckTech+ connection and sync settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">TruckTech+ Connected</p>
                    <p className="text-sm text-green-700">Last sync: 15 minutes ago</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>

              {/* Sync Schedule */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sync Frequency</label>
                <Select defaultValue="15min">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="30min">Every 30 minutes</SelectItem>
                    <SelectItem value="1hour">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Credentials */}
              <div className="space-y-2">
                <label className="text-sm font-medium">TruckTech+ Username</label>
                <Input defaultValue="acme_fleet_admin" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">MFA Secret (TOTP)</label>
                <div className="flex gap-2">
                  <Input type="password" value="••••••••••••••••" readOnly className="bg-slate-50" />
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Base32 encoded secret for automated MFA</p>
              </div>

              <div className="flex justify-end">
                <Button>Save Connection</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plan & Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Current Plan</span>
                <Badge className="bg-blue-100 text-blue-800">Professional</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Vehicles</span>
                  <span className="font-medium">142 / 200</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Users</span>
                  <span className="font-medium">6 / 25</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">API Calls (this month)</span>
                  <span className="font-medium">45,231 / 100,000</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <Button variant="outline" className="w-full">Upgrade Plan</Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Security Audit Log
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Sync History
              </Button>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">Need help? Our support team is here for you.</p>
              <Button className="w-full">Contact Support</Button>
              <p className="text-xs text-slate-500 text-center">
                Or email: support@truckiq.ai
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
