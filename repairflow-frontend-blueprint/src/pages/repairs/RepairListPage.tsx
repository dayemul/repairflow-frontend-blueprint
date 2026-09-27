import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Repair, RepairStatus, Priority } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChangeStatusDialog } from '@/components/domain/repairs/ChangeStatusDialog';
import { AssignTechnicianDialog } from '@/components/domain/repairs/AssignTechnicianDialog';
import { JobCardModal } from '@/components/domain/repairs/JobCardModal';
import {
  Wrench,
  Plus,
  Printer,
  UserCheck,
  RefreshCw,
  Filter,
} from 'lucide-react';

export interface RepairListPageProps {
  onNavigate: (path: string) => void;
  onNewRepair: () => void;
}

export const RepairListPage: React.FC<RepairListPageProps> = ({ onNavigate, onNewRepair }) => {
  const [repairs, setRepairs] = useState<Repair[]>(storageService.getRepairs());
  const technicians = storageService.getTechnicians();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');

  // Active dialogs
  const [statusDialogRepair, setStatusDialogRepair] = useState<Repair | null>(null);
  const [assignDialogRepair, setAssignDialogRepair] = useState<Repair | null>(null);
  const [jobCardRepair, setJobCardRepair] = useState<Repair | null>(null);

  const refreshData = () => {
    setRepairs([...storageService.getRepairs()]);
  };

  const filteredRepairs = repairs.filter((r) => {
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.ticketNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.toLowerCase().includes(q) ||
        r.deviceModel.toLowerCase().includes(q) ||
        r.imeiOrSerial.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'ACTIVE') {
        if (['DELIVERED', 'CANCELLED', 'REJECTED'].includes(r.status)) return false;
      } else if (r.status !== selectedStatus) {
        return false;
      }
    }

    // Priority filter
    if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) {
      return false;
    }

    // Technician filter
    if (selectedTech !== 'ALL') {
      if (selectedTech === 'UNASSIGNED') {
        if (r.assignedTechnicianId) return false;
      } else if (r.assignedTechnicianId !== selectedTech) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair Tickets"
        description="Track customer devices across inspection, estimate approval, bench work, and QC"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Repair Tickets' },
        ]}
        actions={
          <Button variant="primary" onClick={onNewRepair} className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by ticket #, customer, phone, device, or IMEI..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
            >
              <option value="ALL">All Statuses ({repairs.length})</option>
              <option value="ACTIVE">Active Workbench Only</option>
              <option value="RECEIVED">Received</option>
              <option value="DIAGNOSING">Diagnosing</option>
              <option value="WAITING_FOR_APPROVAL">Waiting Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_REPAIR">In Repair</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
            >
              <option value="ALL">All Technicians</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status quick tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active Queue' },
            { id: 'DIAGNOSING', label: 'Diagnosing' },
            { id: 'IN_REPAIR', label: 'In Repair' },
            { id: 'QUALITY_CHECK', label: 'QC' },
            { id: 'READY_FOR_PICKUP', label: 'Ready' },
            { id: 'DELIVERED', label: 'Delivered' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedStatus(pill.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold transition cursor-pointer ${
                selectedStatus === pill.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Repairs Table */}
      {filteredRepairs.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-8 h-8" />}
          title="No Repair Tickets Found"
          description="Try adjusting your search criteria or create a new repair ticket."
          actionLabel="Create Repair Ticket"
          onAction={onNewRepair}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Device Spec</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4 text-right">Estimate</th>
                  <th className="py-3.5 px-4 text-right">Target Date</th>
                  <th className="py-3.5 px-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRepairs.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td
                      onClick={() => onNavigate(`/repairs/${r.id}`)}
                      className="py-3.5 px-4 font-mono font-bold text-blue-600 cursor-pointer"
                    >
                      {r.ticketNumber}
                    </td>

                    <td
                      onClick={() => onNavigate(`/repairs/${r.id}`)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      <div className="font-bold text-slate-900">{r.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.customerPhone}</div>
                    </td>

                    <td
                      onClick={() => onNavigate(`/repairs/${r.id}`)}
                      className="py-3.5 px-4 cursor-pointer"
                    >
                      <div className="font-semibold text-slate-900">
                        {r.deviceBrand} {r.deviceModel}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                        SN: {r.imeiOrSerial}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setStatusDialogRepair(r)}
                        className="cursor-pointer hover:opacity-80 transition"
                        title="Click to update status"
                      >
                        <StatusBadge status={r.status} size="sm" />
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={r.priority} />
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setAssignDialogRepair(r)}
                        className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 cursor-pointer group-hover:underline"
                        title="Click to change technician"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.assignedTechnicianName || 'Assign Tech'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={r.estimatedCost || 0} />
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                      <DateDisplay value={r.expectedCompletionDate} />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setJobCardRepair(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          title="Print Job Slip"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`/repairs/${r.id}`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold px-2"
                        >
                          Open →
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dialogs */}
      {statusDialogRepair && (
        <ChangeStatusDialog
          repair={statusDialogRepair}
          isOpen={!!statusDialogRepair}
          onClose={() => setStatusDialogRepair(null)}
          onSuccess={refreshData}
        />
      )}

      {assignDialogRepair && (
        <AssignTechnicianDialog
          repair={assignDialogRepair}
          isOpen={!!assignDialogRepair}
          onClose={() => setAssignDialogRepair(null)}
          onSuccess={refreshData}
        />
      )}

      {jobCardRepair && (
        <JobCardModal
          repair={jobCardRepair}
          isOpen={!!jobCardRepair}
          onClose={() => setJobCardRepair(null)}
        />
      )}
    </div>
  );
};
