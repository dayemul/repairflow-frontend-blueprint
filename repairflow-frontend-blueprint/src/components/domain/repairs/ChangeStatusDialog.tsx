import React, { useState } from 'react';
import { Repair, RepairStatus } from '@/types';
import { VALID_STATUS_TRANSITIONS, STATUS_LABELS } from '@/config/constants';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useAuth } from '@/stores/authStore';
import { storageService } from '@/lib/storage';
import { toast } from '@/stores/uiStore';

export interface ChangeStatusDialogProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangeStatusDialog: React.FC<ChangeStatusDialogProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const validNextStatuses = VALID_STATUS_TRANSITIONS[repair.status] || [];

  // Default to first valid transition or current
  const [selectedStatus, setSelectedStatus] = useState<RepairStatus>(
    validNextStatuses[0] || repair.status
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // If there are no valid next statuses (e.g. DELIVERED)
  const isTerminal = validNextStatuses.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!selectedStatus) {
      toast.error('Select a valid status');
      return;
    }

    setLoading(true);
    try {
      storageService.updateRepairStatus(repair.id, selectedStatus, notes, user);
      toast.success(
        `Status updated to ${STATUS_LABELS[selectedStatus]}`,
        `Ticket ${repair.ticketNumber} updated successfully`
      );
      setNotes('');
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Repair Status"
      description={`Update lifecycle stage for ticket ${repair.ticketNumber}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Current Status
          </label>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Currently in state:</span>
            <StatusBadge status={repair.status} />
          </div>
        </div>

        {isTerminal ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            This ticket has reached terminal status (<strong>{STATUS_LABELS[repair.status]}</strong>).
            No further automated status progressions are required.
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Next Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {validNextStatuses.map((st) => (
                <label
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    selectedStatus === st
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="repairStatus"
                      checked={selectedStatus === st}
                      onChange={() => setSelectedStatus(st)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {STATUS_LABELS[st]}
                    </span>
                  </div>
                  <StatusBadge status={st} size="sm" showDot={false} />
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Internal Note / Remarks
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add relevant notes (e.g., 'OLED assembly tested with customer present', 'Awaiting customs clearance for camera IC')..."
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          {!isTerminal && (
            <Button variant="primary" type="submit" loading={loading}>
              Apply Status Change
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
