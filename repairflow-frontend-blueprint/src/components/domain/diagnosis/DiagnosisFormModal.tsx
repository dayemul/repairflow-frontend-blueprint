import React, { useState } from 'react';
import { Repair, Diagnosis } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/stores/authStore';
import { storageService } from '@/lib/storage';
import { toast } from '@/stores/uiStore';
import { Plus, Trash2, Stethoscope, Droplets, Battery } from 'lucide-react';

export interface DiagnosisFormModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DiagnosisFormModal: React.FC<DiagnosisFormModalProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const existing = repair.diagnosis;

  const [diagnosisNotes, setDiagnosisNotes] = useState(existing?.diagnosisNotes || '');
  const [rootCause, setRootCause] = useState(existing?.rootCause || '');
  const [recommendedAction, setRecommendedAction] = useState(existing?.recommendedAction || '');
  const [batteryHealthPercent, setBatteryHealthPercent] = useState<number | ''>(
    existing?.batteryHealthPercent || ''
  );
  const [liquidDamage, setLiquidDamage] = useState(existing?.liquidDamage || false);
  const [priorRepairAttempt, setPriorRepairAttempt] = useState(
    existing?.priorRepairAttempt || false
  );
  const [findings, setFindings] = useState<string[]>(
    existing?.findings || [
      'Visual inspect revealed shattered glass assembly',
      'Power supply current draw tested normal on DC bench',
    ]
  );
  const [newFindingText, setNewFindingText] = useState('');
  const [loading, setLoading] = useState(false);

  const addFinding = () => {
    if (!newFindingText.trim()) return;
    setFindings([...findings, newFindingText.trim()]);
    setNewFindingText('');
  };

  const removeFinding = (idx: number) => {
    setFindings(findings.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosisNotes.trim() || !rootCause.trim()) {
      toast.error('Please enter diagnosis notes and root cause');
      return;
    }

    setLoading(true);
    try {
      const diag: Diagnosis = {
        id: existing?.id || `diag-${Date.now()}`,
        repairId: repair.id,
        technicianId: user?.id || 'tech-1',
        technicianName: user?.name || 'Assigned Technician',
        reportedIssue: repair.problemDescription,
        diagnosisNotes,
        findings,
        batteryHealthPercent: batteryHealthPercent === '' ? undefined : Number(batteryHealthPercent),
        liquidDamage,
        priorRepairAttempt,
        rootCause,
        recommendedAction,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };

      const updatedRepair: Repair = {
        ...repair,
        diagnosis: diag,
      };

      // Add timeline event
      if (!existing && user) {
        updatedRepair.timeline.push({
          id: `tl-${Date.now()}`,
          status: repair.status,
          title: 'Technical Diagnosis Logged',
          description: `Root cause identified by ${user.name}: ${rootCause.substring(0, 80)}...`,
          timestamp: new Date().toISOString(),
          userName: user.name,
          userRole: user.role,
        });
      }

      storageService.saveRepair(updatedRepair);
      toast.success('Diagnosis Logged', 'Technical inspection report saved');
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to save diagnosis');
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
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <span>{existing ? 'Edit' : 'Record'} Technical Diagnosis</span>
        </div>
      }
      description={`Device: ${repair.deviceBrand} ${repair.deviceModel} (Ticket: ${repair.ticketNumber})`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer reported issue reminder */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <span className="font-bold text-slate-500 uppercase">Customer Complaint:</span>
          <p className="text-slate-800 mt-0.5">{repair.problemDescription}</p>
        </div>

        {/* Quick inspection flags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={liquidDamage}
              onChange={(e) => setLiquidDamage(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" /> Liquid Damage
              </span>
              <p className="text-slate-500 text-[10px]">LDI strips triggered</p>
            </div>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={priorRepairAttempt}
              onChange={(e) => setPriorRepairAttempt(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800">Prior 3rd Party Repair</span>
              <p className="text-slate-500 text-[10px]">Missing screws/seals</p>
            </div>
          </label>

          <div>
            <Input
              label="Battery Health %"
              type="number"
              min="0"
              max="100"
              value={batteryHealthPercent}
              onChange={(e) =>
                setBatteryHealthPercent(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="e.g. 84"
              leftIcon={<Battery className="w-4 h-4 text-emerald-500" />}
            />
          </div>
        </div>

        {/* Key Findings List */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Key Findings / Test Points
          </label>
          <div className="space-y-2 mb-2">
            {findings.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="text-slate-800 font-medium">• {f}</span>
                <button
                  type="button"
                  onClick={() => removeFinding(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFindingText}
              onChange={(e) => setNewFindingText(e.target.value)}
              placeholder="e.g., Short circuit found on PP_VDD_MAIN capacitor C3421"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFinding();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button variant="secondary" size="sm" type="button" onClick={addFinding}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Root Cause & Recommended Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Root Cause Identification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="e.g., Moisture corrosion bridging positive battery terminal pins..."
              required
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recommended Action & Parts Needed
            </label>
            <textarea
              rows={3}
              value={recommendedAction}
              onChange={(e) => setRecommendedAction(e.target.value)}
              placeholder="e.g., Ultrasonic bath, solder replacement flex cable, replace battery cell..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Diagnostic Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Bench Notes & Bench Measurements <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={diagnosisNotes}
            onChange={(e) => setDiagnosisNotes(e.target.value)}
            placeholder="Detailed bench test log, multimeter voltages, thermal camera heat spots..."
            required
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Save Diagnosis
          </Button>
        </div>
      </form>
    </Modal>
  );
};
