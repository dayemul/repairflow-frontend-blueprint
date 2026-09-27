import React from 'react';
import { storageService } from '@/lib/storage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArrowLeft, Phone, Mail, MapPin, Wrench, Receipt } from 'lucide-react';

export interface CustomerDetailPageProps {
  customerId: string;
  onNavigate: (path: string) => void;
  onNewRepair: () => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  customerId,
  onNavigate,
  onNewRepair,
}) => {
  const customer = storageService.getCustomerById(customerId);
  const repairs = storageService.getRepairs().filter((r) => r.customerId === customerId);
  const invoices = storageService.getInvoices().filter((i) => i.customerId === customerId);

  if (!customer) {
    return (
      <EmptyState
        title="Customer Not Found"
        description="The requested customer profile does not exist."
        actionLabel="Back to Customer Directory"
        onAction={() => onNavigate('/customers')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('/customers')}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            {customer.code}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{customer.name}</h1>
        </div>
      </div>

      {/* Profile info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Contact</span>
          <div className="flex items-center gap-2 text-slate-800">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono font-bold">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{customer.address}</span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Repairs</span>
          <div className="text-2xl font-black font-mono text-slate-900 my-1">
            {repairs.length}
          </div>
          <span className="text-[11px] text-slate-500">Tickets logged at lab</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Spent</span>
          <div className="text-2xl font-black font-mono text-blue-600 my-1">
            <CurrencyDisplay amount={customer.totalSpent || 0} />
          </div>
          <span className="text-[11px] text-slate-500">Invoices cleared to date</span>
        </Card>
      </div>

      {/* Repair History */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="p-4 border-b">
          <CardTitle>Repair History ({repairs.length})</CardTitle>
          <Button variant="primary" size="sm" onClick={onNewRepair} className="gap-1.5 text-xs">
            <Wrench className="w-3.5 h-3.5" />
            <span>New Repair for Customer</span>
          </Button>
        </CardHeader>

        {repairs.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-400">No repair tickets on record yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Ticket</th>
                  <th className="py-2.5 px-4">Device</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Cost</th>
                  <th className="py-2.5 px-4 text-right">Date</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.ticketNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.deviceBrand} {r.deviceModel}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={r.estimatedCost || 0} />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">
                      <DateDisplay value={r.receivedAt} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onNavigate(`/repairs/${r.id}`)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        View Ticket →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
