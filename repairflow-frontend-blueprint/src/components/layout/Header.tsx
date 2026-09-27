import React, { useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { usePermission } from '@/hooks/usePermission';
import { storageService, resetStorage } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Role } from '@/types';
import { toast } from '@/stores/uiStore';
import {
  Wrench,
  RotateCcw,
  UserCheck,
  ChevronDown,
  LogOut,
  Shield,
  HelpCircle,
} from 'lucide-react';

export interface HeaderProps {
  onNewRepair: () => void;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNewRepair, onNavigate }) => {
  const { user, switchRole, logout } = useAuth();
  const { role } = usePermission();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { id: Role; label: string; desc: string; color: string }[] = [
    { id: 'ADMIN', label: 'Admin (Dayem)', desc: 'Full System & Settings Access', color: 'bg-rose-500' },
    { id: 'MANAGER', label: 'Manager (Nasir)', desc: 'Repairs, Quotes, Techs & Reports', color: 'bg-purple-500' },
    { id: 'TECHNICIAN', label: 'Technician (Karim)', desc: 'Diagnosis, Parts & QC Signoff', color: 'bg-blue-500' },
    { id: 'CASHIER', label: 'Cashier (Sumon)', desc: 'Intake, Invoicing & Payments', color: 'bg-emerald-500' },
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all repairs, parts, and invoices back to default demo state?')) {
      resetStorage();
      toast.success('Sample Data Reset', 'Initial workshop state restored');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left title & context */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
          Active Workshop Lab:
        </span>
        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 truncate max-w-[200px] sm:max-w-none">
          FixFlow Banani Hub · Dhaka
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Sample Data Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetData}
          title="Restore original demo data"
          className="hidden md:inline-flex text-xs text-slate-600 gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Demo</span>
        </Button>

        {/* Quick New Repair Ticket */}
        <Button
          variant="primary"
          size="sm"
          onClick={onNewRepair}
          className="gap-1.5 font-semibold text-xs sm:text-sm"
        >
          <Wrench className="w-4 h-4" />
          <span>New Repair</span>
        </Button>

        {/* Quick Role Switcher for Testing */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.role[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-slate-900 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-blue-600 font-semibold">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowRoleMenu(false)}
            />
          )}

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" /> Switch Role to Test UI Gating:
              </div>

              <div className="py-1 space-y-1">
                {roles.map((r) => {
                  const isCurrent = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        switchRole(r.id);
                        setShowRoleMenu(false);
                        toast.info(`Switched Role to ${r.id}`, `Now testing as ${r.label}`);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start gap-2.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50/80 border border-blue-200'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${r.color}`} />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{r.label}</span>
                          {isCurrent && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{r.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-1">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out (to Login Page)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
