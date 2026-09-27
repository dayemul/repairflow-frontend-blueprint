import React, { useState } from 'react';
import { useAuth } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Role } from '@/types';
import { Wrench, Shield, Check, Lock, Mail } from 'lucide-react';

export interface LoginPageProps {
  onLoginSuccess?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSuccess }) => {
  const triggerSuccess = () => {
    onSuccess?.();
    onLoginSuccess?.();
  };
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@fixflow.com');
  const [password, setPassword] = useState('••••••••');
  const [role, setRole] = useState<Role>('ADMIN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    triggerSuccess();
  };

  const handleQuickLogin = (quickRole: Role, userEmail: string, name: string) => {
    login(userEmail, quickRole, name);
    triggerSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl shadow-blue-500/30 mb-4">
          F
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">FixFlow Pro</h2>
        <p className="mt-1 text-xs text-slate-400">
          Precision Repair Shop & Bench Diagnostics Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Staff Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@fixflow.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Secure Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-2.5 font-bold shadow-md">
                Sign In to Workshop
              </Button>
            </div>
          </form>

          {/* Quick Demo Login Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
              One-Click Role Demo Access:
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN', 'admin@fixflow.com', 'Dayem Sakib')}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 font-bold transition text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>Admin</span>
                  <span className="text-[10px] bg-rose-200 px-1 rounded">ALL</span>
                </div>
                <div className="text-[10px] text-rose-700 font-normal">Full Configuration</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('MANAGER', 'manager@fixflow.com', 'Nasir Uddin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-bold transition text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>Manager</span>
                  <span className="text-[10px] bg-purple-200 px-1 rounded">MGMT</span>
                </div>
                <div className="text-[10px] text-purple-700 font-normal">Quotes & Operations</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('TECHNICIAN', 'karim.tech@fixflow.com', 'Karim Rahman')
                }
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-bold transition text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>Technician</span>
                  <span className="text-[10px] bg-blue-200 px-1 rounded">BENCH</span>
                </div>
                <div className="text-[10px] text-blue-700 font-normal">Diagnosis & QC</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CASHIER', 'cashier@fixflow.com', 'Sumon Ahmed')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-bold transition text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span>Cashier</span>
                  <span className="text-[10px] bg-emerald-200 px-1 rounded">DESK</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-normal">Intake & Cash</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Looking for customer warranty verification?{' '}
          <a
            href="#/warranty/check"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '/warranty/check';
            }}
            className="text-blue-400 hover:underline font-semibold"
          >
            Visit Public Lookup Portal
          </a>
        </div>
      </div>
    </div>
  );
};
