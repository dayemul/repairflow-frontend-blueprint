import React from 'react';
import { Warranty } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { storageService } from '@/lib/storage';
import { ShieldCheck, Printer, Award } from 'lucide-react';

export interface WarrantyCertificateModalProps {
  warranty: Warranty;
  isOpen: boolean;
  onClose: () => void;
}

export const WarrantyCertificateModal: React.FC<WarrantyCertificateModalProps> = ({
  warranty,
  isOpen,
  onClose,
}) => {
  const settings = storageService.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Service Warranty Certificate" maxWidth="2xl">
      <div className="space-y-4">
        {/* Printable Certificate */}
        <div
          id="printable-warranty"
          className="p-8 border-4 border-double border-blue-900 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50/30 text-slate-900 font-sans relative overflow-hidden"
        >
          {/* Watermark badge icon */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <Award className="w-64 h-64 text-blue-900" />
          </div>

          <div className="text-center pb-6 border-b border-blue-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 mb-2">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest">
              Certificate of Service Warranty
            </h1>
            <p className="text-xs text-blue-900 font-semibold tracking-wide uppercase mt-1">
              {settings.shopName}
            </p>
          </div>

          <div className="my-6 text-center">
            <div className="text-xs text-slate-500 uppercase font-semibold">Warranty Serial Number</div>
            <div className="text-xl font-black font-mono text-blue-700 tracking-wider mt-0.5">
              {warranty.warrantyCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-white/80 p-4 rounded-xl border border-blue-100 shadow-xs mb-6">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Issued To:</span>
              <div className="font-bold text-slate-900">{warranty.customerName}</div>
              <div className="text-slate-600 font-mono">{warranty.customerPhone}</div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Device Serviced:</span>
              <div className="font-bold text-slate-900">{warranty.deviceModel}</div>
              <div className="text-slate-600 font-mono">IMEI: {warranty.imeiOrSerial}</div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Warranty Coverage:</span>
              <div className="font-semibold text-slate-800">{warranty.coverageDetails}</div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Duration & Period:</span>
              <div className="font-bold text-emerald-700">{warranty.durationMonths} Months Guaranteed</div>
              <div className="text-slate-500 text-[11px]">
                Valid: <DateDisplay value={warranty.startDate} /> — <DateDisplay value={warranty.endDate} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-blue-950 mb-6 leading-relaxed">
            <strong>Warranty Conditions:</strong> {warranty.terms}
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-blue-200 text-xs">
            <div className="text-[10px] text-slate-500 max-w-xs">
              Check authenticity anytime at <strong>fixflow.live/warranty/check</strong> by entering this serial number.
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 w-36 h-6 mb-1" />
              <div className="text-[10px] font-bold text-slate-600 uppercase">
                Authorized Lab Signatory
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Warranty Certificate
          </Button>
        </div>
      </div>
    </Modal>
  );
};
