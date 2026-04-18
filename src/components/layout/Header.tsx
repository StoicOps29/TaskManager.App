import { Sun, Moon, Bell, LogOut, CheckSquare, Search, Menu, X, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ToastNotification } from '../../types';
import { useState } from 'react';

interface HeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  notificationCount: number;
  toasts: ToastNotification[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  search,
  onSearchChange,
  notificationCount,
  toasts,
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'U';

  const TOAST_ICON: Record<string, React.ReactNode> = {
    error: <AlertCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />,
    info: <AlertCircle size={15} className="text-sky-500 flex-shrink-0 mt-0.5" />,
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center px-4 gap-4">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
          <CheckSquare size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">
          TaskFlow
        </span>
      </div>

      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-cyan-400 dark:focus:border-cyan-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(p => !p); setShowUserMenu(false); }}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={20} />
          </button>
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full text-white text-xs flex items-center justify-center font-bold pointer-events-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-11 z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-modal">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</p>
                  {notificationCount > 0 && (
                    <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">
                      {notificationCount} alerts
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {toasts.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">All caught up!</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No active alerts</p>
                    </div>
                  ) : (
                    toasts.map(toast => (
                      <div
                        key={toast.id}
                        className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        {TOAST_ICON[toast.type]}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{toast.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{toast.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white text-sm font-bold hover:shadow-md transition-shadow"
          >
            {initials}
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-10 z-50 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 animate-modal">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => { signOut(); setShowUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
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
