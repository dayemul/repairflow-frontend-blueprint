import React from 'react';
import { RepairStatus } from '@/types';
import { STATUS_COLORS, STATUS_LABELS } from '@/config/constants';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className,
}) => {
  const config = STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
  };

  const label = STATUS_LABELS[status] || status;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'rounded-full',
            config.dot,
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
