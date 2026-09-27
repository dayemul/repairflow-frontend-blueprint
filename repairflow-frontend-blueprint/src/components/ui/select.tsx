import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer',
              error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
