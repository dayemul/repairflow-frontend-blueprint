import React from 'react';
import { RepairTimelineEvent } from '@/types';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Clock, User } from 'lucide-react';

export const RepairTimeline: React.FC<{ events: RepairTimelineEvent[] }> = ({ events }) => {
  const sorted = [...events].reverse();

  if (sorted.length === 0) {
    return <p className="text-xs text-slate-400 py-4">No timeline events recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sorted.map((evt, idx) => {
        return (
          <div key={evt.id || idx} className="relative group">
            {/* Timeline bullet */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center shadow-xs">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{evt.title}</span>
                  <StatusBadge status={evt.status} size="sm" showDot={false} />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <DateDisplay value={evt.timestamp} showTime />
                </div>
              </div>

              {evt.description && (
                <p className="text-xs text-slate-700 leading-relaxed mb-2">
                  {evt.description}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                <User className="w-3 h-3 text-slate-400" />
                <span>
                  By <strong className="text-slate-700 font-semibold">{evt.userName}</strong> ({evt.userRole})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
