import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('border-b border-slate-200 overflow-x-auto no-scrollbar', className)}>
      <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'whitespace-nowrap flex items-center gap-2 py-3 px-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer',
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              )}
            >
              {tab.icon && (
                <span className={cn('w-4 h-4', isActive ? 'text-blue-600' : 'text-slate-400')}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
