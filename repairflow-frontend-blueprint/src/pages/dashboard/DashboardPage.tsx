import React from 'react';
import { storageService } from '@/lib/storage';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/domain/dashboard/StatCard';
import { RepairStatusDonut } from '@/components/domain/dashboard/RepairStatusDonut';
import { RevenueTrendChart } from '@/components/domain/dashboard/RevenueTrendChart';
import { TechnicianWorkloadChart } from '@/components/domain/dashboard/TechnicianWorkloadChart';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Package,
  Sparkles,
} from 'lucide-react';

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onNewRepair: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onNewRepair }) => {
  const repairs = storageService.getRepairs();
  const technicians = storageService.getTechnicians();
  const invoices = storageService.getInvoices();
  const parts = storageService.getParts();

  const activeRepairs = repairs.filter(
    (r) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(r.status)
  );
  const inProgressRepairs = repairs.filter((r) => r.status === 'IN_REPAIR');
  const readyRepairs = repairs.filter((r) => r.status === 'READY_FOR_PICKUP');
  const criticalRepairs = repairs.filter((r) => r.priority === 'CRITICAL' && r.status !== 'DELIVERED');

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const lowStockParts = parts.filter((p) => p.quantityInStock <= p.minThreshold);

  const recentRepairs = [...repairs].slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Live bench activity, technician workloads, parts alerts, and workshop intake"
        actions={
          <Button variant="primary" onClick={onNewRepair} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>New Repair Ticket</span>
          </Button>
        }
      />

      {/* Low stock alert banner */}
      {lowStockParts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Low Inventory Alert ({lowStockParts.length} Parts Critical)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {lowStockParts.map((p) => `${p.name} (${p.quantityInStock} left)`).join(' · ')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onNavigate('/parts')}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 self-start sm:self-auto"
          >
            Review Inventory →
          </Button>
        </div>
      )}

      {/* Primary KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Repairs"
          value={activeRepairs.length}
          subtitle="Currently in workbench queue"
          icon={<Wrench className="w-6 h-6" />}
          color="blue"
          trend={{ value: '+4', isPositive: true }}
          onClick={() => onNavigate('/repairs')}
        />
        <StatCard
          title="On The Bench"
          value={inProgressRepairs.length}
          subtitle="Actively being soldered/repaired"
          icon={<Clock className="w-6 h-6" />}
          color="purple"
          onClick={() => onNavigate('/repairs')}
        />
        <StatCard
          title="Ready For Pickup"
          value={readyRepairs.length}
          subtitle="Passed QC inspection"
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="emerald"
          onClick={() => onNavigate('/repairs')}
        />
        <StatCard
          title="Critical / Express"
          value={criticalRepairs.length}
          subtitle="Requires priority attention"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="rose"
          onClick={() => onNavigate('/repairs')}
        />
      </div>

      {/* Analytics & Workload Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RepairStatusDonut repairs={repairs} />
        </div>
        <div className="lg:col-span-1">
          <RevenueTrendChart invoices={invoices} />
        </div>
        <div className="lg:col-span-1">
          <TechnicianWorkloadChart technicians={technicians} />
        </div>
      </div>

      {/* Recent Repairs Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Repair Tickets</CardTitle>
            <div className="text-xs text-slate-500 mt-0.5">Latest customer submissions and diagnostics</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/repairs')}
            className="gap-1 text-blue-600 hover:text-blue-700"
          >
            <span>View All ({repairs.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-right">Estimate</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRepairs.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => onNavigate(`/repairs/${r.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.ticketNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{r.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    <div>{r.deviceBrand} {r.deviceModel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SN: {r.imeiOrSerial}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {r.assignedTechnicianName || (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    <CurrencyDisplay amount={r.estimatedCost || 0} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs font-semibold text-blue-600 hover:underline">
                      Manage →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
