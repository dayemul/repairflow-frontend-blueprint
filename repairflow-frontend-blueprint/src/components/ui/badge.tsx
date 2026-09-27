import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md border',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg border',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 leading-none', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
