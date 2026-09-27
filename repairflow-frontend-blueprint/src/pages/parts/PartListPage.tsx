import React, { useState } from 'react';
import { storageService } from '@/lib/storage';
import { Part } from '@/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { toast } from '@/stores/uiStore';
import { HardDrive, Plus, AlertTriangle, ArrowUpDown } from 'lucide-react';

export const PartListPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [parts, setParts] = useState<Part[]>(storageService.getParts());
  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Stock adjustment modal
  const [adjustPart, setAdjustPart] = useState<Part | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('ADD');

  // New Part form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Displays');
  const [costPrice, setCostPrice] = useState<number>(5000);
  const [sellingPrice, setSellingPrice] = useState<number>(7500);
  const [initialStock, setInitialStock] = useState<number>(5);
  const [minThreshold, setMinThreshold] = useState<number>(2);
  const [location, setLocation] = useState('Shelf A-01');

  const refreshData = () => {
    setParts([...storageService.getParts()]);
  };

  const filtered = parts.filter((p) => {
    if (onlyLowStock && p.quantityInStock > p.minThreshold) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPart) return;

    const delta = adjustType === 'ADD' ? adjustQty : -adjustQty;
    storageService.adjustPartStock(adjustPart.id, delta);
    toast.success('Inventory Adjusted', `${adjustPart.name} updated by ${delta > 0 ? `+${delta}` : delta}`);
    setAdjustPart(null);
    refreshData();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      toast.error('Part name and SKU required');
      return;
    }

    const newPart: Part = {
      id: `part-${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      compatibleModels: ['All Standard'],
      costPrice,
      sellingPrice,
      quantityInStock: initialStock,
      minThreshold,
      location: location.trim(),
    };

    storageService.savePart(newPart);
    toast.success('Part Registered', `${newPart.name} added to inventory`);
    setShowAddModal(false);
    setName('');
    setSku('');
    refreshData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parts & Spares Inventory"
        description="Warehouse stock, bin locations, cost vs retail prices, and threshold replenishment alerts"
        breadcrumbs={[
          { label: 'Dashboard', onClick: () => onNavigate('/') },
          { label: 'Parts Inventory' },
        ]}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </Button>
        }
      />

      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search part name, SKU code (e.g. OLED, BAT, BG)..."
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-auto bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            checked={onlyLowStock}
            onChange={(e) => setOnlyLowStock(e.target.checked)}
            className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
          />
          <span className="flex items-center gap-1 text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Show Low Stock Only
          </span>
        </label>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Part Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const isCritical = p.quantityInStock === 0;
                const isLow = p.quantityInStock <= p.minThreshold;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 max-w-sm">{p.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.category}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.location || 'Bin B-1'}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded-full text-xs ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isLow
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.quantityInStock} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      <CurrencyDisplay amount={p.costPrice} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={p.sellingPrice} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAdjustPart(p);
                          setAdjustQty(1);
                        }}
                        className="text-xs gap-1"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Adjust</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Stock Modal */}
      {adjustPart && (
        <Modal
          isOpen={!!adjustPart}
          onClose={() => setAdjustPart(null)}
          title="Adjust Part Inventory Level"
          description={`${adjustPart.name} (Current: ${adjustPart.quantityInStock} in stock)`}
          maxWidth="sm"
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  adjustType === 'ADD'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                + Restock / Received
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('REMOVE')}
                className={`p-2.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  adjustType === 'REMOVE'
                    ? 'border-rose-600 bg-rose-50 text-rose-900'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                - Scrap / Audit Deduct
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                className="w-full text-base font-bold font-mono rounded-lg border border-slate-300 p-2.5"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => setAdjustPart(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Apply Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Part Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Inventory Part"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <Input
            label="SKU Code"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. APL-IP15P-BAT"
            required
          />
          <Input
            label="Part Full Description"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. iPhone 15 Pro Original Battery Cell"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
              >
                <option value="Displays">Displays & Touchscreens</option>
                <option value="Batteries">Batteries</option>
                <option value="Housing">Housing & Back Glass</option>
                <option value="Charging Ports">Charging Ports & Flex</option>
                <option value="Keyboards">Keyboards & Trackpads</option>
                <option value="Consumables">Thermal Paste & Flux</option>
              </select>
            </div>
            <Input
              label="Bin / Shelf Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Shelf C-04"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cost Price (৳)"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
            />
            <Input
              label="Retail Price (৳)"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starting Quantity"
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(Number(e.target.value))}
            />
            <Input
              label="Low Alert Threshold"
              type="number"
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Part
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
