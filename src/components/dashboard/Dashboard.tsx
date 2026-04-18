import { Package, TrendingUp, ShoppingCart, AlertTriangle, DollarSign, Plus } from 'lucide-react';
import { WorkshopStats, Product, Sale } from '../../types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { useCurrency } from '../../contexts/CurrencyContext';
import { StatsCard } from './StatsCard';
import { SalesBarChart } from './SalesBarChart';
import { CURRENCIES } from '../../types';

interface DashboardProps {
  stats: WorkshopStats;
  recentSales: Sale[];
  onNavigate: (view: 'inventory' | 'sales') => void;
}

function LowStockRow({ product }: { product: Product }) {
  const pct = Math.round((product.quantity / Math.max(product.low_stock_threshold * 2, 1)) * 100);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
      <div className={`w-2 h-8 rounded-full flex-shrink-0 ${product.quantity === 0 ? 'bg-rose-500' : 'bg-amber-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${product.quantity === 0 ? 'bg-rose-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-semibold ${product.quantity === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {product.quantity === 0 ? 'OUT' : product.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ stats, recentSales, onNavigate }: DashboardProps) {
  const { currency } = useCurrency();
  const currSymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₨';
  const fmt = (n: number) => formatCurrency(n, currency);

  const profitPct = stats.revenueMonth > 0
    ? ((stats.profitMonth / stats.revenueMonth) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => onNavigate('sales')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 active:scale-95">
          <Plus size={16} />
          New Sale
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Products" value={String(stats.totalProducts)} icon={Package} color="sky"
          subValue={`${stats.lowStockProducts.length} low stock`} />
        <StatsCard label="Today's Revenue" value={fmt(stats.revenueToday)} icon={ShoppingCart} color="orange"
          subValue={`${stats.salesToday} sales`} />
        <StatsCard label="Monthly Revenue" value={fmt(stats.revenueMonth)} icon={TrendingUp} color="emerald"
          subValue={`${profitPct}% margin`} />
        <StatsCard label="Stock Value" value={fmt(stats.totalStockValue)} icon={DollarSign} color="amber"
          subValue={`Cost: ${fmt(stats.totalInvestment)}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesBarChart data={stats.monthlySales} title="Monthly Revenue & Profit (12 months)" currencySymbol={currSymbol} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Low Stock Alerts</h3>
            {stats.lowStockProducts.length > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                <AlertTriangle size={11} />
                {stats.lowStockProducts.length}
              </span>
            )}
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-2">
                <Package size={20} className="text-emerald-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">All stock levels healthy</p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto pr-1">
              {stats.lowStockProducts.slice(0, 8).map(p => <LowStockRow key={p.id} product={p} />)}
            </div>
          )}
          {stats.lowStockProducts.length > 0 && (
            <button onClick={() => onNavigate('inventory')}
              className="mt-3 w-full text-center text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
              View all in Inventory →
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Sales</h3>
          <button onClick={() => onNavigate('sales')} className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline">
            View all →
          </button>
        </div>
        {recentSales.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">No sales yet — record your first sale!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/30">
                  <th className="px-5 py-2.5">Date & Time</th>
                  <th className="px-5 py-2.5">Items</th>
                  <th className="px-5 py-2.5 text-right">Revenue</th>
                  <th className="px-5 py-2.5 text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.slice(0, 8).map(sale => (
                  <tr key={sale.id} className="border-t border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{formatDateTime(sale.created_at)}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-300">{(sale.sale_items ?? []).length} item(s)</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">{fmt(sale.total_amount)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right">{fmt(sale.total_profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {stats.topProducts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const pct = Math.round((p.revenue / (stats.topProducts[0]?.revenue || 1)) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{p.name}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2 flex-shrink-0">{fmt(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">{p.quantity} sold</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
