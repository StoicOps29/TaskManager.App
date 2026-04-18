import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, BarChart3, Printer } from 'lucide-react';
import { Sale, Product, WorkshopStats } from '../../types';
import { formatCurrency, formatDate, exportToCSV } from '../../lib/utils';
import { useCurrency } from '../../contexts/CurrencyContext';
import { SalesBarChart } from '../dashboard/SalesBarChart';
import { CURRENCIES } from '../../types';

type Range = '7d' | '30d' | '3m' | '12m';

interface ReportsPageProps {
  sales: Sale[];
  products: Product[];
  stats: WorkshopStats;
}

const RANGES: { value: Range; label: string }[] = [
  { value: '7d',  label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m',  label: 'Last 3 Months' },
  { value: '12m', label: 'Last 12 Months' },
];

function StatBox({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
      <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub && (
        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {sub}
        </p>
      )}
    </div>
  );
}

export function ReportsPage({ sales, products, stats }: ReportsPageProps) {
  const { currency } = useCurrency();
  const [range, setRange] = useState<Range>('30d');
  const currSymbol = CURRENCIES.find(c => c.code === currency)?.symbol ?? '₨';
  const fmt = (n: number) => formatCurrency(n, currency);

  const rangeStart = useMemo(() => {
    const now = new Date();
    switch (range) {
      case '7d':  return new Date(now.getTime() - 7   * 86400000);
      case '30d': return new Date(now.getTime() - 30  * 86400000);
      case '3m':  return new Date(now.getTime() - 90  * 86400000);
      case '12m': return new Date(now.getTime() - 365 * 86400000);
    }
  }, [range]);

  const filteredSales = useMemo(
    () => sales.filter(s => new Date(s.created_at) >= rangeStart),
    [sales, rangeStart]
  );

  const totalRevenue = filteredSales.reduce((s, x) => s + Number(x.total_amount), 0);
  const totalProfit  = filteredSales.reduce((s, x) => s + Number(x.total_profit), 0);
  const totalCost    = totalRevenue - totalProfit;
  const margin       = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

  const chartData = useMemo(() => {
    if (range === '7d' || range === '30d') {
      const days = range === '7d' ? 7 : 30;
      return Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dayEnd   = dayStart + 86400000;
        const slice    = filteredSales.filter(s => {
          const t = new Date(s.created_at).getTime();
          return t >= dayStart && t < dayEnd;
        });
        return {
          label: range === '7d' ? d.toLocaleDateString('en-US', { weekday: 'short' }) : key,
          revenue: slice.reduce((s, x) => s + Number(x.total_amount), 0),
          profit: slice.reduce((s, x) => s + Number(x.total_profit), 0),
        };
      });
    }
    const months = range === '3m' ? 3 : 12;
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i) + 1, 1);
      const slice = filteredSales.filter(s => {
        const t = new Date(s.created_at).getTime();
        return t >= d.getTime() && t < end.getTime();
      });
      return {
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: slice.reduce((s, x) => s + Number(x.total_amount), 0),
        profit: slice.reduce((s, x) => s + Number(x.total_profit), 0),
      };
    });
  }, [range, filteredSales]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
    filteredSales.forEach(s => (s.sale_items ?? []).forEach(item => {
      const k = item.product_id ?? item.product_name;
      if (!map[k]) map[k] = { name: item.product_name, qty: 0, revenue: 0, profit: 0 };
      map[k].qty     += item.quantity;
      map[k].revenue += Number(item.total);
      map[k].profit  += Number(item.profit);
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredSales]);

  const handleExportSales = () => {
    exportToCSV(filteredSales.map(s => ({
      Date: formatDate(s.created_at),
      Time: new Date(s.created_at).toLocaleTimeString(),
      Items: (s.sale_items ?? []).length,
      Revenue: s.total_amount,
      Profit: s.total_profit,
      Currency: s.currency,
      Notes: s.notes,
    })), 'sales_report');
  };

  const handleExportProducts = () => {
    exportToCSV(products.map(p => ({
      Name: p.name, Category: p.category, SKU: p.sku,
      PurchasePrice: p.purchase_price, SellingPrice: p.selling_price,
      Quantity: p.quantity, LowStockThreshold: p.low_stock_threshold,
      Supplier: p.supplier, StockValue: p.selling_price * p.quantity,
    })), 'inventory_report');
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Financial analytics &amp; export</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportSales}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            <Download size={14} />
            Export Sales
          </button>
          <button onClick={handleExportProducts}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            <Download size={14} />
            Export Inventory
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              range === r.value
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Total Sales" value={String(filteredSales.length)} />
        <StatBox label="Total Revenue" value={fmt(totalRevenue)} positive={totalRevenue > 0} sub={totalRevenue > 0 ? 'earned' : undefined} />
        <StatBox label="Total Profit" value={fmt(totalProfit)} positive={totalProfit > 0} sub={`${margin}% margin`} />
        <StatBox label="Total Cost" value={fmt(totalCost)} />
      </div>

      <SalesBarChart data={chartData} title={`Revenue & Profit — ${RANGES.find(r => r.value === range)?.label}`} currencySymbol={currSymbol} />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Top Products</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No sales data for this period</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const pct = topProducts[0]?.revenue > 0 ? (p.revenue / topProducts[0].revenue) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{p.name}</span>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{p.qty} sold</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Inventory Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total Products', value: stats.totalProducts, fmt: String },
              { label: 'Stock Value (Selling)', value: stats.totalStockValue, fmt: (n: number) => fmt(n) },
              { label: 'Stock Value (Cost)', value: stats.totalInvestment, fmt: (n: number) => fmt(n) },
              { label: 'Potential Profit', value: stats.totalStockValue - stats.totalInvestment, fmt: (n: number) => fmt(n) },
              { label: 'Low Stock Items', value: stats.lowStockProducts.length, fmt: String },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
                <span className={`text-sm font-bold ${
                  row.label === 'Low Stock Items' && row.value > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-900 dark:text-white'
                }`}>{(row.fmt as (n: number) => string)(row.value as number)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filteredSales.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Sales Transactions ({filteredSales.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0">
                <tr className="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/30">
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5">Items</th>
                  <th className="px-5 py-2.5 text-right">Revenue</th>
                  <th className="px-5 py-2.5 text-right">Cost</th>
                  <th className="px-5 py-2.5 text-right">Profit</th>
                  <th className="px-5 py-2.5 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => {
                  const cost = Number(sale.total_amount) - Number(sale.total_profit);
                  const m = sale.total_amount > 0 ? ((sale.total_profit / sale.total_amount) * 100).toFixed(1) : '0';
                  return (
                    <tr key={sale.id} className="border-t border-gray-50 dark:border-slate-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300">{formatDate(sale.created_at)}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-500 dark:text-gray-400">{(sale.sale_items ?? []).length}</td>
                      <td className="px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatCurrency(sale.total_amount, sale.currency)}</td>
                      <td className="px-5 py-2.5 text-sm text-gray-500 dark:text-gray-400 text-right">{formatCurrency(cost, sale.currency)}</td>
                      <td className="px-5 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 text-right">{formatCurrency(sale.total_profit, sale.currency)}</td>
                      <td className="px-5 py-2.5 text-sm text-right">
                        <span className={`font-semibold ${Number(m) >= 20 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{m}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
