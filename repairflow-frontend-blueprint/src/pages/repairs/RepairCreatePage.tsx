import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Repair, Customer, Product, Priority } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/stores/authStore';
import { toast } from '@/stores/uiStore';
import { generateCode } from '@/lib/utils';
import {
  Wrench,
  UserPlus,
  Smartphone,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export interface RepairCreatePageProps {
  onNavigate: (path: string) => void;
}

export const RepairCreatePage: React.FC<RepairCreatePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const customers = storageService.getCustomers();
  const products = storageService.getProducts();
  const technicians = storageService.getTechnicians();

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [deviceColor, setDeviceColor] = useState('');
  const [passcodePattern, setPasscodePattern] = useState('');
  const [physicalCondition, setPhysicalCondition] = useState<Repair['physicalCondition']>('LIKE_NEW');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('');
  const [accessoriesReceived, setAccessoriesReceived] = useState<string[]>(['Device only']);

  // Date default 2 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 2);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(
    defaultDate.toISOString().split('T')[0]
  );

  // New inline customer creation modal/state
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const [loading, setLoading] = useState(false);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      toast.error('Customer name and phone required');
      return;
    }
    const newCust: Customer = {
      id: `cus-${Date.now()}`,
      code: generateCode('CUS', 6),
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || `${newCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: newCustAddress.trim() || 'Dhaka, Bangladesh',
      createdAt: new Date().toISOString(),
      totalRepairs: 0,
      totalSpent: 0,
    };
    storageService.saveCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    setShowNewCustomer(false);
    toast.success('Customer Registered', `${newCust.name} added`);
  };

  const toggleAccessory = (acc: string) => {
    if (accessoriesReceived.includes(acc)) {
      setAccessoriesReceived(accessoriesReceived.filter((a) => a !== acc));
    } else {
      setAccessoriesReceived([...accessoriesReceived, acc]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    const product = products.find((p) => p.id === selectedProductId);

    if (!customer) {
      toast.error('Select a valid customer');
      return;
    }
    if (!product) {
      toast.error('Select a valid device');
      return;
    }
    if (!imeiOrSerial.trim()) {
      toast.error('IMEI or Serial Number required');
      return;
    }
    if (!problemDescription.trim()) {
      toast.error('Problem description required');
      return;
    }

    setLoading(true);
    try {
      const ticketNumber = generateCode('REP', 6);
      const tech = technicians.find((t) => t.id === assignedTechnicianId);

      const newRepair: Repair = {
        id: `rep-${Date.now()}`,
        ticketNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        productId: product.id,
        deviceBrand: product.brand,
        deviceModel: product.model,
        deviceColor: deviceColor.trim() || undefined,
        imeiOrSerial: imeiOrSerial.trim(),
        passcodePattern: passcodePattern.trim() || undefined,
        physicalCondition,
        accessoriesReceived,
        problemDescription: problemDescription.trim(),
        status: 'RECEIVED',
        priority,
        assignedTechnicianId: tech?.id,
        assignedTechnicianName: tech?.name,
        expectedCompletionDate: new Date(expectedCompletionDate).toISOString(),
        receivedAt: new Date().toISOString(),
        timeline: [
          {
            id: `tl-${Date.now()}`,
            status: 'RECEIVED',
            title: 'Repair Ticket Created',
            description: `Checked in by ${user?.name || 'Staff'}. Device booked into queue.`,
            timestamp: new Date().toISOString(),
            userName: user?.name || 'Staff',
            userRole: user?.role || 'CASHIER',
          },
        ],
        partsUsed: [],
      };

      storageService.saveRepair(newRepair);
      toast.success(
        'Repair Ticket Created!',
        `Ticket ${ticketNumber} generated for ${customer.name}`
      );
      onNavigate(`/repairs/${newRepair.id}`);
    } catch {
      toast.error('Failed to create repair ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Check-in New Device"
        description="Create intake job ticket, register customer details, record defect symptoms and passcodes"
        breadcrumbs={[
          { label: 'Repairs', onClick: () => onNavigate('/repairs') },
          { label: 'New Intake Ticket' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                1
              </span>
              Customer Details
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewCustomer(true)}
              className="gap-1.5 text-xs text-blue-600"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add New Customer</span>
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Customer <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.phone} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Device Information */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Device Specifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Device Brand & Model <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand} {p.model} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="IMEI / Serial Number"
                value={imeiOrSerial}
                onChange={(e) => setImeiOrSerial(e.target.value)}
                placeholder="e.g. 358291048291024 or C02G90..."
                required
              />
            </div>

            <div>
              <Input
                label="Device Color / Finish"
                value={deviceColor}
                onChange={(e) => setDeviceColor(e.target.value)}
                placeholder="e.g. Space Black, Titanium Gray"
              />
            </div>

            <div>
              <Input
                label="Screen Passcode / Pattern (for diagnostic testing)"
                value={passcodePattern}
                onChange={(e) => setPasscodePattern(e.target.value)}
                placeholder="e.g. 1423 or Pattern L-shape"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Physical Intake Condition
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'LIKE_NEW', label: 'Like New / Flawless' },
                  { id: 'LIGHT_SCRATCHES', label: 'Light Scratches' },
                  { id: 'HEAVILY_SCRATCHED', label: 'Heavily Scratched' },
                  { id: 'DENTED', label: 'Dented Corners' },
                  { id: 'CRACKED_BACK', label: 'Cracked Glass / Back' },
                  { id: 'OTHER', label: 'Prior Disassembled' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setPhysicalCondition(c.id as any)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                      physicalCondition === c.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Accessories Left with Workshop
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Device only',
                  'Original Box',
                  'Power Adapter',
                  'Charging Cable',
                  'Protective Case',
                  'SIM Card & Tray',
                  'Apple Pencil / S-Pen',
                ].map((acc) => {
                  const isChecked = accessoriesReceived.includes(acc);
                  return (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => toggleAccessory(acc)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked && '✓ '}
                      {acc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Problem and Dispatch Section */}
        <Card className="p-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              3
            </span>
            Complaint & Service Dispatch
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Problem Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="Describe symptoms, how the issue occurred, error messages, liquid spill history..."
                required
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Job Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-bold"
                >
                  <option value="LOW">Low (Standard SLA)</option>
                  <option value="MEDIUM">Medium (Normal)</option>
                  <option value="HIGH">High (Urgent)</option>
                  <option value="CRITICAL">Critical (Same-day VIP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Technician (Optional)
                </label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white font-medium"
                >
                  <option value="">Leave Unassigned (Bench Queue)</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.activeRepairsCount} active jobs)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={() => onNavigate('/repairs')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} className="gap-2 px-6">
            <Check className="w-4 h-4" />
            <span>Generate Ticket & Print Intake Card</span>
          </Button>
        </div>
      </form>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Register New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <Input
                label="Full Name"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Mahfuz Rahman"
                required
              />
              <Input
                label="Phone Number"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="+880 1..."
                required
              />
              <Input
                label="Email Address"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                placeholder="m.rahman@example.com"
              />
              <Input
                label="Address / Area"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="e.g. Dhanmondi, Dhaka"
              />
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button variant="outline" type="button" onClick={() => setShowNewCustomer(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
