import React, { useState } from 'react';
import { Repair, PartUsage } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { Wrench, AlertTriangle } from 'lucide-react';

export interface PartUsageModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PartUsageModal: React.FC<PartUsageModalProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const parts = storageService.getParts();

  const [selectedPartId, setSelectedPartId] = useState<string>(parts[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const selectedPart = parts.find((p) => p.id === selectedPartId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) {
      toast.error('Select a part to allocate');
      return;
    }

    if (selectedPart.quantityInStock < quantity) {
      toast.error(
        'Insufficient stock',
        `Only ${selectedPart.quantityInStock} available in inventory`
      );
      return;
    }

    setLoading(true);
    try {
      // Deduct from stock
      storageService.adjustPartStock(selectedPart.id, -quantity);

      const usage: PartUsage = {
        id: `pu-${Date.now()}`,
        repairId: repair.id,
        partId: selectedPart.id,
        partName: selectedPart.name,
        partSku: selectedPart.sku,
        quantity,
        unitCost: selectedPart.costPrice,
        unitPrice: selectedPart.sellingPrice,
        usedAt: new Date().toISOString(),
        usedByTechnicianName: user?.name || 'Technician',
      };

      const updatedRepair: Repair = {
        ...repair,
        partsUsed: [...repair.partsUsed, usage],
      };

      if (user) {
        updatedRepair.timeline.push({
          id: `tl-${Date.now()}`,
          status: repair.status,
          title: 'Component Consumed from Stock',
          description: `${quantity}x ${selectedPart.name} installed by ${user.name}`,
          timestamp: new Date().toISOString(),
          userName: user.name,
          userRole: user.role,
        });
      }

      storageService.saveRepair(updatedRepair);
      toast.success(
        'Part Allocated',
        `Deducted ${quantity}x ${selectedPart.name} from stock`
      );
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to allocate part');
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
          <Wrench className="w-5 h-5 text-blue-600" />
          <span>Allocate Replacement Part from Inventory</span>
        </div>
      }
      description={`Record parts fitted into ${repair.ticketNumber} (${repair.deviceBrand} ${repair.deviceModel})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Part from Stock
          </label>
          <select
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
          >
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name} (Stock: {p.quantityInStock})
              </option>
            ))}
          </select>
        </div>

        {selectedPart && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Available Stock:</span>
              <strong
                className={
                  selectedPart.quantityInStock <= selectedPart.minThreshold
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-900 font-semibold'
                }
              >
                {selectedPart.quantityInStock} units in {selectedPart.location || 'Warehouse'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Standard Retail:</span>
              <span className="font-mono font-semibold text-slate-800">
                ৳{selectedPart.sellingPrice.toLocaleString()}
              </span>
            </div>
            {selectedPart.quantityInStock <= selectedPart.minThreshold && (
              <div className="flex items-center gap-1.5 text-amber-700 font-medium pt-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Low stock threshold triggered! Reorder recommended.</span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Quantity Installed
          </label>
          <input
            type="number"
            min="1"
            max={selectedPart?.quantityInStock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={!selectedPart || selectedPart.quantityInStock === 0}
          >
            Deduct & Attach to Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
