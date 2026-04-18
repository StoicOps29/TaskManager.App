import { Video as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  color: 'orange' | 'emerald' | 'sky' | 'rose' | 'amber';
  trend?: { value: string; positive: boolean };
}

const COLOR_MAP = {
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-900/30' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/30' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-900/20', icon: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/30' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', icon: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/30' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30' },
};

export function StatsCard({ label, value, subValue, icon: Icon, color, trend }: StatsCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border ${c.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
            trend.positive
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
          }`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
      {subValue && <p className={`text-sm font-medium mt-0.5 ${c.text}`}>{subValue}</p>}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}
