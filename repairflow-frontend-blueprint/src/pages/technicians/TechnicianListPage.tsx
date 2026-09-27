import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Technician } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/stores/uiStore';
import { Cpu, Plus, Star, Phone, Mail, Wrench } from 'lucide-react';

export const TechnicianListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [technicians, setTechnicians] = useState<Technician[]>(storageService.getTechnicians());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Apple & Micro-soldering');

  const refreshData = () => {
    setTechnicians([...storageService.getTechnicians()]);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone required');
      return;
    }

    const newTech: Technician = {
      id: `tech-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@fixflow.com`,
      phone: phone.trim(),
      specialization: specialization.trim(),
      status: 'AVAILABLE',
      activeRepairsCount: 0,
      completedRepairsCount: 0,
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    storageService.saveTechnician(newTech);
    toast.success('Technician Added', `${newTech.name} joined engineering team`);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bench Technicians"
        description="Engineering staff roster, bench specializations, active workloads, and ratings"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Technicians' },
        ]}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicians.map((t) => (
          <Card key={t.id} className="p-6 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={t.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{t.rating} Rating</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    t.status === 'AVAILABLE'
                      ? 'success'
                      : t.status === 'BUSY'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {t.status}
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block">
                    Specialization
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{t.specialization}</p>
                </div>

                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{t.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{t.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Jobs</span>
                <strong className="text-slate-900 font-mono text-sm">{t.activeRepairsCount}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Completed
                </span>
                <strong className="text-emerald-700 font-mono text-sm">
                  {t.completedRepairsCount}
                </strong>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Bench Engineer"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Technician Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mahabub Al-Amin"
            required
          />
          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+880 1..."
            required
          />
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="engineer@fixflow.com"
          />
          <Input
            label="Bench Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. GPU Reballing, OLED Glass Laser"
            required
          />
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Engineer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
