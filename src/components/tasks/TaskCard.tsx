import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, CATEGORY_COLORS, PRIORITY_STYLES } from '../../types';
import { CountdownTimer } from '../ui/CountdownTimer';

interface TaskCardProps {
  task: Task;
  isOverdue: boolean;
  isNearDeadline: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

export function TaskCard({
  task,
  isOverdue,
  isNearDeadline,
  onToggle,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const catColors = CATEGORY_COLORS[task.category];
  const priorityStyles = PRIORITY_STYLES[task.priority];

  const borderColor = isOverdue
    ? 'border-rose-300 dark:border-rose-700'
    : isNearDeadline
    ? 'border-amber-300 dark:border-amber-700'
    : task.priority === 'High'
    ? 'border-rose-200 dark:border-rose-800'
    : 'border-gray-200 dark:border-slate-700';

  const dueDateFormatted = new Date(task.due_date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={e => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        onDrop();
      }}
      className={`group relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-200 shadow-sm hover:shadow-md
        ${borderColor}
        ${isDragOver ? 'scale-105 shadow-lg' : ''}
        ${task.completed ? 'opacity-60' : ''}
        ${isOverdue ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''}
        ${isNearDeadline ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}
      `}
    >
      {task.priority === 'High' && !task.completed && (
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-rose-500" />
      )}
      {task.priority === 'Medium' && !task.completed && (
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-amber-500" />
      )}
      {task.priority === 'Low' && !task.completed && (
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-emerald-500" />
      )}

      <div className="flex items-start gap-3 p-4">
        <div className="flex items-center gap-2 mt-0.5 flex-shrink-0">
          <div className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity text-gray-300 dark:text-gray-600">
            <GripVertical size={16} />
          </div>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 size={22} className="text-emerald-500" />
            ) : (
              <Circle size={22} />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3
              className={`font-semibold text-gray-900 dark:text-white text-sm leading-tight flex-1 min-w-0 ${
                task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${catColors.bg} ${catColors.text}`}>
              {task.category}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${priorityStyles.bg} ${priorityStyles.text}`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{dueDateFormatted}</span>
          </div>

          <div className="mt-2">
            <CountdownTimer dueDate={task.due_date} completed={task.completed} compact />
          </div>

          {task.description && (
            <>
              {expanded && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {task.description}
                </p>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={12} /> Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} /> More
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
            title="Edit task"
          >
            <Pencil size={15} />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              title="Delete task"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
