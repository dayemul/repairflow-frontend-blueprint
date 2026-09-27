import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Customer } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DateDisplay } from '@/components/shared/DateDisplay';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/stores/uiStore';
import { generateCode } from '@/lib/utils';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-react';

export interface CustomerListPageProps {
  onNavigate: (path: string) => void;
}

export const CustomerListPage: React.FC<CustomerListPageProps> = ({ onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const refreshData = () => {
    setCustomers([...storageService.getCustomers()]);
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone required');
      return;
    }

    const newCust: Customer = {
      id: `cus-${Date.now()}`,
      code: generateCode('CUS', 6),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: address.trim() || 'Dhaka, Bangladesh',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      totalRepairs: 0,
      totalSpent: 0,
    };

    storageService.saveCustomer(newCust);
    toast.success('Customer Registered', `${newCust.name} added`);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="Client database with intake history, contact profiles, and repair records"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Customers' },
        ]}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Button>
        }
      />

      <Card className="p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by customer name, phone (+880...), customer code, or email..."
        />
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="No Customers Found"
          description="Try a different search or register a new customer profile."
          actionLabel="Register Customer"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              onClick={() => onNavigate(`/customers/${c.id}`)}
              className="p-5 hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {c.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{c.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Repairs
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {c.totalRepairs || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Total Spent:</span>
                <CurrencyDisplay amount={c.totalSpent || 0} className="font-bold text-slate-900" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Customer"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Arif Hossain"
            required
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+880 1711..."
            required
          />
          <Input
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="arif@example.com"
          />
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Sector 3, Uttara, Dhaka"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Customer Preferences / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers WhatsApp notifications..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
