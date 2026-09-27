import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Repair, Invoice, Warranty } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { RepairStatusFlow } from '@/components/domain/repairs/RepairStatusFlow';
import { RepairTimeline } from '@/components/domain/repairs/RepairTimeline';
import { ChangeStatusDialog } from '@/components/domain/repairs/ChangeStatusDialog';
import { AssignTechnicianDialog } from '@/components/domain/repairs/AssignTechnicianDialog';
import { JobCardModal } from '@/components/domain/repairs/JobCardModal';
import { DiagnosisFormModal } from '@/components/domain/diagnosis/DiagnosisFormModal';
import { EstimatePreviewModal } from '@/components/domain/estimates/EstimatePreviewModal';
import { ApproveRejectDialog } from '@/components/domain/estimates/ApproveRejectDialog';
import { PartUsageModal } from '@/components/domain/parts/PartUsageModal';
import { QCChecklistModal } from '@/components/domain/qc/QCChecklistModal';
import { InvoicePreviewModal } from '@/components/domain/invoices/InvoicePreviewModal';
import { PaymentFormModal } from '@/components/domain/invoices/PaymentFormModal';
import { WarrantyCertificateModal } from '@/components/domain/warranty/WarrantyCertificateModal';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { generateCode } from '@/lib/utils';
import {
  ArrowLeft,
  Printer,
  ChevronDown,
  UserCheck,
  Stethoscope,
  Calculator,
  Wrench,
  ShieldCheck,
  Receipt,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  CreditCard,
  Droplets,
  Battery,
} from 'lucide-react';

export interface RepairDetailPageProps {
  repairId: string;
  onNavigate: (path: string) => void;
}

