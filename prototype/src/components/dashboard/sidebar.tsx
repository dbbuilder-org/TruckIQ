'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Truck,
  Bell,
  FolderKanban,
  BarChart3,
  FileText,
  Settings,
  Users,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vehicles', href: '/dashboard/vehicles', icon: Truck },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: 7 },
  { name: 'Groups', href: '/dashboard/groups', icon: FolderKanban },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

const dealerNavigation = [
  { name: 'Dealer Dashboard', href: '/dashboard/dealer', icon: Building2 },
];

const settingsNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Users', href: '/dashboard/users', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-700">
        <Truck className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold">TruckIQ</span>
        <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded">AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Overview
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">
          Dealer
        </p>
        {dealerNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">
          Settings
        </p>
        {settingsNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Tenant Switcher */}
      <div className="p-4 border-t border-slate-700">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-white hover:bg-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-sm font-bold">
                  AT
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Acme Trucking</p>
                  <p className="text-xs text-slate-400">142 vehicles</p>
                </div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>Acme Trucking Co.</DropdownMenuItem>
            <DropdownMenuItem>FastFreight LLC</DropdownMenuItem>
            <DropdownMenuItem>Mountain Transport</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
