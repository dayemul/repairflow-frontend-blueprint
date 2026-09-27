import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Invoice } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { InvoicePreviewModal } from '@/components/domain/invoices/InvoicePreviewModal';
import { PaymentFormModal } from '@/components/domain/invoices/PaymentFormModal';
import { Receipt, Printer, CreditCard } from 'lucide-react';

export const InvoiceListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(storageService.getInvoices());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const refreshData = () => {
    setInvoices([...storageService.getInvoices()]);
  };

  const filtered = invoices.filter((i) => {
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Invoices & Billing"
        description="Customer invoices, payments received, outstanding collections, and print receipts"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Invoices' },
        ]}
      />

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search invoice #, customer name, or phone..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium self-start sm:self-auto"
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PAID">Paid in Full</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="UNPAID">Unpaid Balance</option>
        </select>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="No Invoices Found"
          description="Invoices are auto-generated when approved estimates are completed."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Invoice Total</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{inv.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={inv.total} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                      <CurrencyDisplay amount={inv.amountPaid} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                        <CurrencyDisplay amount={inv.balanceDue} />
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">
                      <DateDisplay value={inv.createdAt} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inv.balanceDue > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setPaymentInvoice(inv)}
                            className="text-xs px-2 py-1 gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewInvoice(inv)}
                          className="text-xs px-2 py-1 gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>View</span>
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

      {/* Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onAddPayment={() => {
            setPaymentInvoice(previewInvoice);
            setPreviewInvoice(null);
          }}
        />
      )}

      {/* Payment Modal */}
      {paymentInvoice && (
        <PaymentFormModal
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};
