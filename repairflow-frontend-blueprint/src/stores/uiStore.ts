import { useState, useEffect } from 'react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

let toasts: ToastItem[] = [];
let sidebarOpen = true;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export const toast = {
  show: (type: ToastItem['type'], title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    toasts = [...toasts, { id, type, title, message, duration }];
    notify();

    setTimeout(() => {
      toast.dismiss(id);
    }, duration);
  },
  success: (title: string, message?: string) => toast.show('success', title, message),
  error: (title: string, message?: string) => toast.show('error', title, message, 5000),
  warning: (title: string, message?: string) => toast.show('warning', title, message),
  info: (title: string, message?: string) => toast.show('info', title, message),
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export const uiActions = {
  toggleSidebar: () => {
    sidebarOpen = !sidebarOpen;
    notify();
  },
  setSidebarOpen: (open: boolean) => {
    sidebarOpen = open;
    notify();
  },
};

export function useUIStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return {
    sidebarOpen,
    toasts,
    ...uiActions,
    toast,
  };
}
