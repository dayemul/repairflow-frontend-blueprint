import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Warranty } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WarrantyCertificateModal } from '@/components/domain/warranty/WarrantyCertificateModal';
import { ShieldCheck, Search, Printer } from 'lucide-react';

export const WarrantyListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [warranties, setWarranties] = useState<Warranty[]>(storageService.getWarranties());
  const [search, setSearch] = useState('');
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const filtered = warranties.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.warrantyCode.toLowerCase().includes(q) ||
      w.customerName.toLowerCase().includes(q) ||
      w.deviceModel.toLowerCase().includes(q) ||
      w.imeiOrSerial.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post-Repair Warranties"
        description="Active repair guarantees, parts coverage records, and public verification records"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Warranties' },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => onNavigate('/warranty/check')}
            className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            <Search className="w-4 h-4" />
            <span>Open Public Lookup Portal</span>
          </Button>
        }
      />

      <Card className="p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by warranty code, customer name, device model, or IMEI/SN..."
        />
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Warranty Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">IMEI / Serial</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-right">Valid Until</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{w.warrantyCode}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{w.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{w.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{w.deviceModel}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{w.imeiOrSerial}</td>
                  <td className="py-3 px-4 max-w-xs text-slate-600 truncate">
                    {w.coverageDetails}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        w.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : w.status === 'EXPIRED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {w.durationMonths} Mos
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    <DateDisplay value={w.endDate} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWarranty(w)}
                      className="text-xs px-2 py-1 gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Certificate</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Certificate Modal */}
      {selectedWarranty && (
        <WarrantyCertificateModal
          warranty={selectedWarranty}
          isOpen={!!selectedWarranty}
          onClose={() => setSelectedWarranty(null)}
        />
      )}
    </div>
  );
};
