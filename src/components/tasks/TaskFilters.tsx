import { FilterState, Category, Priority, CATEGORIES, PRIORITIES } from '../../types';
import { SlidersHorizontal } from 'lucide-react';

interface TaskFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalVisible: number;
}

const STATUSES: FilterState['status'][] = ['All', 'Pending', 'Completed', 'Overdue'];
const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created_at', label: 'Newest' },
  { value: 'order_position', label: 'Custom' },
];

export function TaskFilters({ filters, onChange, totalVisible }: TaskFiltersProps) {
  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <SlidersHorizontal size={16} />
          Filters
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {totalVisible} task{totalVisible !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Category
          </label>
          <select
            value={filters.category}
            onChange={e => update({ category: e.target.value as Category | 'All' })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={e => update({ priority: e.target.value as Priority | 'All' })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Status
          </label>
          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => update({ status: s })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  filters.status === s
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Sort by
          </label>
          <select
            value={filters.sortBy}
            onChange={e => update({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
