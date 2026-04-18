import { useState } from 'react';
import { Wrench, Sun, Moon, LogOut, Menu, X, Bell, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Product, CURRENCIES } from '../../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  lowStockProducts: Product[];
}

export function Header({ sidebarOpen, onToggleSidebar, lowStockProducts }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'MW';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center px-4 gap-3">
      <button onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
          <Wrench size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block tracking-tight">
          MotoShop
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as typeof currency)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 border border-transparent text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <button onClick={() => { setShowAlerts(p => !p); setShowUserMenu(false); }}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <Bell size={20} />
            {lowStockProducts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center font-bold pointer-events-none">
                {lowStockProducts.length > 9 ? '9+' : lowStockProducts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAlerts(false)} />
              <div className="absolute right-0 top-11 z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-modal">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Stock Alerts</p>
                  {lowStockProducts.length > 0 && (
                    <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">
                      {lowStockProducts.length} items
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {lowStockProducts.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">All stock levels are healthy</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No alerts at this time</p>
                    </div>
                  ) : (
                    lowStockProducts.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                        <AlertTriangle size={15} className={p.quantity === 0 ? 'text-rose-500' : 'text-amber-500'} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {p.quantity === 0 ? 'Out of stock' : `${p.quantity} left (min: ${p.low_stock_threshold})`}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${p.quantity === 0 ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                          {p.quantity === 0 ? 'OUT' : 'LOW'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button onClick={() => { setShowUserMenu(p => !p); setShowAlerts(false); }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold hover:shadow-md hover:shadow-orange-500/30 transition-all">
            {initials}
          </button>
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-10 z-50 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 animate-modal">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Workshop Owner</p>
                </div>
                <button onClick={() => { signOut(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
