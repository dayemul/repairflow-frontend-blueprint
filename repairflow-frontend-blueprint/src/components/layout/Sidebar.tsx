import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useUIStore } from '@/stores/uiStore';
import { storageService } from '@/lib/storage';
import {
  LayoutDashboard,
  Wrench,
  Users,
  HardDrive,
  Cpu,
  Calculator,
  Receipt,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { hasRole, role } = usePermission();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const repairs = storageService.getRepairs();
  const activeRepairsCount = repairs.filter(
    (r) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(r.status)
  ).length;

  const parts = storageService.getParts();
  const lowStockCount = parts.filter((p) => p.quantityInStock <= p.minThreshold).length;

  interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles?: ('ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'CASHIER')[];
    badge?: number;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      label: 'Repair Tickets',
      path: '/repairs',
      icon: <Wrench className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'],
      badge: activeRepairsCount,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      label: 'Customers',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      label: 'Technicians',
      path: '/technicians',
      icon: <Cpu className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Products Catalog',
      path: '/products',
      icon: <HardDrive className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Parts Inventory',
      path: '/parts',
      icon: <HardDrive className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      label: 'Estimates',
      path: '/estimates',
      icon: <Calculator className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    {
      label: 'Invoices',
      path: '/invoices',
      icon: <Receipt className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    {
      label: 'Payments',
      path: '/payments',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'CASHIER'],
    },
    {
      label: 'Warranties',
      path: '/warranties',
      icon: <ShieldCheck className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER', 'TECHNICIAN', 'CASHIER'],
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      label: 'Shop Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['ADMIN'],
    },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 select-none',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg shadow-blue-500/20">
            F
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                FixFlow
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">Repair Management</div>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
        {navItems
          .filter((item) => !item.roles || (role && item.roles.includes(role)))
          .map((item) => {
            const isActive =
              item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer group relative',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <div
                  className={cn(
                    'shrink-0 transition-transform group-hover:scale-105',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  )}
                >
                  {item.icon}
                </div>

                {sidebarOpen && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'text-[10px] font-bold rounded-full flex items-center justify-center shrink-0',
                      item.badgeColor || 'bg-slate-700 text-white',
                      sidebarOpen ? 'px-2 py-0.5' : 'absolute top-1 right-1 w-4 h-4'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Public Warranty Lookup shortcut */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <button
          onClick={() => onNavigate('/warranty/check')}
          className={cn(
            'w-full flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition cursor-pointer',
            !sidebarOpen && 'justify-center'
          )}
          title="Public Customer Warranty Lookup"
        >
          <Search className="w-4 h-4 text-emerald-400 shrink-0" />
          {sidebarOpen && (
            <div className="text-left overflow-hidden">
              <div className="font-semibold text-white">Warranty Check</div>
              <div className="text-[10px] text-slate-400">Public Portal</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
