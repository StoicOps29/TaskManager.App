import {
  LayoutDashboard,
  ListTodo,
  Zap,
  Tag,
} from 'lucide-react';
import { AppView, Category, CATEGORIES, CATEGORY_COLORS } from '../../types';
import { Task } from '../../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  selectedCategory: Category | 'All';
  onCategoryChange: (cat: Category | 'All') => void;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'all' as AppView, label: 'All Tasks', icon: ListTodo },
  { id: 'focus' as AppView, label: 'Focus Mode', icon: Zap },
];

export function Sidebar({
  currentView,
  onViewChange,
  selectedCategory,
  onCategoryChange,
  tasks,
  isOpen,
  onClose,
}: SidebarProps) {
  const getCategoryCount = (cat: Category) =>
    tasks.filter(t => t.category === cat && !t.completed).length;

  const handleNavClick = (view: AppView) => {
    onViewChange(view);
    onCategoryChange('All');
    onClose();
  };

  const handleCategoryClick = (cat: Category | 'All') => {
    onCategoryChange(cat);
    onViewChange('all');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1 mb-6">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id && selectedCategory === 'All';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-cyan-600 dark:text-cyan-400' : ''} />
                  {item.label}
                  {item.id === 'focus' && (
                    <span className="ml-auto text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-md">
                      {tasks.filter(t => t.priority === 'High' && !t.completed).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mb-3 px-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <Tag size={12} />
              Categories
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleCategoryClick('All')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === 'All' && currentView === 'all'
                  ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              All Categories
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                {tasks.filter(t => !t.completed).length}
              </span>
            </button>

            {CATEGORIES.map(cat => {
              const colors = CATEGORY_COLORS[cat];
              const count = getCategoryCount(cat);
              const isActive = selectedCategory === cat && currentView === 'all';
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                  {cat}
                  {count > 0 && (
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
