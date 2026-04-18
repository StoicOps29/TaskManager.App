import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product, ProductCategory } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (error) setError(error.message);
    else setProducts((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  const createProduct = useCallback(async (
    data: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Product> => {
    const { data: created, error } = await supabase
      .from('products')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    setProducts(prev => [...prev, created as Product].sort((a, b) => a.name.localeCompare(b.name)));
    return created as Product;
  }, []);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>): Promise<Product> => {
    const { data: updated, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setProducts(prev => prev.map(p => p.id === id ? updated as Product : p));
    return updated as Product;
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const decrementStock = useCallback(async (productId: string, qty: number): Promise<void> => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    await updateProduct(productId, { quantity: Math.max(0, product.quantity - qty) });
  }, [products, updateProduct]);

  const getLowStockProducts = useCallback(
    () => products.filter(p => p.quantity <= p.low_stock_threshold),
    [products]
  );

  const searchProducts = useCallback(
    (query: string, category?: ProductCategory | 'All') => {
      return products.filter(p => {
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase()) ||
          p.supplier.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = !category || category === 'All' || p.category === category;
        return matchesSearch && matchesCategory;
      });
    },
    [products]
  );

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    decrementStock,
    getLowStockProducts,
    searchProducts,
  };
}
