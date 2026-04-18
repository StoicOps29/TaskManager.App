export type Currency = 'PKR' | 'USD' | 'EUR' | 'GBP';

export type ProductCategory =
  | 'Engine Parts'
  | 'Brake Parts'
  | 'Electrical'
  | 'Body Parts'
  | 'Tires & Tubes'
  | 'Lubricants & Oils'
  | 'Tools & Equipment'
  | 'Filters'
  | 'Chain & Sprocket'
  | 'Other';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  low_stock_threshold: number;
  supplier: string;
  sku: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  purchase_price: number;
  total: number;
  profit: number;
  created_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total_amount: number;
  total_profit: number;
  currency: Currency;
  notes: string;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
  profit: number;
}

export interface WorkshopStats {
  totalProducts: number;
  totalStockValue: number;
  totalInvestment: number;
  salesToday: number;
  revenueToday: number;
  profitToday: number;
  revenueMonth: number;
  profitMonth: number;
  revenueYear: number;
  profitYear: number;
  lowStockProducts: Product[];
  monthlySales: { month: string; revenue: number; profit: number }[];
  dailySales: { date: string; revenue: number; profit: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export type AppView = 'dashboard' | 'inventory' | 'sales' | 'reports';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Engine Parts',
  'Brake Parts',
  'Electrical',
  'Body Parts',
  'Tires & Tubes',
  'Lubricants & Oils',
  'Tools & Equipment',
  'Filters',
  'Chain & Sprocket',
  'Other',
];

export const CURRENCIES: { code: Currency; symbol: string; name: string }[] = [
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const CATEGORY_COLORS: Record<ProductCategory, { bg: string; text: string; dot: string }> = {
  'Engine Parts':      { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  'Brake Parts':       { bg: 'bg-rose-100 dark:bg-rose-900/30',     text: 'text-rose-700 dark:text-rose-400',     dot: 'bg-rose-500' },
  'Electrical':        { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500' },
  'Body Parts':        { bg: 'bg-sky-100 dark:bg-sky-900/30',       text: 'text-sky-700 dark:text-sky-400',       dot: 'bg-sky-500' },
  'Tires & Tubes':     { bg: 'bg-slate-100 dark:bg-slate-700',      text: 'text-slate-700 dark:text-slate-300',   dot: 'bg-slate-500' },
  'Lubricants & Oils': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Tools & Equipment': { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-700 dark:text-teal-400',     dot: 'bg-teal-500' },
  'Filters':           { bg: 'bg-cyan-100 dark:bg-cyan-900/30',     text: 'text-cyan-700 dark:text-cyan-400',     dot: 'bg-cyan-500' },
  'Chain & Sprocket':  { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-700 dark:text-blue-400',     dot: 'bg-blue-500' },
  'Other':             { bg: 'bg-gray-100 dark:bg-gray-700',        text: 'text-gray-700 dark:text-gray-300',     dot: 'bg-gray-500' },
};
