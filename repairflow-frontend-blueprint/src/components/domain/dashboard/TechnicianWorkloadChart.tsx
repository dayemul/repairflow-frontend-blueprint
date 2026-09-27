import React from 'react';
import { Technician } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export interface TechnicianWorkloadChartProps {
  technicians: Technician[];
}

export const TechnicianWorkloadChart: React.FC<TechnicianWorkloadChartProps> = ({ technicians }) => {
  const maxRepairs = Math.max(...technicians.map((t) => t.activeRepairsCount), 4);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle>Technician Workload</CardTitle>
        <span className="text-xs text-slate-400 font-mono">{technicians.length} active engineers</span>
      </CardHeader>

      <div className="space-y-3.5 my-auto py-1">
        {technicians.map((tech) => {
          const loadPercent = Math.min(100, Math.round((tech.activeRepairsCount / maxRepairs) * 100));

          return (
            <div key={tech.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{tech.name}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[120px]">
                    ({tech.specialization.split('&')[0]})
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="flex items-center text-[10px] text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    {tech.rating}
                  </span>
                  <strong className="text-slate-900 font-bold">{tech.activeRepairsCount} jobs</strong>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${loadPercent}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    tech.activeRepairsCount >= 3
                      ? 'bg-amber-500'
                      : tech.activeRepairsCount > 0
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
        <span>Capacity: 4 jobs max/tech</span>
        <span className="font-semibold text-blue-600">Lab load: Normal</span>
      </div>
    </Card>
  );
};
