import React, { useState } from 'react';
import { Repair, QCInspection, QCCheckItem } from '@/types';
import { DEFAULT_QC_ITEMS } from '@/config/constants';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/stores/authStore';
import { storageService } from '@/lib/storage';
import { toast } from '@/stores/uiStore';
import { CheckCircle2, ShieldCheck, XCircle, MinusCircle } from 'lucide-react';

export interface QCChecklistModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QCChecklistModal: React.FC<QCChecklistModalProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const existing = repair.qcInspection;

  const [checklist, setChecklist] = useState<QCCheckItem[]>(
    existing?.checklist ||
      DEFAULT_QC_ITEMS.map((item) => ({
        key: item.key,
        label: item.label,
        status: 'PASS',
        notes: '',
      }))
  );
  const [qcNotes, setQcNotes] = useState(existing?.notes || '');
  const [loading, setLoading] = useState(false);

  const updateItemStatus = (key: string, status: 'PASS' | 'FAIL' | 'NA') => {
    setChecklist(
      checklist.map((item) => (item.key === key ? { ...item, status } : item))
    );
  };

  const allPassed = checklist.every((item) => item.status === 'PASS' || item.status === 'NA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const inspection: QCInspection = {
        id: existing?.id || `qc-${Date.now()}`,
        repairId: repair.id,
        inspectorName: user.name,
        passed: allPassed,
        checklist,
        notes: qcNotes,
        inspectedAt: new Date().toISOString(),
      };

      const updatedRepair: Repair = {
        ...repair,
        qcInspection: inspection,
      };

      if (allPassed) {
        updatedRepair.status = 'READY_FOR_PICKUP';
        updatedRepair.timeline.push({
          id: `tl-${Date.now()}`,
          status: 'READY_FOR_PICKUP',
          title: 'Quality Check 100% Passed',
          description: `All functional tests verified by Inspector ${user.name}. Device marked Ready for Pickup.`,
          timestamp: new Date().toISOString(),
          userName: user.name,
          userRole: user.role,
        });
        toast.success(
          'QC Inspection Passed!',
          `Ticket ${repair.ticketNumber} moved to READY FOR PICKUP`
        );
      } else {
        updatedRepair.status = 'IN_REPAIR';
        updatedRepair.timeline.push({
          id: `tl-${Date.now()}`,
          status: 'IN_REPAIR',
          title: 'QC Defect Flagged - Sent Back',
          description: `Inspection failed by ${user.name}. Issues noted in checklist. Sent back to bench.`,
          timestamp: new Date().toISOString(),
          userName: user.name,
          userRole: user.role,
        });
        toast.warning(
          'QC Failed',
          'Ticket returned to IN_REPAIR for defect rectification'
        );
      }

      storageService.saveRepair(updatedRepair);
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to submit QC report');
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
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span>Bench Quality Control (QC) Sign-off</span>
        </div>
      }
      description={`Device: ${repair.deviceBrand} ${repair.deviceModel} · Ticket ${repair.ticketNumber}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
          {checklist.map((item) => {
            return (
              <div
                key={item.key}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60"
              >
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.key, 'PASS')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      item.status === 'PASS'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    PASS
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.key, 'FAIL')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                      item.status === 'FAIL'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    FAIL
                  </button>

                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.key, 'NA')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      item.status === 'NA'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    N/A
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Inspector Findings & Notes
          </label>
          <textarea
            rows={2}
            value={qcNotes}
            onChange={(e) => setQcNotes(e.target.value)}
            placeholder="Add any specific observations or note reason for failed checks..."
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
          <div className="text-xs">
            <span className="text-slate-500">Inspection Outcome:</span>
            <strong
              className={`ml-2 uppercase font-black ${
                allPassed ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {allPassed ? 'PASSED (Ready for Pickup)' : 'FAILED (Requires Rework)'}
            </strong>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={allPassed ? 'success' : 'danger'}
            type="submit"
            loading={loading}
          >
            {allPassed ? 'Certify & Move to Ready' : 'Log Failure & Return to Bench'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
