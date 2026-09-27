import React, { useState } from 'react';
import { storageService, resetStorage } from '@/lib/storage';
import { ShopSettings } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/stores/uiStore';
import { Settings, Save, RotateCcw } from 'lucide-react';

export const SettingsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<ShopSettings>(storageService.getSettings());

  const handleChange = (key: keyof ShopSettings, val: any) => {
    setSettings({ ...settings, [key]: val });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    toast.success('Configuration Saved', 'Shop parameters updated successfully');
  };

  const handleResetData = () => {
    if (window.confirm('Restore demo dataset? All newly added repairs and customer records will be reset to default.')) {
      resetStorage();
      setSettings(storageService.getSettings());
      toast.success('System Reset', 'Demo fixtures reloaded');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Workshop & System Settings"
        description="Configure workshop profile, tax rate, invoice numbering, default warranty, and terms"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Settings' },
        ]}
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Shop Profile */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Shop Profile & Legal Intake Identity
          </h3>

          <div className="space-y-4">
            <Input
              label="Shop / Business Name"
              value={settings.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              required
            />

            <Input
              label="Full Physical Address (Printed on Invoices & Job Cards)"
              value={settings.shopAddress}
              onChange={(e) => handleChange('shopAddress', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone / Hotline"
                value={settings.shopPhone}
                onChange={(e) => handleChange('shopPhone', e.target.value)}
                required
              />

              <Input
                label="Support Email"
                value={settings.shopEmail}
                onChange={(e) => handleChange('shopEmail', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Govt Tax BIN / VAT Number"
                value={settings.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Currency & Symbol
                </label>
                <select
                  value={settings.currencyCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const symbols: Record<string, string> = {
                      BDT: '৳',
                      USD: '$',
                      EUR: '€',
                      GBP: '£',
                    };
                    handleChange('currencyCode', code);
                    handleChange('currencySymbol', symbols[code] || '$');
                  }}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-medium"
                >
                  <option value="BDT">BDT (Bangladeshi Taka — ৳)</option>
                  <option value="USD">USD (US Dollar — $)</option>
                  <option value="EUR">EUR (Euro — €)</option>
                  <option value="GBP">GBP (British Pound — £)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Numbering & Defaults */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Numbering Prefixes & Service Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Repair Ticket Prefix"
              value={settings.repairPrefix}
              onChange={(e) => handleChange('repairPrefix', e.target.value)}
              required
            />

            <Input
              label="Invoice Number Prefix"
              value={settings.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              required
            />

            <Input
              label="Standard Default Tax Rate (%)"
              type="number"
              value={settings.defaultTaxRatePercent}
              onChange={(e) => handleChange('defaultTaxRatePercent', Number(e.target.value))}
              min="0"
              max="30"
            />

            <Input
              label="Standard Warranty Duration (Months)"
              type="number"
              value={settings.defaultWarrantyDurationMonths}
              onChange={(e) => handleChange('defaultWarrantyDurationMonths', Number(e.target.value))}
              min="1"
              max="24"
            />
          </div>
        </Card>

        {/* Legal Terms & Conditions */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Default Customer Terms & Guarantee Policy
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Appears on job cards, invoice footers, and warranty certificates.
          </p>
          <textarea
            rows={4}
            value={settings.termsAndConditions}
            onChange={(e) => handleChange('termsAndConditions', e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-mono leading-relaxed"
          />
        </Card>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetData}
            className="gap-2 text-rose-600 hover:bg-rose-50 border-rose-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </Button>

          <Button type="submit" variant="primary" className="gap-2 px-6">
            <Save className="w-4 h-4" />
            <span>Save Workshop Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
