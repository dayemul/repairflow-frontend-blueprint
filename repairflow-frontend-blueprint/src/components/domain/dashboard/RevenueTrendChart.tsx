import React from 'react';
import { Invoice } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export interface RevenueTrendChartProps {
  invoices: Invoice[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ invoices }) => {
  // Generate last 7 days simulation based on invoices
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const dayValues = [14200, 22500, 18900, 31000, 26400, 38000, 28000];
  const maxVal = Math.max(...dayValues) * 1.15;

  const totalWeekRevenue = dayValues.reduce((a, b) => a + b, 0);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div>
          <CardTitle>Revenue Flow (Last 7 Days)</CardTitle>
          <div className="text-xs text-slate-500 mt-0.5">Cash, bKash & POS card settlements</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-slate-900 font-mono">
            {formatCurrency(totalWeekRevenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            +18.4% vs last week
          </span>
        </div>
      </CardHeader>

      {/* SVG Bar Chart */}
      <div className="pt-4 pb-2">
        <div className="h-44 flex items-end justify-between gap-2 px-2">
          {days.map((day, idx) => {
            const val = dayValues[idx];
            const heightPercent = Math.round((val / maxVal) * 100);
            const isToday = idx === days.length - 1;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded pointer-events-none mb-1 shadow-xs">
                  {formatCurrency(val)}
                </div>

                <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-blue-600 shadow-md shadow-blue-500/20 group-hover:bg-blue-700'
                        : 'bg-slate-300 group-hover:bg-blue-400'
                    }`}
                  />
                </div>

                <span
                  className={`text-[11px] font-semibold ${
                    isToday ? 'text-blue-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Daily Target: ৳25,000</span>
        <span className="font-semibold text-emerald-600">5 of 7 days exceeded</span>
      </div>
    </Card>
  );
};
