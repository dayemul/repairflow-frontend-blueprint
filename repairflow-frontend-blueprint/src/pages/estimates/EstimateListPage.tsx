import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Repair } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { Calculator } from 'lucide-react';

export const EstimateListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const repairsWithEstimates = storageService
    .getRepairs()
    .filter((r) => r.estimate !== undefined);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = repairsWithEstimates.filter((r) => {
    const est = r.estimate!;
    if (statusFilter !== 'ALL' && est.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        est.estimateNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.ticketNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair Quotations & Estimates"
        description="Formal parts & labor price quotations prepared for customer authorization"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Estimates' },
        ]}
      />

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search estimate #, customer, or repair ticket..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium self-start sm:self-auto"
        >
          <option value="ALL">All Authorization States</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved by Customer</option>
          <option value="REJECTED">Declined / Rejected</option>
          <option value="DRAFT">Draft</option>
        </select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calculator className="w-8 h-8" />}
          title="No Estimates Found"
          description="Estimates are created from the Estimate tab of any Repair Ticket."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Estimate #</th>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Items Count</th>
                  <th className="py-3 px-4 text-right">Quoted Total</th>
                  <th className="py-3 px-4 text-right">Valid Until</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const est = r.estimate!;
                  return (
                    <tr key={est.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {est.estimateNumber}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {r.ticketNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.customerName}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {r.deviceBrand} {r.deviceModel}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                            est.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : est.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {est.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{est.items.length} lines</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                        <CurrencyDisplay amount={est.total} />
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono">
                        <DateDisplay value={est.validUntil} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onNavigate(`/repairs/${r.id}`)}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Open Ticket →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
