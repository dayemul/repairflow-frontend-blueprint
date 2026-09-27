import React, { useState } from 'react';
import { Repair, Estimate, EstimateItem, EstimateItemType } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { Plus, Trash2, Calculator, Check, X } from 'lucide-react';
import { generateCode } from '@/lib/utils';

export interface EstimatePreviewModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EstimatePreviewModal: React.FC<EstimatePreviewModalProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const parts = storageService.getParts();
  const existing = repair.estimate;

  const [items, setItems] = useState<EstimateItem[]>(
    existing?.items || [
      {
        id: `item-${Date.now()}-1`,
        type: 'LABOR',
        description: 'Standard Labor & Diagnostics',
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
      },
    ]
  );
  const [discount, setDiscount] = useState<number>(existing?.discount || 0);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(0);
  const [validDays, setValidDays] = useState<number>(7);
  const [loading, setLoading] = useState(false);

  // New item drafting
  const [newItemType, setNewItemType] = useState<EstimateItemType>('PART');
  const [selectedPartId, setSelectedPartId] = useState<string>(parts[0]?.id || '');
  const [customDesc, setCustomDesc] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(parts[0]?.sellingPrice || 1000);
  const [itemQty, setItemQty] = useState<number>(1);

  const handlePartSelect = (pId: string) => {
    setSelectedPartId(pId);
    const p = parts.find((x) => x.id === pId);
    if (p) {
      setItemPrice(p.sellingPrice);
      setCustomDesc(p.name);
    }
  };

  const addItem = () => {
    let desc = customDesc;
    let partId: string | undefined = undefined;

    if (newItemType === 'PART') {
      const p = parts.find((x) => x.id === selectedPartId);
      if (!p) {
        toast.error('Please select a part');
        return;
      }
      desc = p.name;
      partId = p.id;
    } else if (!desc.trim()) {
      desc = newItemType === 'LABOR' ? 'Technical Labor' : 'Diagnostic Inspection Fee';
    }

    const newItem: EstimateItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      type: newItemType,
      description: desc,
      partId,
      quantity: itemQty,
      unitPrice: itemPrice,
      totalPrice: itemPrice * itemQty,
    };

    setItems([...items, newItem]);
    setCustomDesc('');
    setItemQty(1);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const taxAmount = (subtotal - discount) * (taxRatePercent / 100);
  const grandTotal = Math.max(0, subtotal - discount + taxAmount);

  const handleSave = (status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED') => {
    if (items.length === 0) {
      toast.error('Add at least one item to estimate');
      return;
    }

    setLoading(true);
    try {
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + validDays);

      const est: Estimate = {
        id: existing?.id || `est-${Date.now()}`,
        estimateNumber: existing?.estimateNumber || generateCode('EST'),
        repairId: repair.id,
        items,
        subtotal,
        discount,
        tax: taxAmount,
        total: grandTotal,
        status: status || existing?.status || 'PENDING_APPROVAL',
        validUntil: validUntilDate.toISOString(),
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      const updatedRepair: Repair = {
        ...repair,
        estimate: est,
        estimatedCost: grandTotal,
      };

      if (status === 'APPROVED') {
        updatedRepair.status = 'APPROVED';
        if (user) {
          updatedRepair.timeline.push({
            id: `tl-${Date.now()}`,
            status: 'APPROVED',
            title: 'Estimate Approved',
            description: `Estimate ${est.estimateNumber} approved for ৳${grandTotal.toLocaleString()}`,
            timestamp: new Date().toISOString(),
            userName: user.name,
            userRole: user.role,
          });
        }
      } else if (repair.status === 'DIAGNOSING' && status === 'PENDING_APPROVAL') {
        updatedRepair.status = 'WAITING_FOR_APPROVAL';
        if (user) {
          updatedRepair.timeline.push({
            id: `tl-${Date.now()}`,
            status: 'WAITING_FOR_APPROVAL',
            title: 'Estimate Prepared',
            description: `Estimate ${est.estimateNumber} created and sent to customer for review`,
            timestamp: new Date().toISOString(),
            userName: user.name,
            userRole: user.role,
          });
        }
      }

      storageService.saveRepair(updatedRepair);
      toast.success(
        'Estimate Saved',
        `${est.estimateNumber} totaling ৳${grandTotal.toLocaleString()} updated`
      );
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to save estimate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>Repair Cost Estimate Builder</span>
        </div>
      }
      description={`Customer: ${repair.customerName} (${repair.customerPhone}) · ${repair.deviceBrand} ${repair.deviceModel}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Add Line Item Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Add Quotation Line Item
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Item Type
              </label>
              <select
                value={newItemType}
                onChange={(e) => {
                  const t = e.target.value as EstimateItemType;
                  setNewItemType(t);
                  if (t === 'PART' && parts.length > 0) {
                    handlePartSelect(parts[0].id);
                  } else if (t === 'LABOR') {
                    setItemPrice(1500);
                    setCustomDesc('Technical Assembly & Calibration');
                  } else if (t === 'DIAGNOSIS_FEE') {
                    setItemPrice(800);
                    setCustomDesc('Initial Bench Diagnostic & Board Inspection');
                  }
                }}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
              >
                <option value="PART">Part from Inventory</option>
                <option value="LABOR">Labor & Workmanship</option>
                <option value="DIAGNOSIS_FEE">Diagnosis Fee</option>
                <option value="OTHER">Custom / Other</option>
              </select>
            </div>

            {newItemType === 'PART' ? (
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Choose Inventory Part
                </label>
                <select
                  value={selectedPartId}
                  onChange={(e) => handlePartSelect(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white truncate"
                >
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantityInStock}) — ৳{p.sellingPrice.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Service description..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Unit ৳
              </label>
              <input
                type="number"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button size="sm" variant="secondary" onClick={addItem} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add to Estimate
            </Button>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Item / Service</th>
                <th className="py-2.5 px-3 w-20">Type</th>
                <th className="py-2.5 px-3 text-right w-16">Qty</th>
                <th className="py-2.5 px-3 text-right w-24">Unit Price</th>
                <th className="py-2.5 px-3 text-right w-24">Total</th>
                <th className="py-2.5 px-3 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No items in estimate yet. Add items above.
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{it.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600">
                        {it.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <CurrencyDisplay amount={it.unitPrice} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={it.totalPrice} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Discount (BDT ৳)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Estimate Valid For
              </label>
              <select
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days (Standard)</option>
                <option value="14">14 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Subtotal:</span>
              <CurrencyDisplay amount={subtotal} />
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                <span>Discount:</span>
                <span>- <CurrencyDisplay amount={discount} /></span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t-2 border-slate-300 text-sm font-extrabold text-slate-900">
              <span>Estimated Total:</span>
              <CurrencyDisplay amount={grandTotal} className="text-base text-blue-700" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              disabled={loading}
              onClick={() => handleSave('DRAFT')}
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={loading}
              onClick={() => handleSave('PENDING_APPROVAL')}
            >
              Send to Customer
            </Button>
            <Button
              variant="success"
              type="button"
              disabled={loading}
              onClick={() => handleSave('APPROVED')}
              className="gap-1.5"
            >
              <Check className="w-4 h-4" /> Mark Approved & Proceed
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
