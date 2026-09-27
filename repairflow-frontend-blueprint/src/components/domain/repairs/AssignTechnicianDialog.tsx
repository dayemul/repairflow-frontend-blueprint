import React, { useState } from 'react';
import { Repair, Technician } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { Check, Star, Wrench } from 'lucide-react';

export interface AssignTechnicianDialogProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignTechnicianDialog: React.FC<AssignTechnicianDialogProps> = ({
  repair,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const technicians = storageService.getTechnicians();
  const [selectedTechId, setSelectedTechId] = useState<string>(
    repair.assignedTechnicianId || technicians[0]?.id || ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const tech = technicians.find((t) => t.id === selectedTechId);
    if (!tech) {
      toast.error('Please select a technician');
      return;
    }

    setLoading(true);
    try {
      storageService.assignTechnician(repair.id, tech, user);
      toast.success(
        `Technician Assigned`,
        `${tech.name} has been assigned to ticket ${repair.ticketNumber}`
      );
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Failed to assign technician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Technician"
      description={`Select a bench engineer for ticket ${repair.ticketNumber} (${repair.deviceBrand} ${repair.deviceModel})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {technicians.map((t) => {
            const isSelected = selectedTechId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTechId(t.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{t.name}</span>
                      <span className="text-[11px] flex items-center text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {t.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{t.specialization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      t.status === 'AVAILABLE'
                        ? 'success'
                        : t.status === 'BUSY'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {t.activeRepairsCount} active jobs
                  </Badge>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