export const RepairDetailPage: React.FC<RepairDetailPageProps> = ({ repairId, onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [repair, setRepair] = useState<Repair | undefined>(storageService.getRepairById(repairId));

  // Dialog triggers
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showJobCardModal, setShowJobCardModal] = useState(false);
  const [showDiagModal, setShowDiagModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false);
  const [showPartUsageModal, setShowPartUsageModal] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const refreshRepair = () => {
    setRepair(storageService.getRepairById(repairId));
  };

  if (!repair) {
    return (
      <EmptyState
        title="Repair Ticket Not Found"
        description="The requested repair ticket does not exist or has been removed."
        actionLabel="Back to Repair Tickets"
        onAction={() => onNavigate('/repairs')}
      />
    );
  }

  // Linked invoice & warranty
  const invoice = repair.invoiceId ? storageService.getInvoiceById(repair.invoiceId) : undefined;
  const warranty = repair.warrantyId
    ? storageService.getWarranties().find((w) => w.id === repair.warrantyId)
    : undefined;

  const handleGenerateInvoice = () => {
    if (!repair.estimate) {
      toast.error('Generate and approve an estimate first');
      return;
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateCode('INV', 6),
      repairId: repair.id,
      customerId: repair.customerId,
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      estimateId: repair.estimate.id,
      items: repair.estimate.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      subtotal: repair.estimate.subtotal,
      discount: repair.estimate.discount,
      tax: repair.estimate.tax,
      total: repair.estimate.total,
      amountPaid: 0,
      balanceDue: repair.estimate.total,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      payments: [],
    };

    storageService.saveInvoice(newInvoice);

    const updatedRepair: Repair = {
      ...repair,
      invoiceId: newInvoice.id,
    };
    if (user) {
      updatedRepair.timeline.push({
        id: `tl-${Date.now()}`,
        status: repair.status,
        title: 'Tax Invoice Created',
        description: `Invoice ${newInvoice.invoiceNumber} generated for ৳${newInvoice.total.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        userRole: user.role,
      });
    }

    storageService.saveRepair(updatedRepair);
    refreshRepair();
    toast.success('Invoice Generated', `${newInvoice.invoiceNumber} created`);
  };

  const handleIssueWarranty = () => {
    const settings = storageService.getSettings();
    const duration = settings.defaultWarrantyDurationMonths || 3;
    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + duration);

    const newWarranty: Warranty = {
      id: `war-${Date.now()}`,
      warrantyCode: generateCode('WAR', 5),
      repairId: repair.id,
      invoiceId: repair.invoiceId || 'none',
      customerName: repair.customerName,
      customerPhone: repair.customerPhone,
      deviceModel: `${repair.deviceBrand} ${repair.deviceModel}`,
      imeiOrSerial: repair.imeiOrSerial,
      coverageDetails: 'Workmanship and replacement parts covered against functional failure.',
      durationMonths: duration,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'ACTIVE',
      terms: settings.termsAndConditions,
      claimsCount: 0,
    };

    storageService.saveWarranty(newWarranty);

    const updatedRepair: Repair = {
      ...repair,
      warrantyId: newWarranty.id,
    };
    if (user) {
      updatedRepair.timeline.push({
        id: `tl-${Date.now()}`,
        status: repair.status,
        title: 'Warranty Issued',
        description: `Warranty ${newWarranty.warrantyCode} active for ${duration} months`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        userRole: user.role,
      });
    }

    storageService.saveRepair(updatedRepair);
    refreshRepair();
    toast.success('Warranty Issued', `${newWarranty.warrantyCode} generated`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    {
      id: 'diagnosis',
      label: 'Diagnosis',
      badge: repair.diagnosis ? 'Done' : undefined,
    },
    {
      id: 'estimate',
      label: 'Estimate',
      badge: repair.estimate ? repair.estimate.status : undefined,
    },
    {
      id: 'parts',
      label: 'Parts Used',
      badge: repair.partsUsed.length > 0 ? repair.partsUsed.length : undefined,
    },
    {
      id: 'qc',
      label: 'Quality Check',
      badge: repair.qcInspection ? (repair.qcInspection.passed ? 'Passed' : 'Failed') : undefined,
    },
    {
      id: 'invoice',
      label: 'Invoice & Pay',
      badge: invoice ? invoice.status : undefined,
    },
    {
      id: 'warranty',
      label: 'Warranty',
      badge: warranty ? 'Active' : undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/repairs')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Back to Tickets"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                {repair.ticketNumber}
              </h1>
              <StatusBadge status={repair.status} />
              <PriorityBadge priority={repair.priority} />
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700">
                {repair.deviceBrand} {repair.deviceModel}
              </span>
              <span>•</span>
              <span>Customer: <strong>{repair.customerName}</strong> ({repair.customerPhone})</span>
              <span>•</span>
              <span className="font-mono text-slate-500">SN: {repair.imeiOrSerial}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJobCardModal(true)}
            className="gap-1.5 text-xs text-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Job Card</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssignModal(true)}
            className="gap-1.5 text-xs text-slate-700"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{repair.assignedTechnicianName ? 'Reassign' : 'Assign Tech'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowStatusModal(true)}
            className="gap-1.5 text-xs font-bold"
          >
            <span>Change Status</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Visual Lifecycle Stepper */}
      <Card className="p-4 bg-white shadow-xs">
        <RepairStatusFlow currentStatus={repair.status} />
      </Card>

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* Problem & Device Specs */}
            <Card className="p-5">
              <CardTitle className="mb-3">Device Intake Details</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Device
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {repair.deviceBrand} {repair.deviceModel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Color / Finish
                  </span>
                  <span className="font-medium text-slate-700">
                    {repair.deviceColor || 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    IMEI / Serial
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {repair.imeiOrSerial}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Security Passcode
                  </span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {repair.passcodePattern || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Condition
                  </span>
                  <span className="capitalize font-medium text-slate-700">
                    {repair.physicalCondition.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                    Intake Date
                  </span>
                  <span className="font-mono text-slate-700">
                    <DateDisplay value={repair.receivedAt} showTime />
                  </span>
                </div>
              </div>

              {repair.accessoriesReceived && repair.accessoriesReceived.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-semibold">Accessories Left:</span>{' '}
                  <span className="text-slate-800 font-medium">
                    {repair.accessoriesReceived.join(', ')}
                  </span>
                </div>
              )}
            </Card>

            {/* Problem Description */}
            <Card className="p-5">
              <CardTitle className="mb-2">Reported Defect & Symptoms</CardTitle>
              <p className="text-sm text-slate-800 leading-relaxed bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 font-medium">
                {repair.problemDescription}
              </p>
            </Card>

            {/* Timeline Audit Log */}
            <Card className="p-5">
              <CardTitle className="mb-4">Lifecycle Audit Trail</CardTitle>
              <RepairTimeline events={repair.timeline} />
            </Card>
          </div>

          {/* Right Column: Customer & Assigned Tech info */}
          <div className="space-y-6">
            {/* Customer Card */}
            <Card className="p-5">
              <CardTitle className="mb-3">Customer Information</CardTitle>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Full Name
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{repair.customerName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Phone Number
                  </span>
                  <div className="font-mono font-semibold text-slate-800">{repair.customerPhone}</div>
                </div>
                {repair.customerEmail && (
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Email
                    </span>
                    <div className="text-slate-700">{repair.customerEmail}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Technician Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <CardTitle>Assigned Engineer</CardTitle>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Change
                </button>
              </div>

              {repair.assignedTechnicianName ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                    {repair.assignedTechnicianName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {repair.assignedTechnicianName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Bench Certified</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center">
                  <p className="text-xs text-slate-500 mb-2">No engineer assigned yet.</p>
                  <Button size="sm" variant="outline" onClick={() => setShowAssignModal(true)}>
                    Assign Now
                  </Button>
                </div>
              )}
            </Card>

            {/* Target Delivery SLA */}
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block mb-1">
                Estimated Delivery SLA
              </span>
              <div className="text-base font-black text-slate-900 font-mono">
                <DateDisplay value={repair.expectedCompletionDate} />
              </div>
              <div className="text-xs text-blue-700 mt-1 font-medium">
                {repair.completedAt ? (
                  <span className="text-emerald-700 font-bold">
                    ✓ Handed Over: <DateDisplay value={repair.completedAt} showTime />
                  </span>
                ) : (
                  'Priority turn-around guaranteed'
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSIS */}
      {activeTab === 'diagnosis' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Technical Inspection & Diagnostics</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-point board inspection, thermal camera results, and component fault analysis
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowDiagModal(true)}
              className="gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{repair.diagnosis ? 'Edit Report' : 'Record Diagnosis'}</span>
            </Button>
          </div>

          {repair.diagnosis ? (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Diagnosing Engineer
                  </span>
                  <strong className="text-slate-900 text-sm font-bold">
                    {repair.diagnosis.technicianName}
                  </strong>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    <DateDisplay value={repair.diagnosis.createdAt} showTime />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Liquid Penetration
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-bold">
                    <Droplets
                      className={`w-4 h-4 ${
                        repair.diagnosis.liquidDamage ? 'text-rose-500' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={
                        repair.diagnosis.liquidDamage ? 'text-rose-600 font-bold' : 'text-emerald-700'
                      }
                    >
                      {repair.diagnosis.liquidDamage ? 'Moisture / Liquid Detected' : 'No Liquid Detected'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                    Battery Health Status
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 font-bold">
                    <Battery className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-sm text-slate-800">
                      {repair.diagnosis.batteryHealthPercent
                        ? `${repair.diagnosis.batteryHealthPercent}% Capacity`
                        : 'Not Measured'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Root Cause & Recommended Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                  <span className="text-rose-800 font-bold uppercase text-[10px] block mb-1">
                    Identified Root Cause
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {repair.diagnosis.rootCause}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="text-blue-800 font-bold uppercase text-[10px] block mb-1">
                    Recommended Technical Action
                  </span>
                  <p className="text-slate-900 font-medium leading-relaxed">
                    {repair.diagnosis.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Bench Notes */}
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">
                  Full Multimeter & Bench Log
                </span>
                <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-mono">
                  {repair.diagnosis.diagnosisNotes}
                </p>
              </div>

              {/* Findings */}
              {repair.diagnosis.findings && repair.diagnosis.findings.length > 0 && (
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[10px] block mb-2">
                    Verified Checklist Observations
                  </span>
                  <div className="space-y-1.5">
                    {repair.diagnosis.findings.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<Stethoscope className="w-8 h-8 text-blue-600" />}
              title="No Technical Diagnosis Logged Yet"
              description="Record bench measurements, root causes, and recommended parts to draft a formal customer quote."
              actionLabel="Start Diagnosis"
              onAction={() => setShowDiagModal(true)}
            />
          )}
        </Card>
      )}

      {/* TAB 3: ESTIMATE */}
      {activeTab === 'estimate' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Customer Quotation & Estimate</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Itemized parts, bench labor rates, discounts, and customer authorization status
              </p>
            </div>
            <div className="flex items-center gap-2">
              {repair.estimate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApproveRejectModal(true)}
                  className="gap-1.5"
                >
                  <span>Record Customer Decision</span>
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowEstimateModal(true)}
                className="gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{repair.estimate ? 'Modify Estimate' : 'Build Estimate'}</span>
              </Button>
            </div>
          </div>

          {repair.estimate ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Estimate #</span>
                  <div className="font-mono font-bold text-slate-900">
                    {repair.estimate.estimateNumber}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Authorization</span>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        repair.estimate.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : repair.estimate.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {repair.estimate.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Valid Until</span>
                  <div className="font-mono text-slate-700">
                    <DateDisplay value={repair.estimate.validUntil} />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 w-24">Type</th>
                      <th className="py-2.5 px-3 text-right w-16">Qty</th>
                      <th className="py-2.5 px-3 text-right w-24">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right w-28">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {repair.estimate.items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{it.description}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600">
                            {it.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <CurrencyDisplay amount={it.unitPrice} />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          <CurrencyDisplay amount={it.totalPrice} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <CurrencyDisplay amount={repair.estimate.subtotal} />
                  </div>
                  {repair.estimate.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount:</span>
                      <span>- <CurrencyDisplay amount={repair.estimate.discount} /></span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-200 text-base font-black text-slate-900">
                    <span>Grand Total:</span>
                    <CurrencyDisplay amount={repair.estimate.total} className="text-blue-700" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Calculator className="w-8 h-8 text-blue-600" />}
              title="No Estimate Created Yet"
              description="Add parts from inventory, labor charges, and discounts to generate a formal customer quote."
              actionLabel="Build First Estimate"
              onAction={() => setShowEstimateModal(true)}
            />
          )}
        </Card>
      )}

      {/* TAB 4: PARTS USED */}
      {activeTab === 'parts' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Parts Installed & Consumed</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Components allocated from inventory with inventory stock auto-deduction
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPartUsageModal(true)}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Allocate Part from Stock</span>
            </Button>
          </div>

          {repair.partsUsed.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Part Name</th>
                    <th className="py-2.5 px-3 w-32">SKU</th>
                    <th className="py-2.5 px-3 text-right w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right w-24">Selling Price</th>
                    <th className="py-2.5 px-3 text-right w-36">Allocated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repair.partsUsed.map((pu) => (
                    <tr key={pu.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{pu.partName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{pu.partSku}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{pu.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        <CurrencyDisplay amount={pu.unitCost} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        <CurrencyDisplay amount={pu.unitPrice} />
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                        {pu.usedByTechnicianName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-blue-600" />}
              title="No Parts Consumed Yet"
              description="When replacing screens, batteries, flex cables, or ICs, allocate them from inventory here to update stock levels automatically."
              actionLabel="Allocate First Part"
              onAction={() => setShowPartUsageModal(true)}
            />
          )}
        </Card>
      )}

      {/* TAB 5: QUALITY CHECK (QC) */}
      {activeTab === 'qc' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Bench Quality Control Sign-off</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard 7-point sensor, audio, wireless, and waterproof seal certification
              </p>
            </div>
            <Button
              variant={repair.qcInspection?.passed ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setShowQCModal(true)}
              className="gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{repair.qcInspection ? 'Re-inspect QC' : 'Start QC Inspection'}</span>
            </Button>
          </div>

          {repair.qcInspection ? (
            <div className="space-y-4 text-xs">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  repair.qcInspection.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      repair.qcInspection.passed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase tracking-wide">
                      {repair.qcInspection.passed
                        ? 'QC CERTIFICATE GRANTED — 100% OPERATIONAL'
                        : 'QC DEFECT IDENTIFIED — REWORK REQUIRED'}
                    </h4>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      Inspected by <strong>{repair.qcInspection.inspectorName}</strong> on{' '}
                      <DateDisplay value={repair.qcInspection.inspectedAt} showTime />
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist items */}
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {repair.qcInspection.checklist.map((c) => (
                  <div key={c.key} className="p-3 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{c.label}</span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded uppercase ${
                        c.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'FAIL'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>

              {repair.qcInspection.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                  <span className="font-bold uppercase text-[10px] text-slate-500 block mb-0.5">
                    Inspector Notes:
                  </span>
                  {repair.qcInspection.notes}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<ShieldCheck className="w-8 h-8 text-indigo-600" />}
              title="Device Not Yet Tested on QC Bench"
              description="Complete the 7-point hardware inspection to certify functionality before customer pickup."
              actionLabel="Perform QC Inspection"
              onAction={() => setShowQCModal(true)}
            />
          )}
        </Card>
      )}

      {/* TAB 6: INVOICE & PAYMENTS */}
      {activeTab === 'invoice' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Invoicing & Payments</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Official billing statement, bKash/Card/Cash collections, and printable receipt
              </p>
            </div>
            {invoice ? (
              <div className="flex items-center gap-2">
                {invoice.balanceDue > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                    className="gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Record Payment</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInvoiceModal(true)}
                  className="gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View / Print Invoice</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateInvoice}
                className="gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Generate Invoice</span>
              </Button>
            )}
          </div>

          {invoice ? (
            <div className="space-y-4 text-xs">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Invoice #
                  </span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {invoice.invoiceNumber}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Grand Total
                  </span>
                  <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                    <CurrencyDisplay amount={invoice.total} />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold uppercase text-[10px] block">
                    Total Paid
                  </span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                    <CurrencyDisplay amount={invoice.amountPaid} />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">
                    Balance Due
                  </span>
                  <div
                    className={`font-mono font-black text-sm mt-0.5 ${
                      invoice.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {invoice.balanceDue > 0 ? (
                      <CurrencyDisplay amount={invoice.balanceDue} />
                    ) : (
                      'CLEARED ✓'
                    )}
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <span className="text-slate-500 font-bold uppercase text-[10px] block mb-2">
                  Transaction Ledger ({invoice.payments.length} Payments)
                </span>
                {invoice.payments.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {invoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 flex items-center justify-between bg-white hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-slate-900">{p.paymentNumber}</span>
                            <span className="text-slate-500 ml-2">
                              via <strong>{p.method}</strong>{' '}
                              {p.reference && `[Trx: ${p.reference}]`}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <CurrencyDisplay amount={p.amount} className="font-bold text-slate-900" />
                          <div className="text-[10px] text-slate-400">
                            <DateDisplay value={p.createdAt} showTime />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 py-3 italic">
                    No payments registered yet. Record deposit or full payment above.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Receipt className="w-8 h-8 text-blue-600" />}
              title="No Invoice Generated Yet"
              description="Create an invoice from the approved estimate to process customer payments and generate tax receipts."
              actionLabel="Generate Invoice"
              onAction={handleGenerateInvoice}
            />
          )}
        </Card>
      )}

      {/* TAB 7: WARRANTY */}
      {activeTab === 'warranty' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <CardTitle>Post-Repair Warranty Certificate</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Official guarantee certificate verifiable via public portal fixflow.live/warranty/check
              </p>
            </div>
            {warranty ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWarrantyModal(true)}
                className="gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View / Print Certificate</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleIssueWarranty}
                className="gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Issue Warranty</span>
              </Button>
            )}
          </div>

          {warranty ? (
            <div className="p-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Warranty Certificate Code
                  </span>
                  <div className="text-lg font-black font-mono text-blue-700">
                    {warranty.warrantyCode}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 text-xs">
                  {warranty.status} (Valid)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-100">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Coverage</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{warranty.coverageDetails}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Valid Period</span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    <DateDisplay value={warranty.startDate} /> — <DateDisplay value={warranty.endDate} />
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px]">Duration</span>
                  <p className="font-bold text-emerald-700 mt-0.5">
                    {warranty.durationMonths} Months Guarantee
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Award className="w-8 h-8 text-blue-600" />}
              title="No Warranty Issued Yet"
              description="Issue a formal warranty certificate with unique code for the customer after repair completion."
              actionLabel="Issue Warranty Certificate"
              onAction={handleIssueWarranty}
            />
          )}
        </Card>
      )}

      {/* Modals & Dialogs */}
      {showStatusModal && (
        <ChangeStatusDialog
          repair={repair}
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showAssignModal && (
        <AssignTechnicianDialog
          repair={repair}
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showJobCardModal && (
        <JobCardModal
          repair={repair}
          isOpen={showJobCardModal}
          onClose={() => setShowJobCardModal(false)}
        />
      )}

      {showDiagModal && (
        <DiagnosisFormModal
          repair={repair}
          isOpen={showDiagModal}
          onClose={() => setShowDiagModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showEstimateModal && (
        <EstimatePreviewModal
          repair={repair}
          isOpen={showEstimateModal}
          onClose={() => setShowEstimateModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showApproveRejectModal && (
        <ApproveRejectDialog
          repair={repair}
          isOpen={showApproveRejectModal}
          onClose={() => setShowApproveRejectModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showPartUsageModal && (
        <PartUsageModal
          repair={repair}
          isOpen={showPartUsageModal}
          onClose={() => setShowPartUsageModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showQCModal && (
        <QCChecklistModal
          repair={repair}
          isOpen={showQCModal}
          onClose={() => setShowQCModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showInvoiceModal && invoice && (
        <InvoicePreviewModal
          invoice={invoice}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onAddPayment={() => {
            setShowInvoiceModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      {showPaymentModal && invoice && (
        <PaymentFormModal
          invoice={invoice}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={refreshRepair}
        />
      )}

      {showWarrantyModal && warranty && (
        <WarrantyCertificateModal
          warranty={warranty}
          isOpen={showWarrantyModal}
          onClose={() => setShowWarrantyModal(false)}
        />
      )}
    </div>
  );
};
