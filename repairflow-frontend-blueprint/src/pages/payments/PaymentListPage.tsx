import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Payment } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { Card } from '@/components/ui/card';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';

export const PaymentListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const invoices = storageService.getInvoices();
  // Flatten payments from all invoices
  const allPayments: (Payment & { customerName: string; invoiceNumber: string })[] = [];
  invoices.forEach((inv) => {
    inv.payments.forEach((p) => {
      allPayments.push({
        ...p,
        customerName: inv.customerName,
        invoiceNumber: inv.invoiceNumber,
      });
    });
  });

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const filtered = allPayments.filter((p) => {
    if (methodFilter !== 'ALL' && p.method !== methodFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.paymentNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        (p.reference && p.reference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCollected = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Collections Ledger"
        description="Real-time transaction register for Cash, bKash, POS Cards, and Bank Settlements"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Payments' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">
            Filtered Total Collected
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            <CurrencyDisplay amount={totalCollected} />
          </div>
        </Card>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search payment #, customer, invoice #, or transaction ID..."
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="CASH">Cash</option>
          <option value="BKASH">bKash</option>
          <option value="CARD">Credit/Debit Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Invoice</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference Trx ID</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.paymentNumber}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.customerName}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.reference || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                    <CurrencyDisplay amount={p.amount} />
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.receivedBy}</td>
                  <td className="py-3 px-4 text-right text-slate-500 font-mono">
                    <DateDisplay value={p.createdAt} showTime />
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
