import React from 'react';
import { Repair } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export interface RepairStatusDonutProps {
  repairs: Repair[];
}

export const RepairStatusDonut: React.FC<RepairStatusDonutProps> = ({ repairs }) => {
  const groups: { label: string; count: number; color: string; hex: string }[] = [
    {
      label: 'In Repair / Bench',
      count: repairs.filter((r) => r.status === 'IN_REPAIR' || r.status === 'WAITING_FOR_PARTS')
        .length,
      color: 'bg-purple-500',
      hex: '#a855f7',
    },
    {
      label: 'Diagnosing / Approval',
      count: repairs.filter(
        (r) =>
          r.status === 'DIAGNOSING' ||
          r.status === 'WAITING_FOR_APPROVAL' ||
          r.status === 'APPROVED'
      ).length,
      color: 'bg-blue-500',
      hex: '#3b82f6',
    },
    {
      label: 'QC & Ready for Pickup',
      count: repairs.filter(
        (r) => r.status === 'QUALITY_CHECK' || r.status === 'READY_FOR_PICKUP'
      ).length,
      color: 'bg-emerald-500',
      hex: '#10b981',
    },
    {
      label: 'Delivered / Completed',
      count: repairs.filter((r) => r.status === 'DELIVERED').length,
      color: 'bg-slate-500',
      hex: '#64748b',
    },
  ];

  const total = groups.reduce((sum, g) => sum + g.count, 0) || 1;

  // SVG Donut metrics
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Pipeline Breakdown</CardTitle>
        <span className="text-xs text-slate-400 font-mono">{repairs.length} total jobs</span>
      </CardHeader>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-auto py-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-100"
              strokeWidth="12"
              stroke="currentColor"
              fill="transparent"
            />
            {groups.map((group, idx) => {
              const percent = group.count / total;
              const strokeDasharray = `${percent * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;

              if (group.count === 0) return null;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={group.hex}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 hover:opacity-80"
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 font-mono leading-none">
              {repairs.length}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Tickets
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {groups.map((group, idx) => {
            const pct = Math.round((group.count / total) * 100);
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${group.color}`} />
                  <span className="text-slate-700 font-medium">{group.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <strong className="text-slate-900 font-bold">{group.count}</strong>
                  <span className="text-slate-400 text-[11px] w-8 text-right">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
        Real-time ticket flow updated on every stage transition
      </div>
    </Card>
  );
};
