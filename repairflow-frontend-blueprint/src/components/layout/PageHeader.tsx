import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {b.onClick && !isLast ? (
                  <button
                    onClick={b.onClick}
                    className="hover:text-blue-600 transition font-medium cursor-pointer"
                  >
                    {b.label}
                  </button>
                ) : (
                  <span className={isLast ? 'text-slate-900 font-semibold' : ''}>
                    {b.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
          {description && <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
