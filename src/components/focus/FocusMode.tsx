import { Zap, CheckCircle2, Circle, ArrowLeft, Flame } from 'lucide-react';
import { Task, CATEGORY_COLORS } from '../../types';
import { CountdownTimer } from '../ui/CountdownTimer';

interface FocusModeProps {
  tasks: Task[];
  isOverdue: (t: Task) => boolean;
  onToggle: (id: string) => void;
  onBack: () => void;
}

export function FocusMode({ tasks, isOverdue, onToggle, onBack }: FocusModeProps) {
  const isEmpty = tasks.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Zap size={22} className="text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Focus Mode</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEmpty
              ? 'No high-priority tasks — great work!'
              : `${tasks.length} high-priority task${tasks.length !== 1 ? 's' : ''} require your attention`}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            You're all clear!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No high-priority tasks to focus on right now.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Flame size={24} />
            </div>
            <div>
              <p className="font-bold text-lg">Stay Focused</p>
              <p className="text-white/80 text-sm">
                Complete high-priority tasks first. One task at a time.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {tasks.map((task, index) => {
              const catColors = CATEGORY_COLORS[task.category];
              const overdue = isOverdue(task);
              const dueFormatted = new Date(task.due_date).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={task.id}
                  className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 shadow-md hover:shadow-lg transition-all duration-200
                    ${overdue
                      ? 'border-rose-400 dark:border-rose-600 bg-rose-50/30 dark:bg-rose-900/10'
                      : 'border-rose-200 dark:border-rose-800'
                    }`}
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl bg-rose-500" />

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug flex-1">
                          {task.title}
                        </h3>
                        <button
                          onClick={() => onToggle(task.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={24} className="text-emerald-500" />
                          ) : (
                            <Circle size={24} />
                          )}
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${catColors.bg} ${catColors.text}`}>
                          {task.category}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                          High Priority
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{dueFormatted}</span>
                        <CountdownTimer dueDate={task.due_date} completed={task.completed} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
