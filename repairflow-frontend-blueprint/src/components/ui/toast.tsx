import React from 'react';
import { useUIStore, toast } from '@/stores/uiStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
        };

        const borderColors = {
          success: 'border-emerald-200 bg-white shadow-emerald-100',
          error: 'border-rose-200 bg-white shadow-rose-100',
          warning: 'border-amber-200 bg-white shadow-amber-100',
          info: 'border-blue-200 bg-white shadow-blue-100',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              borderColors[t.type]
            }`}
          >
            {icons[t.type]}
            <div className="flex-1 text-sm">
              <div className="font-semibold text-slate-900">{t.title}</div>
              {t.message && <p className="text-slate-600 mt-0.5 text-xs">{t.message}</p>}
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
