import React from 'react';
import { Repair } from '@/types';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Printer, QrCode } from 'lucide-react';
import { storageService } from '@/lib/storage';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export interface JobCardModalProps {
  repair: Repair;
  isOpen: boolean;
  onClose: () => void;
}

export const JobCardModal: React.FC<JobCardModalProps> = ({ repair, isOpen, onClose }) => {
  const settings = storageService.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Repair Job Card & Intake Slip" maxWidth="2xl">
      <div className="space-y-4">
        {/* Printable Card Area */}
        <div id="printable-job-card" className="p-6 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-4">
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase text-blue-900">
                {settings.shopName}
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mt-0.5">{settings.shopAddress}</p>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Hotline: {settings.shopPhone} | BIN: {settings.taxNumber}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                JOB TICKET
              </span>
              <div className="text-lg font-black font-mono mt-1 text-slate-900">
                {repair.ticketNumber}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {formatDateTime(repair.receivedAt)}
              </div>
            </div>
          </div>

          {/* Barcode / Ticket ID Strip */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-800">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold">Track Online</div>
                <div className="text-xs font-mono font-semibold">fixflow.live/track/{repair.ticketNumber}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 uppercase font-bold block">Priority</span>
              <span className="text-xs font-black text-rose-600 uppercase">{repair.priority} PRIORITY</span>
            </div>
          </div>

          {/* Customer & Device Grids */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5 border-b pb-1">
                Customer Information
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">Name:</span>{' '}
                  <strong className="text-slate-900 text-sm font-bold">{repair.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>{' '}
                  <span className="font-mono font-semibold">{repair.customerPhone}</span>
                </div>
                {repair.customerEmail && (
                  <div>
                    <span className="text-slate-500">Email:</span> {repair.customerEmail}
                  </div>
                )}
              </div>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5 border-b pb-1">
                Device Details
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">Model:</span>{' '}
                  <strong className="text-slate-900 font-bold">
                    {repair.deviceBrand} {repair.deviceModel}
                  </strong>{' '}
                  {repair.deviceColor && `(${repair.deviceColor})`}
                </div>
                <div>
                  <span className="text-slate-500">IMEI / Serial:</span>{' '}
                  <span className="font-mono font-bold text-slate-800">{repair.imeiOrSerial}</span>
                </div>
                <div>
                  <span className="text-slate-500">Passcode / Pattern:</span>{' '}
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 rounded">
                    {repair.passcodePattern || 'None provided'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Condition:</span>{' '}
                  <span className="capitalize">{repair.physicalCondition.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Problem & Accessories */}
          <div className="border border-slate-200 p-3 rounded-lg mb-4 text-xs">
            <div className="font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1">
              Reported Issue & Symptoms
            </div>
            <p className="text-slate-800 leading-relaxed font-medium bg-amber-50/50 p-2 rounded border border-amber-100">
              {repair.problemDescription}
            </p>
            {repair.accessoriesReceived && repair.accessoriesReceived.length > 0 && (
              <div className="mt-2 text-[11px] text-slate-600">
                <strong>Accessories Left With Shop:</strong> {repair.accessoriesReceived.join(', ')}
              </div>
            )}
          </div>

          {/* Pricing & Estimation summary */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 text-xs font-semibold mb-6">
            <span>Estimated Cost: {formatCurrency(repair.estimatedCost)}</span>
            <span>Target Ready Date: {formatDateTime(repair.expectedCompletionDate)}</span>
            <span>Technician: {repair.assignedTechnicianName || 'Bench Unassigned'}</span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 text-xs">
            <div>
              <div className="border-b border-slate-400 h-10 mb-1" />
              <div className="text-[11px] text-slate-500 text-center font-medium">
                Customer Signature & Acceptance
              </div>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 mb-1" />
              <div className="text-[11px] text-slate-500 text-center font-medium">
                FixFlow Authorized Intake Agent
              </div>
            </div>
          </div>

          <div className="mt-4 text-[9px] text-slate-400 text-center leading-tight">
            * Please present this Job Slip or the SMS notification upon device collection. Unclaimed devices past 45 days incur storage charges.
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Job Card
          </Button>
        </div>
      </div>
    </Modal>
  );
};
