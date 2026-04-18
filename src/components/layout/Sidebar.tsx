import { LayoutDashboard, Package, ShoppingCart, BarChart3, AlertTriangle } from 'lucide-react';
import { AppView, Product } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (v: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  lowStockCount: number;
  stats: { totalProducts: number; salesToday: number };
  products: Product[];
}

const NAV = [
  { id: 'dashboard' as AppView, label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'inventory' as AppView, label: 'Inventory',  icon: Package },
  { id: 'sales'     as AppView, label: 'Sales',       icon: ShoppingCart },
  { id: 'reports'   as AppView, label: 'Reports',     icon: BarChart3 },
];

export function Sidebar({
  currentView, onViewChange, isOpen, onClose, lowStockCount, stats, products,
}: SidebarProps) {
  const handleNav = (v: AppView) => { onViewChange(v); onClose(); };

  const categoryCount = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button key={item.id} onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}>
                <Icon size={18} className={active ? 'text-orange-600 dark:text-orange-400' : 'group-hover:text-gray-700 dark:group-hover:text-gray-200'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'inventory' && stats.totalProducts > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${active ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                    {stats.totalProducts}
                  </span>
                )}
                {item.id === 'sales' && stats.salesToday > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${active ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                    {stats.salesToday}
                  </span>
                )}
              </button>
            );
          })}

          {lowStockCount > 0 && (
            <div className="mx-1 mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    {lowStockCount} Low Stock {lowStockCount === 1 ? 'Item' : 'Items'}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Reorder needed</p>
                </div>
              </div>
            </div>
          )}

          {topCategories.length > 0 && (
            <div className="pt-4">
              <p className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Top Categories
              </p>
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="flex-1 truncate text-xs text-gray-500 dark:text-gray-400">{cat}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            MotoShop v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
