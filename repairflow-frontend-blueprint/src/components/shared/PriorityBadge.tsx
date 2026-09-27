import React from 'react';
import { Priority } from '@/types';
import { PRIORITY_COLORS } from '@/config/constants';
import { cn } from '@/lib/utils';

export const PriorityBadge: React.FC<{ priority: Priority; className?: string }> = ({
  priority,
  className,
}) => {
  const config = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;

  return (
    <span
      className={cn(
        'inline-flex items-center text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
        config.badge,
        className
      )}
    >
      {priority}
    </span>
  );
};
