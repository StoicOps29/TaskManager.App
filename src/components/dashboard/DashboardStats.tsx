import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Plus, Flame } from 'lucide-react';
import { Task, CATEGORY_COLORS, PRIORITY_STYLES } from '../../types';
import { CountdownTimer } from '../ui/CountdownTimer';

interface DashboardStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
  };
  tasks: Task[];
  isOverdue: (t: Task) => boolean;
  isNearDeadline: (t: Task) => boolean;
  onTaskToggle: (id: string) => void;
  onCreateClick: () => void;
}

export function DashboardStats({
  stats,
  tasks,
  isOverdue,
  isNearDeadline,
  onTaskToggle,
  onCreateClick,
}: DashboardStatsProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const upcomingTasks = tasks
    .filter(t => !t.completed && !isOverdue(t))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const overdueTasks = tasks.filter(t => isOverdue(t)).slice(0, 3);

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-sky-50 dark:bg-sky-900/20',
      iconColor: 'text-sky-600 dark:text-sky-400',
      textColor: 'text-sky-700 dark:text-sky-400',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-amber-700 dark:text-amber-400',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      textColor: 'text-rose-700 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Here's your task overview
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-medium hover:from-cyan-700 hover:to-sky-700 transition-all shadow-md shadow-cyan-500/20 hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:block">New Task</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`${card.color} rounded-2xl p-4 border border-transparent`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.label}
                </span>
                <Icon size={18} className={card.iconColor} />
              </div>
              <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <TrendingUp size={16} className="text-cyan-600" />
            Completion Progress
          </div>
          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
            {completionRate}%
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            Upcoming Tasks
          </h3>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              No upcoming tasks
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => {
                const catColors = CATEGORY_COLORS[task.category];
                const priorityStyles = PRIORITY_STYLES[task.priority];
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border ${
                      isNearDeadline(task)
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                        : 'border-transparent'
                    }`}
                    onClick={() => onTaskToggle(task.id)}
                  >
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${catColors.bg} ${catColors.text}`}>
                          {task.category}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${priorityStyles.bg} ${priorityStyles.text}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <CountdownTimer dueDate={task.due_date} completed={task.completed} compact />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {overdueTasks.length > 0 ? (
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-200 dark:border-rose-800 p-5">
            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} />
              Overdue Tasks ({stats.overdue})
            </h3>
            <div className="space-y-3">
              {overdueTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-rose-200 dark:border-rose-800 cursor-pointer hover:shadow-sm transition-all"
                  onClick={() => onTaskToggle(task.id)}
                >
                  <div className="w-1.5 h-8 rounded-full bg-rose-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {task.title}
                    </p>
                    <CountdownTimer dueDate={task.due_date} completed={task.completed} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              All caught up!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              No overdue tasks right now.
            </p>
          </div>
        )}
      </div>

      {stats.highPriority > 0 && (
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold">Focus Needed</p>
              <p className="text-sm text-white/80">
                You have {stats.highPriority} high-priority task{stats.highPriority !== 1 ? 's' : ''} pending.
                Switch to Focus Mode to tackle them.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
