import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 ${className || ''}`}>
      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
