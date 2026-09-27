import React, { useState } from 'react';
import { Repair } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/authStore';
import { storageService } from '@/lib/storage';
import { toast } from '@/stores/uiStore';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface ApproveRejectDialogProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApproveRejectDialog: React.FC<ApproveRejectDialogProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [decision, setDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState('Price too high for customer budget');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repair.estimate) {
      toast.error('No estimate found on this repair');
      return;
    }

    setLoading(true);
    try {
      const updatedRepair: Repair = { ...repair };
      const updatedEstimate = { ...repair.estimate };

      if (decision === 'APPROVE') {
        updatedEstimate.status = 'APPROVED';
        updatedRepair.estimate = updatedEstimate;
        updatedRepair.status = 'APPROVED';
        if (user) {
          updatedRepair.timeline.push({
            id: `tl-${Date.now()}`,
            status: 'APPROVED',
            title: 'Estimate Approved by Customer',
            description: notes || 'Customer gave authorization to start repair work.',
            timestamp: new Date().toISOString(),
            userName: user.name,
            userRole: user.role,
          });
        }
        toast.success('Estimate Approved', 'Ticket moved to APPROVED');
      } else {
        updatedEstimate.status = 'REJECTED';
        updatedEstimate.rejectionReason = rejectionReason;
        updatedRepair.estimate = updatedEstimate;
        updatedRepair.status = 'REJECTED';
        if (user) {
          updatedRepair.timeline.push({
            id: `tl-${Date.now()}`,
            status: 'REJECTED',
            title: 'Estimate Declined by Customer',
            description: `Reason: ${rejectionReason}. ${notes}`,
            timestamp: new Date().toISOString(),
            userName: user.name,
            userRole: user.role,
          });
        }
        toast.warning('Estimate Rejected', 'Ticket status marked as REJECTED');
      }

      storageService.saveRepair(updatedRepair);
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to update decision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Estimate Decision"
      description={`Record authorization status for ${repair.ticketNumber} (${repair.deviceBrand} ${repair.deviceModel})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDecision('APPROVE')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${
              decision === 'APPROVE'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <CheckCircle2 className={`w-6 h-6 ${decision === 'APPROVE' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold uppercase">Approve & Start</span>
          </button>

          <button
            type="button"
            onClick={() => setDecision('REJECT')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition ${
              decision === 'REJECT'
                ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <XCircle className={`w-6 h-6 ${decision === 'REJECT' ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className="text-xs font-bold uppercase">Decline / Cancel</span>
          </button>
        </div>

        {decision === 'REJECT' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Rejection
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
            >
              <option value="Price too high for customer budget">Price exceeds customer budget</option>
              <option value="Customer decided to upgrade/buy new device">Customer upgrading device instead</option>
              <option value="Parts turnaround lead time too long">Parts lead time too long</option>
              <option value="Customer taking device to another repairer">Customer took device elsewhere</option>
              <option value="Device declared unfixable/economic total loss">Economic total loss</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Communication Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Customer confirmed via call at 3:15 PM..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={decision === 'APPROVE' ? 'success' : 'danger'}
            type="submit"
            loading={loading}
          >
            Submit Decision
          </Button>
        </div>
      </form>
    </Modal>
  );
};
