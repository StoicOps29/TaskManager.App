import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Product, PRODUCT_CATEGORIES, ProductCategory } from '../../types';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData: Product | null;
}

const EMPTY: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  name: '', category: 'Engine Parts', purchase_price: 0, selling_price: 0,
  quantity: 0, low_stock_threshold: 5, supplier: '', sku: '', description: '',
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT_CLS = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all";

export function ProductForm({ isOpen, onClose, onSubmit, initialData }: ProductFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? {
        name: initialData.name, category: initialData.category,
        purchase_price: initialData.purchase_price, selling_price: initialData.selling_price,
        quantity: initialData.quantity, low_stock_threshold: initialData.low_stock_threshold,
        supplier: initialData.supplier, sku: initialData.sku, description: initialData.description,
      } : EMPTY);
      setError('');
    }
  }, [isOpen, initialData]);

  const set = (k: keyof typeof EMPTY, v: string | number | ProductCategory) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const margin = form.selling_price > 0
    ? (((form.selling_price - form.purchase_price) / form.selling_price) * 100).toFixed(1)
    : '0';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (form.selling_price < form.purchase_price) {
      setError('Selling price should be greater than purchase price');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Product' : 'Add New Product'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Product Name *">
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
                placeholder="e.g., Engine Oil 4T 1L" className={INPUT_CLS} />
            </Field>
          </div>

          <Field label="Category">
            <select value={form.category} onChange={e => set('category', e.target.value as ProductCategory)} className={INPUT_CLS}>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="SKU / Part Number">
            <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)}
              placeholder="Optional" className={INPUT_CLS} />
          </Field>

          <Field label="Purchase Price *">
            <input type="number" value={form.purchase_price} onChange={e => set('purchase_price', parseFloat(e.target.value) || 0)}
              min="0" step="0.01" required className={INPUT_CLS} />
          </Field>

          <Field label="Selling Price *" hint={`Profit margin: ${margin}%`}>
            <input type="number" value={form.selling_price} onChange={e => set('selling_price', parseFloat(e.target.value) || 0)}
              min="0" step="0.01" required className={INPUT_CLS} />
          </Field>

          <Field label="Quantity in Stock">
            <input type="number" value={form.quantity} onChange={e => set('quantity', parseInt(e.target.value) || 0)}
              min="0" required className={INPUT_CLS} />
          </Field>

          <Field label="Low Stock Alert Threshold" hint="Alert when quantity falls below this">
            <input type="number" value={form.low_stock_threshold} onChange={e => set('low_stock_threshold', parseInt(e.target.value) || 1)}
              min="1" required className={INPUT_CLS} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Supplier">
              <input type="text" value={form.supplier} onChange={e => set('supplier', e.target.value)}
                placeholder="Optional supplier name" className={INPUT_CLS} />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={2} placeholder="Optional product description" className={`${INPUT_CLS} resize-none`} />
            </Field>
          </div>
        </div>

        {form.selling_price > 0 && form.purchase_price > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Profit per unit: {(form.selling_price - form.purchase_price).toFixed(2)} &bull; Margin: {margin}%
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60">
            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
