import React from 'react';
import { RepairStatus } from '@/types';
import { REPAIR_PIPELINE_STATUSES, STATUS_LABELS } from '@/config/constants';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RepairStatusFlowProps {
  currentStatus: RepairStatus;
  className?: string;
}

export const RepairStatusFlow: React.FC<RepairStatusFlowProps> = ({
  currentStatus,
  className,
}) => {
  const isTerminalFailure = ['REJECTED', 'CANCELLED', 'UNABLE_TO_REPAIR'].includes(currentStatus);
  const currentIndex = REPAIR_PIPELINE_STATUSES.indexOf(currentStatus);

  if (isTerminalFailure) {
    return (
      <div className={cn('p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-center gap-3', className)}>
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-rose-900 uppercase tracking-wide">
            Workflow Halted: {STATUS_LABELS[currentStatus]}
          </div>
          <div className="text-xs text-rose-700 mt-0.5">
            This ticket is flagged as {currentStatus.replace(/_/g, ' ').toLowerCase()}. Review diagnosis or customer communication for next actions.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full py-4 overflow-x-auto no-scrollbar', className)}>
      <div className="min-w-[720px] flex items-center justify-between relative px-2">
        {/* Connector Line behind steps */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
        
        {/* Active progress track */}
        <div
          className="absolute top-4 left-6 h-0.5 bg-blue-600 z-0 transition-all duration-300"
          style={{
            width: currentIndex >= 0 ? `${(currentIndex / (REPAIR_PIPELINE_STATUSES.length - 1)) * 92}%` : '0%',
          }}
        />

        {REPAIR_PIPELINE_STATUSES.map((status, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-2 border-blue-600 text-blue-600 ring-4 ring-blue-100 shadow-md scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-[11px] mt-2 text-center whitespace-nowrap max-w-[85px] leading-tight font-medium',
                  isCurrent
                    ? 'text-blue-700 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
