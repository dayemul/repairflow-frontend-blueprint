import React, { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { RepairListPage } from '@/pages/repairs/RepairListPage';
import { RepairCreatePage } from '@/pages/repairs/RepairCreatePage';
import { RepairDetailPage } from '@/pages/repairs/RepairDetailPage';
import { CustomerListPage } from '@/pages/customers/CustomerListPage';
import { CustomerDetailPage } from '@/pages/customers/CustomerDetailPage';
import { TechnicianListPage } from '@/pages/technicians/TechnicianListPage';
import { ProductListPage } from '@/pages/products/ProductListPage';
import { PartListPage } from '@/pages/parts/PartListPage';
import { EstimateListPage } from '@/pages/estimates/EstimateListPage';
import { InvoiceListPage } from '@/pages/invoices/InvoiceListPage';
import { PaymentListPage } from '@/pages/payments/PaymentListPage';
import { WarrantyListPage } from '@/pages/warranties/WarrantyListPage';
import { WarrantyCheckPage } from '@/pages/warranties/WarrantyCheckPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is accessing public warranty check, allow it without login
  if (currentPath === '/warranty/check') {
    return <WarrantyCheckPage onNavigate={navigate} />;
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => navigate('/')} />;
  }

  // Dynamic router resolution
  const renderCurrentView = () => {
    if (currentPath === '/') {
      return (
        <DashboardPage
          onNavigate={navigate}
          onNewRepair={() => navigate('/repairs/new')}
        />
      );
    }

    if (currentPath === '/repairs') {
      return (
        <RepairListPage
          onNavigate={navigate}
          onNewRepair={() => navigate('/repairs/new')}
        />
      );
    }

    if (currentPath === '/repairs/new') {
      return <RepairCreatePage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/repairs/')) {
      const repairId = currentPath.replace('/repairs/', '');
      return <RepairDetailPage repairId={repairId} onNavigate={navigate} />;
    }

    if (currentPath === '/customers') {
      return <CustomerListPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/customers/')) {
      const custId = currentPath.replace('/customers/', '');
      return (
        <CustomerDetailPage
          customerId={custId}
          onNavigate={navigate}
          onNewRepair={() => navigate('/repairs/new')}
        />
      );
    }

    if (currentPath === '/technicians') {
      return <TechnicianListPage onNavigate={navigate} />;
    }

    if (currentPath === '/products') {
      return <ProductListPage onNavigate={navigate} />;
    }

    if (currentPath === '/parts') {
      return <PartListPage onNavigate={navigate} />;
    }

    if (currentPath === '/estimates') {
      return <EstimateListPage onNavigate={navigate} />;
    }

    if (currentPath === '/invoices') {
      return <InvoiceListPage onNavigate={navigate} />;
    }

    if (currentPath === '/payments') {
      return <PaymentListPage onNavigate={navigate} />;
    }

    if (currentPath === '/warranties') {
      return <WarrantyListPage onNavigate={navigate} />;
    }

    if (currentPath === '/reports') {
      return <ReportsPage onNavigate={navigate} />;
    }

    if (currentPath === '/settings') {
      return <SettingsPage onNavigate={navigate} />;
    }

    // Default fallback to Dashboard
    return (
      <DashboardPage
        onNavigate={navigate}
        onNewRepair={() => navigate('/repairs/new')}
      />
    );
  };

  return (
    <AppLayout
      currentPath={currentPath}
      onNavigate={navigate}
      onNewRepair={() => navigate('/repairs/new')}
    >
      {renderCurrentView()}
    </AppLayout>
  );
}
