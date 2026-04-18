import { useState, useMemo } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, AlertTriangle, Package, Filter } from 'lucide-react';
import { Product, PRODUCT_CATEGORIES, ProductCategory, CATEGORY_COLORS } from '../../types';
import { formatCurrency, getStockStatus } from '../../lib/utils';
import { useCurrency } from '../../contexts/CurrencyContext';
import { ProductForm } from './ProductForm';

interface InventoryPageProps {
  products: Product[];
  onCreate: (d: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, d: Partial<Product>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function InventoryPage({ products, onCreate, onUpdate, onDelete }: InventoryPageProps) {
  const { currency } = useCurrency();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fmt = (n: number) => formatCurrency(n, currency);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const status = getStockStatus(p.quantity, p.low_stock_threshold);
      const matchStock = stockFilter === 'all' || status === stockFilter;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalValue = filtered.reduce((s, p) => s + p.selling_price * p.quantity, 0);
  const totalCost  = filtered.reduce((s, p) => s + p.purchase_price * p.quantity, 0);

  const handleEdit = (p: Product) => { setEditProduct(p); setIsFormOpen(true); };

  const handleSubmit = async (data: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editProduct) await onUpdate(editProduct.id, data);
    else await onCreate(data);
    setEditProduct(null);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} products &bull; Value: {fmt(totalValue)}</p>
        </div>
        <button onClick={() => { setEditProduct(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 active:scale-95">
          <Plus size={16} />
          <span className="hidden sm:block">Add Product</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, supplier..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as ProductCategory | 'All')}
            className="appearance-none pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer">
            <option value="All">All Categories</option>
            {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <select value={stockFilter} onChange={e => setStockFilter(e.target.value as typeof stockFilter)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer">
          <option value="all">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Stock Value', value: fmt(totalValue), sub: 'selling price', cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Cost Value', value: fmt(totalCost), sub: 'purchase price', cls: 'text-sky-600 dark:text-sky-400' },
          { label: 'Potential Profit', value: fmt(totalValue - totalCost), sub: 'gross margin', cls: 'text-orange-600 dark:text-orange-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
            <p className={`text-base font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No products found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {search ? 'Try different search terms' : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/30">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Purchase</th>
                  <th className="px-4 py-3 text-right">Selling</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const status = getStockStatus(p.quantity, p.low_stock_threshold);
                  const cat = CATEGORY_COLORS[p.category];
                  return (
                    <tr key={p.id} className="border-t border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                          {p.sku && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{p.sku}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${cat.bg} ${cat.text}`}>{p.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-right">{fmt(p.purchase_price)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">{fmt(p.selling_price)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {status !== 'ok' && <AlertTriangle size={12} className={status === 'out' ? 'text-rose-500' : 'text-amber-500'} />}
                          <span className={`text-sm font-semibold ${
                            status === 'out' ? 'text-rose-600 dark:text-rose-400' :
                            status === 'low' ? 'text-amber-600 dark:text-amber-400' :
                            'text-gray-700 dark:text-gray-300'
                          }`}>{p.quantity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{p.supplier || '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">{fmt(p.selling_price * p.quantity)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === p.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(p.id)} className="px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors">Del</button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ProductForm isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditProduct(null); }}
        onSubmit={handleSubmit} initialData={editProduct} />
    </div>
  );
}
