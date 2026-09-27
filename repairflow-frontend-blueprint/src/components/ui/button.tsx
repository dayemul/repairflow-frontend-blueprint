import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow focus:ring-blue-500',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400',
      outline:
        'border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 focus:ring-slate-400',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
      ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
