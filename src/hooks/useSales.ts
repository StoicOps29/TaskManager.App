import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Sale, CartItem, Currency } from '../types';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async (limit = 200) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (!error) setSales((data ?? []) as Sale[]);
    setLoading(false);
  }, []);

  const createSale = useCallback(async (
    cartItems: CartItem[],
    currency: Currency,
    notes: string,
    onDecrementStock: (productId: string, qty: number) => Promise<void>
  ): Promise<Sale> => {
    const totalAmount = cartItems.reduce((s, i) => s + i.total, 0);
    const totalProfit = cartItems.reduce((s, i) => s + i.profit, 0);

    const { data: sale, error: saleErr } = await supabase
      .from('sales')
      .insert([{ total_amount: totalAmount, total_profit: totalProfit, currency, notes }])
      .select()
      .single();
    if (saleErr) throw saleErr;

    const itemRows = cartItems.map(item => ({
      sale_id: (sale as Sale).id,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.selling_price,
      purchase_price: item.product.purchase_price,
      total: item.total,
      profit: item.profit,
    }));

    const { error: itemsErr } = await supabase.from('sale_items').insert(itemRows);
    if (itemsErr) throw itemsErr;

    for (const item of cartItems) {
      await onDecrementStock(item.product.id, item.quantity);
    }

    await fetchSales();
    return sale as Sale;
  }, [fetchSales]);

  const deleteSale = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('sales').delete().eq('id', id);
    if (error) throw error;
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  return { sales, loading, fetchSales, createSale, deleteSale };
}
