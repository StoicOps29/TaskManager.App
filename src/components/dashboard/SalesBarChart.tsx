import { useTheme } from '../../contexts/ThemeContext';

interface ChartData {
  label: string;
  revenue: number;
  profit: number;
}

interface SalesBarChartProps {
  data: ChartData[];
  title: string;
  currencySymbol: string;
}

function shortNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function SalesBarChart({ data, title, currencySymbol }: SalesBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const maxVal = Math.max(...data.map(d => d.revenue), 1);
  const W = 600, H = 200;
  const padL = 52, padR = 12, padT = 12, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slotW = innerW / data.length;
  const revenueW = Math.max(Math.floor(slotW * 0.38), 4);
  const profitW = Math.max(Math.floor(slotW * 0.28), 3);

  const yScale = (v: number) => padT + innerH - (v / maxVal) * innerH;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: padT + innerH * (1 - t),
    val: maxVal * t,
  }));

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const labelColor = isDark ? '#64748b' : '#9ca3af';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm bg-orange-500 inline-block" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            Profit
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke={gridColor} strokeWidth="1" />
            <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill={labelColor}>
              {currencySymbol}{shortNum(t.val)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = padL + i * slotW + slotW / 2;
          const revH = Math.max((d.revenue / maxVal) * innerH, d.revenue > 0 ? 2 : 0);
          const proH = Math.max((d.profit / maxVal) * innerH, d.profit > 0 ? 2 : 0);
          return (
            <g key={i}>
              <rect x={cx - revenueW - 2} y={yScale(d.revenue)} width={revenueW} height={revH} rx="3" fill="url(#revGrad)" />
              <rect x={cx + 2} y={yScale(d.profit)} width={profitW} height={proH} rx="3" fill="url(#proGrad)" />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" fill={textColor}>{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
