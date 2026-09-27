import React, { useState } from 'react';
import { Invoice, Payment, PaymentMethod } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { generateCode } from '@/lib/utils';

export interface PaymentFormModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [method, setMethod] = useState<PaymentMethod>('BKASH');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > invoice.balanceDue) {
      toast.warning('Payment amount exceeds remaining balance due');
    }

    setLoading(true);
    try {
      const payment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: generateCode('PAY', 5),
        invoiceId: invoice.id,
        repairId: invoice.repairId,
        amount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        receivedBy: user?.name || 'Cashier',
        createdAt: new Date().toISOString(),
      };

      storageService.addPaymentToInvoice(invoice.id, payment);

      // If repair exists and is ready for pickup and invoice is paid, check if delivered
      const repair = storageService.getRepairById(invoice.repairId);
      if (repair && user) {
        repair.timeline.push({
          id: `tl-${Date.now()}`,
          status: repair.status,
          title: `Payment Received: ৳${amount.toLocaleString()}`,
          description: `Method: ${method} ${reference ? `(Ref: ${reference})` : ''} received by ${user.name}`,
          timestamp: new Date().toISOString(),
          userName: user.name,
          userRole: user.role,
        });
        storageService.saveRepair(repair);
      }

      toast.success(
        'Payment Recorded',
        `Received ৳${amount.toLocaleString()} via ${method} for invoice ${invoice.invoiceNumber}`
      );
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'CASH', label: 'Cash In Hand', icon: <Banknote className="w-4 h-4 text-emerald-600" /> },
    { id: 'BKASH', label: 'bKash / Nagad', icon: <Smartphone className="w-4 h-4 text-pink-600" /> },
    { id: 'CARD', label: 'Credit / Debit Card', icon: <CreditCard className="w-4 h-4 text-blue-600" /> },
    { id: 'BANK_TRANSFER', label: 'Bank Wire', icon: <Building2 className="w-4 h-4 text-purple-600" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Payment"
      description={`Invoice ${invoice.invoiceNumber} · Customer: ${invoice.customerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outstanding Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Invoice Total:</span>
            <CurrencyDisplay amount={invoice.total} />
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Paid So Far:</span>
            <span className="font-mono text-emerald-700 font-semibold">
              <CurrencyDisplay amount={invoice.amountPaid} />
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-sm text-slate-900">
            <span>Remaining Balance Due:</span>
            <CurrencyDisplay amount={invoice.balanceDue} className="text-rose-600 font-black" />
          </div>
        </div>

        {/* Amount to pay */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Payment Amount (BDT ৳) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max={invoice.balanceDue * 2}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">৳</span>
          </div>
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setAmount(invoice.balanceDue)}
              className="text-[11px] text-blue-600 hover:underline font-semibold"
            >
              Pay full balance (৳{invoice.balanceDue.toLocaleString()})
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setAmount(Math.round(invoice.balanceDue / 2))}
              className="text-[11px] text-slate-600 hover:underline"
            >
              Pay 50% deposit
            </button>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => {
              const isSelected = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reference */}
        <div>
          <Input
            label="Transaction ID / Authorization Ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. bKash TrxID: 9BK729188 or Card auth 4409"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Receipt Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Received at collection counter"
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
