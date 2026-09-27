import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/ui/toast';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';

export interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onNewRepair: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  onNavigate,
  onNewRepair,
  children,
}) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

      {/* Main Column */}
      <div
        className={cn(
          'min-h-screen flex flex-col transition-all duration-200',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header onNewRepair={onNewRepair} onNavigate={onNavigate} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modern Toaster Notification Portal */}
      <ToastContainer />
    </div>
  );
};
