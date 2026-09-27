import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Product } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/stores/uiStore';
import { HardDrive, Plus } from 'lucide-react';

export const ProductListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<Product['category']>('Smartphone');
  const [releaseYear, setReleaseYear] = useState<number>(2024);

  const refreshData = () => {
    setProducts([...storageService.getProducts()]);
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) {
      toast.error('Brand and Model required');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      brand: brand.trim(),
      model: model.trim(),
      category,
      releaseYear,
      repairCount: 0,
    };

    storageService.saveProduct(newProd);
    toast.success('Product Added', `${newProd.brand} ${newProd.model} added to catalog`);
    setShowAddModal(false);
    setModel('');
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Device Catalog"
        description="Supported mobile phones, laptops, tablets, and gaming consoles for repair intake"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Products' },
        ]}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Device Model</span>
          </Button>
        }
      />

      <Card className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search supported models (e.g. Galaxy S24, MacBook, iPhone)..."
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 p-2 bg-white font-medium"
        >
          <option value="ALL">All Device Categories</option>
          <option value="Smartphone">Smartphones</option>
          <option value="Laptop">Laptops</option>
          <option value="Tablet">Tablets</option>
          <option value="Gaming Console">Gaming Consoles</option>
        </select>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Release Year</th>
                <th className="py-3 px-4 text-right">Repairs Serviced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.brand}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.model}</td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{p.releaseYear || '-'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                    {p.repairCount || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Device to Catalog"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Apple, Samsung, Dell"
            required
          />
          <Input
            label="Model Name"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. iPhone 16 Pro Max"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
            >
              <option value="Smartphone">Smartphone</option>
              <option value="Laptop">Laptop</option>
              <option value="Tablet">Tablet</option>
              <option value="Smartwatch">Smartwatch</option>
              <option value="Gaming Console">Gaming Console</option>
              <option value="Audio/Other">Audio/Other</option>
            </select>
          </div>
          <Input
            label="Release Year"
            type="number"
            value={releaseYear}
            onChange={(e) => setReleaseYear(Number(e.target.value))}
            min="2015"
            max="2030"
          />
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
