import { useMemo } from 'react';
import { Product, Sale, WorkshopStats } from '../types';
import { startOfDay, startOfMonth, startOfYear } from '../lib/utils';

export function useStats(products: Product[], sales: Sale[]): WorkshopStats {
  return useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const monthStart = startOfMonth(now).getTime();
    const yearStart = startOfYear(now).getTime();

    const totalProducts = products.length;
    const totalStockValue = products.reduce((s, p) => s + p.selling_price * p.quantity, 0);
    const totalInvestment = products.reduce((s, p) => s + p.purchase_price * p.quantity, 0);
    const lowStockProducts = products.filter(p => p.quantity <= p.low_stock_threshold);

    const filterSales = (from: number) =>
      sales.filter(s => new Date(s.created_at).getTime() >= from);

    const todaySales = filterSales(todayStart);
    const monthSales = filterSales(monthStart);
    const yearSales = filterSales(yearStart);

    const sumRevenue = (arr: Sale[]) => arr.reduce((s, x) => s + Number(x.total_amount), 0);
    const sumProfit = (arr: Sale[]) => arr.reduce((s, x) => s + Number(x.total_profit), 0);

    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (11 - i) + 1, 1);
      const slice = sales.filter(s => {
        const t = new Date(s.created_at).getTime();
        return t >= d.getTime() && t < end.getTime();
      });
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: sumRevenue(slice),
        profit: sumProfit(slice),
      };
    });

    const dailySales = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i) + 1);
      const slice = sales.filter(s => {
        const t = new Date(s.created_at).getTime();
        return t >= d.getTime() && t < end.getTime();
      });
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: sumRevenue(slice),
        profit: sumProfit(slice),
      };
    });

    const productRevMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    sales.forEach(sale => {
      (sale.sale_items ?? []).forEach(item => {
        const pid = item.product_id ?? item.product_name;
        if (!productRevMap[pid]) productRevMap[pid] = { name: item.product_name, quantity: 0, revenue: 0 };
        productRevMap[pid].quantity += item.quantity;
        productRevMap[pid].revenue += Number(item.total);
      });
    });
    const topProducts = Object.values(productRevMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalProducts,
      totalStockValue,
      totalInvestment,
      salesToday: todaySales.length,
      revenueToday: sumRevenue(todaySales),
      profitToday: sumProfit(todaySales),
      revenueMonth: sumRevenue(monthSales),
      profitMonth: sumProfit(monthSales),
      revenueYear: sumRevenue(yearSales),
      profitYear: sumProfit(yearSales),
      lowStockProducts,
      monthlySales,
      dailySales,
      topProducts,
    };
  }, [products, sales]);
}
