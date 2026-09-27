import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition hover:shadow-md border border-slate-200/90 relative overflow-hidden',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1.5 font-mono">
            {value}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        <div className={cn('p-3 rounded-2xl border flex items-center justify-center shrink-0', colors[color])}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-bold',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.value}
          </span>
          <span className="text-slate-400">vs last week</span>
        </div>
      )}
    </Card>
  );
};
