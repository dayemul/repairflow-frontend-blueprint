import React from 'react';
import { Invoice } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { storageService } from '@/lib/storage';
import { Printer, CheckCircle2, AlertCircle } from 'lucide-react';

export interface InvoicePreviewModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onAddPayment?: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onAddPayment,
}) => {
  const settings = storageService.getSettings();
  const repair = storageService.getRepairById(invoice.repairId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice & Receipt" maxWidth="3xl">
      <div className="space-y-4">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 border-2 border-slate-200 rounded-2xl bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-base">
                  F
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {settings.shopName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 max-w-sm mt-1">{settings.shopAddress}</p>
              <p className="text-xs text-slate-600 mt-0.5">
                Phone: <strong>{settings.shopPhone}</strong> | Email: {settings.shopEmail}
              </p>
              <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                Govt Tax BIN: {settings.taxNumber}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded">
                TAX INVOICE
              </div>
              <div className="text-xl font-black font-mono mt-1 text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Date: <DateDisplay value={invoice.createdAt} />
              </div>
              {repair && (
                <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">
                  Job Ticket: {repair.ticketNumber}
                </div>
              )}
            </div>
          </div>

          {/* Billed To & Device Info */}
          <div className="grid grid-cols-2 gap-6 text-xs mb-6 pb-6 border-b border-slate-100">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                Billed To Customer
              </span>
              <div className="font-black text-slate-900 text-sm">{invoice.customerName}</div>
              <div className="font-mono text-slate-700 mt-0.5">{invoice.customerPhone}</div>
              {repair?.customerEmail && (
                <div className="text-slate-600 mt-0.5">{repair.customerEmail}</div>
              )}
            </div>

            {repair && (
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                  Serviced Device
                </span>
                <div className="font-bold text-slate-900">
                  {repair.deviceBrand} {repair.deviceModel}
                </div>
                <div className="font-mono text-slate-600 mt-0.5">
                  IMEI/SN: {repair.imeiOrSerial}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Technician: {repair.assignedTechnicianName || 'Bench Certified'}
                </div>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-6">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-800 font-bold uppercase text-[11px]">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center w-16">Qty</th>
                <th className="py-2.5 text-right w-28">Rate</th>
                <th className="py-2.5 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium text-slate-900">{it.description}</td>
                  <td className="py-3 text-center font-mono">{it.quantity}</td>
                  <td className="py-3 text-right font-mono">
                    <CurrencyDisplay amount={it.unitPrice} />
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-900">
                    <CurrencyDisplay amount={it.totalPrice} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Calculations */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                <span>Subtotal:</span>
                <CurrencyDisplay amount={invoice.subtotal} />
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700 py-1 border-b border-slate-100 font-medium">
                  <span>Special Discount:</span>
                  <span>- <CurrencyDisplay amount={invoice.discount} /></span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-slate-600 py-1 border-b border-slate-100">
                  <span>VAT / Sales Tax:</span>
                  <CurrencyDisplay amount={invoice.tax} />
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <CurrencyDisplay amount={invoice.total} className="text-base font-black text-blue-900" />
              </div>

              <div className="flex justify-between text-emerald-800 font-semibold py-1 bg-emerald-50 px-2 rounded">
                <span>Total Paid:</span>
                <CurrencyDisplay amount={invoice.amountPaid} />
              </div>

              <div className="flex justify-between font-black text-sm py-1.5 px-2 rounded bg-slate-100">
                <span>Balance Due:</span>
                <span className={invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {invoice.balanceDue > 0 ? (
                    <CurrencyDisplay amount={invoice.balanceDue} />
                  ) : (
                    'PAID IN FULL'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Log */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-6 pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Payments Processed
              </span>
              <div className="space-y-1.5 text-xs">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono font-semibold">{p.paymentNumber}</span>
                      <span className="text-slate-500">
                        via <strong>{p.method}</strong> {p.reference ? `(${p.reference})` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay amount={p.amount} className="font-bold text-slate-900" />
                      <div className="text-[10px] text-slate-400">
                        <DateDisplay value={p.createdAt} showTime />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms Footer */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-4 leading-relaxed">
            <p className="font-bold text-slate-700 uppercase mb-0.5">Warranty & Service Policy:</p>
            {settings.termsAndConditions}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {invoice.balanceDue > 0 && onAddPayment && (
              <Button variant="primary" onClick={onAddPayment}>
                Record Payment
              </Button>
            )}
            <Button variant="secondary" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print Official Invoice
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
