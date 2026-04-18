import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, Package, ChevronDown } from 'lucide-react';
import { Product, CartItem, Sale, Currency, CURRENCIES } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useCurrency } from '../../contexts/CurrencyContext';

interface SalesPageProps {
  products: Product[];
  sales: Sale[];
  onCreateSale: (
    cartItems: CartItem[],
    currency: Currency,
    notes: string,
    onDecrement: (productId: string, qty: number) => Promise<void>
  ) => Promise<Sale>;
  onDecrementStock: (productId: string, qty: number) => Promise<void>;
}

export function SalesPage({ products, sales, onCreateSale, onDecrementStock }: SalesPageProps) {
  const { currency: defaultCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(defaultCurrency);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');

  const fmt = (n: number) => formatCurrency(n, selectedCurrency);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p =>
      p.quantity > 0 &&
      (!search || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [products, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(i => i.product.id === product.id ? {
          ...i, quantity: i.quantity + 1,
          total: (i.quantity + 1) * product.selling_price,
          profit: (i.quantity + 1) * (product.selling_price - product.purchase_price),
        } : i);
      }
      return [...prev, {
        product, quantity: 1,
        total: product.selling_price,
        profit: product.selling_price - product.purchase_price,
      }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
      return;
    }
    const max = product.quantity;
    const newQty = Math.min(qty, max);
    setCart(prev => prev.map(i => i.product.id === productId ? {
      ...i, quantity: newQty,
      total: newQty * i.product.selling_price,
      profit: newQty * (i.product.selling_price - i.product.purchase_price),
    } : i));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(i => i.product.id !== productId));

  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const cartProfit = cart.reduce((s, i) => s + i.profit, 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await onCreateSale(cart, selectedCurrency, notes, onDecrementStock);
      setCart([]);
      setNotes('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          {(['pos', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {tab === 'pos' ? 'New Sale' : 'History'}
              {tab === 'history' && sales.length > 0 && (
                <span className="ml-1.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-semibold">{sales.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products by name, category, SKU..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all" />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <Package size={36} className="mx-auto mb-2" />
                <p className="text-sm">{search ? 'No products match your search' : 'No products in stock'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {filteredProducts.map(p => {
                  const inCart = cart.find(i => i.product.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addToCart(p)}
                      className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-md active:scale-95 ${
                        inCart
                          ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-200 dark:hover:border-orange-800'
                      }`}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">{p.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(p.selling_price, selectedCurrency)}</span>
                        <span className={`text-xs font-medium ${p.quantity <= p.low_stock_threshold ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                          {p.quantity} left
                        </span>
                      </div>
                      {inCart && (
                        <div className="mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400">
                          In cart: {inCart.quantity}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm sticky top-20">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
                <ShoppingCart size={18} className="text-orange-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Cart</h3>
                {cart.length > 0 && (
                  <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                    {cart.length} items
                  </span>
                )}
              </div>

              <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                {cart.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">Tap a product to add it</p>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{fmt(item.product.selling_price)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white w-16 text-right">{fmt(item.total)}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 dark:text-gray-600 hover:text-rose-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">{fmt(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Profit</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(cartProfit)}</span>
                </div>

                <div className="relative">
                  <select value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value as Currency)}
                    className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  placeholder="Notes (optional)..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" />

                {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

                {success && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Sale completed successfully!
                  </div>
                )}

                <button onClick={handleCompleteSale} disabled={cart.length === 0 || loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 active:scale-95">
                  {loading ? 'Processing...' : `Complete Sale · ${fmt(cartTotal)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {sales.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <ShoppingCart size={40} className="mx-auto mb-3" />
              <p className="font-medium">No sales recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/30">
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Items</th>
                    <th className="px-5 py-3">Currency</th>
                    <th className="px-5 py-3 text-right">Revenue</th>
                    <th className="px-5 py-3 text-right">Profit</th>
                    <th className="px-5 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id} className="border-t border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDateTime(sale.created_at)}</td>
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {(sale.sale_items ?? []).map(i => `${i.product_name} ×${i.quantity}`).join(', ').slice(0, 50) || `${(sale.sale_items ?? []).length} items`}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-lg">{sale.currency}</span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatCurrency(sale.total_amount, sale.currency)}</td>
                      <td className="px-5 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(sale.total_profit, sale.currency)}</td>
                      <td className="px-5 py-3 text-xs text-gray-400 dark:text-gray-500 max-w-[120px] truncate">{sale.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
