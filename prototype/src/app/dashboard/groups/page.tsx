'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockGroups } from '@/lib/data/mock-data';
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Truck,
  MapPin,
  Wrench,
  Users,
  Tag,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  region: MapPin,
  shop: Wrench,
  customer: Users,
  custom: Tag,
};

const typeColors: Record<string, string> = {
  region: 'bg-blue-100 text-blue-800',
  shop: 'bg-green-100 text-green-800',
  customer: 'bg-purple-100 text-purple-800',
  custom: 'bg-slate-100 text-slate-800',
};

export default function GroupsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredGroups = mockGroups.filter((group) => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (!group.name.toLowerCase().includes(searchLower) && !group.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (typeFilter !== 'all' && group.type !== typeFilter) return false;
    return true;
  });

  const totalVehicles = mockGroups.reduce((acc, g) => acc + g.vehicleCount, 0);
  const totalCritical = mockGroups.reduce((acc, g) => acc + g.criticalCount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle Groups</h1>
          <p className="text-slate-600">Organize vehicles by region, shop, or custom criteria</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderKanban className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGroups.length}</p>
                <p className="text-sm text-slate-600">Total Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVehicles}</p>
                <p className="text-sm text-slate-600">Total Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockGroups.filter(g => g.type === 'region').length}</p>
                <p className="text-sm text-slate-600">Regions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCritical}</p>
                <p className="text-sm text-slate-600">Critical Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="region">Region</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const TypeIcon = typeIcons[group.type];
          return (
            <Card key={group.id} className="hover:border-blue-300 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[group.type].split(' ')[0]}`}>
                      <TypeIcon className={`h-5 w-5 ${typeColors[group.type].split(' ')[1]}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge className={typeColors[group.type]} variant="secondary">
                        {group.type.charAt(0).toUpperCase() + group.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">{group.description}</p>

                {group.parentGroup && (
                  <div className="text-xs text-slate-500">
                    Parent: <span className="font-medium">{group.parentGroup}</span>
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-lg font-bold">{group.vehicleCount}</p>
                    <p className="text-xs text-slate-500">Vehicles</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className={`text-lg font-bold ${group.avgHealthScore >= 70 ? 'text-green-600' : group.avgHealthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {group.avgHealthScore}%
                    </p>
                    <p className="text-xs text-slate-500">Health</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className={`text-lg font-bold ${group.criticalCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {group.criticalCount}
                    </p>
                    <p className="text-xs text-slate-500">Critical</p>
                  </div>
                </div>

                {/* Health Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Avg Health Score</span>
                    <span>{group.avgHealthScore}%</span>
                  </div>
                  <Progress
                    value={group.avgHealthScore}
                    className={`h-2 ${group.avgHealthScore >= 70 ? '[&>div]:bg-green-500' : group.avgHealthScore >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                  />
                </div>

                <Link href={`/dashboard/vehicles?group=${group.id}`}>
                  <Button variant="outline" className="w-full">
                    View Vehicles
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Create Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Create from Template</CardTitle>
          <CardDescription>Start with a pre-configured group template</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col items-start">
              <MapPin className="h-6 w-6 text-blue-600 mb-2" />
              <span className="font-medium">Regional Group</span>
              <span className="text-xs text-slate-500">By geographic area</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start">
              <Wrench className="h-6 w-6 text-green-600 mb-2" />
              <span className="font-medium">Shop Assignment</span>
              <span className="text-xs text-slate-500">By service location</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start">
              <Tag className="h-6 w-6 text-purple-600 mb-2" />
              <span className="font-medium">Age/Mileage Filter</span>
              <span className="text-xs text-slate-500">Dynamic criteria</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start">
              <AlertTriangle className="h-6 w-6 text-orange-600 mb-2" />
              <span className="font-medium">Risk Watch List</span>
              <span className="text-xs text-slate-500">High-risk vehicles</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
