import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { toast } from '@/stores/uiStore';
import { BarChart3, Download, TrendingUp, Users, HardDrive, Star } from 'lucide-react';

export const ReportsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const repairs = storageService.getRepairs();
  const invoices = storageService.getInvoices();
  const technicians = storageService.getTechnicians();
  const parts = storageService.getParts();

  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const avgTicketValue = repairs.length > 0 ? Math.round(totalBilled / repairs.length) : 0;

  const totalInventoryValuation = parts.reduce((sum, p) => sum + p.costPrice * p.quantityInStock, 0);
  const totalRetailInventoryValue = parts.reduce((sum, p) => sum + p.sellingPrice * p.quantityInStock, 0);

  const handleExportCSV = (reportName: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportName === 'revenue') {
      csvContent += 'Invoice Number,Customer,Total,Paid,Balance,Status,Date\n';
      invoices.forEach((i) => {
        csvContent += `"${i.invoiceNumber}","${i.customerName}",${i.total},${i.amountPaid},${i.balanceDue},"${i.status}","${i.createdAt}"\n`;
      });
    } else if (reportName === 'inventory') {
      csvContent += 'SKU,Name,Category,Stock,Cost Price,Selling Price,Location\n';
      parts.forEach((p) => {
        csvContent += `"${p.sku}","${p.name}","${p.category}",${p.quantityInStock},${p.costPrice},${p.sellingPrice},"${p.location || ''}"\n`;
      });
    } else {
      csvContent += 'Ticket Number,Customer,Device,Status,Priority,Cost,Received At\n';
      repairs.forEach((r) => {
        csvContent += `"${r.ticketNumber}","${r.customerName}","${r.deviceBrand} ${r.deviceModel}","${r.status}","${r.priority}",${r.estimatedCost || 0},"${r.receivedAt}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fixflow_${reportName}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report Exported', `Generated CSV file for ${reportName}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Business Intelligence"
        description="Comprehensive financials, technician productivity rankings, and warehouse valuation audits"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV('revenue')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Invoices CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportCSV('repairs')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Repairs CSV</span>
            </Button>
          </div>
        }
      />

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Total Invoiced</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            <CurrencyDisplay amount={totalBilled} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Gross billed charges</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">
            Collected Cash Flow
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
            <CurrencyDisplay amount={totalCollected} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Net bank & cash received</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-600">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">
            Outstanding Receivable
          </span>
          <div className="text-2xl font-black font-mono text-rose-600 mt-1">
            <CurrencyDisplay amount={totalOutstanding} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Due upon device collection</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-600">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">
            Average Ticket Size
          </span>
          <div className="text-2xl font-black font-mono text-purple-600 mt-1">
            <CurrencyDisplay amount={avgTicketValue} />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Revenue per repaired unit</span>
        </Card>
      </div>

      {/* Grid: Technician Rankings and Inventory Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technicians productivity leaderboard */}
        <Card className="p-5">
          <CardHeader className="pb-3 border-b mb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Technician Bench Productivity & CSAT</span>
            </CardTitle>
          </CardHeader>

          <div className="space-y-3">
            {technicians.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <strong className="text-slate-900 block font-bold">{t.name}</strong>
                    <span className="text-slate-500 text-[11px]">{t.specialization}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 font-mono text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Completed</span>
                    <strong className="text-slate-900">{t.completedRepairsCount} jobs</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Rating</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                      {t.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Warehouse Inventory Valuation */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b mb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-600" />
                <span>Parts Inventory Capital Valuation</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExportCSV('inventory')}
                className="text-xs text-blue-600"
              >
                Export CSV
              </Button>
            </CardHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    At Purchase Cost
                  </span>
                  <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                    <CurrencyDisplay amount={totalInventoryValuation} />
                  </div>
                  <span className="text-[10px] text-slate-400">Capital invested in components</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Potential Retail Value
                  </span>
                  <div className="text-xl font-black font-mono text-blue-600 mt-0.5">
                    <CurrencyDisplay amount={totalRetailInventoryValue} />
                  </div>
                  <span className="text-[10px] text-slate-400">At current selling rate</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                  Critical Reorder Parts
                </span>
                <div className="space-y-1.5 text-xs">
                  {parts
                    .filter((p) => p.quantityInStock <= p.minThreshold)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-2 rounded-lg bg-amber-50/60 border border-amber-200"
                      >
                        <div className="font-semibold text-amber-950 truncate max-w-xs">{p.name}</div>
                        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {p.quantityInStock} in stock (Min: {p.minThreshold})
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/parts')}
              className="text-xs"
            >
              Manage Warehouse Stock →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
