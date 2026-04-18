import { useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { Task, FilterState } from '../../types';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  tasks: Task[];
  filteredTasks: Task[];
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  isOverdue: (t: Task) => boolean;
  isNearDeadline: (t: Task) => boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
  onCreate: (data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_position'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  categoryTitle?: string;
}

export function TaskList({
  tasks,
  filteredTasks,
  filters,
  onFiltersChange,
  isOverdue,
  isNearDeadline,
  onToggle,
  onDelete,
  onReorder,
  onCreate,
  onUpdate,
  categoryTitle,
}: TaskListProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_position'>
  ) => {
    if (editTask) {
      await onUpdate(editTask.id, data);
    } else {
      await onCreate(data);
    }
    setEditTask(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditTask(null);
  };

  const groupedTasks = filteredTasks.reduce<Record<string, Task[]>>((acc, task) => {
    const key = task.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  const isEmpty = filteredTasks.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {categoryTitle || 'All Tasks'}
        </h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-medium hover:from-cyan-700 hover:to-sky-700 transition-all shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:block">New Task</span>
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={onFiltersChange}
        totalVisible={filteredTasks.length}
      />

      {isEmpty ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {filters.search
              ? 'No tasks match your search'
              : 'Create your first task to get started'}
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 text-white text-sm font-medium hover:from-cyan-700 hover:to-sky-700 transition-all shadow-md"
          >
            <Plus size={16} />
            Create Task
          </button>
        </div>
      ) : filters.category !== 'All' || categoryTitle ? (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isOverdue={isOverdue(task)}
              isNearDeadline={isNearDeadline(task)}
              onToggle={() => onToggle(task.id)}
              onEdit={() => handleEdit(task)}
              onDelete={() => onDelete(task.id)}
              onDragStart={() => setDragId(task.id)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => {
                if (dragId && dragId !== task.id) onReorder(dragId, task.id);
                setDragId(null);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([category, catTasks]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                {category}
                <span className="text-xs font-normal text-gray-400 dark:text-gray-500">
                  ({catTasks.length})
                </span>
              </h2>
              <div className="space-y-3">
                {catTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isOverdue={isOverdue(task)}
                    isNearDeadline={isNearDeadline(task)}
                    onToggle={() => onToggle(task.id)}
                    onEdit={() => handleEdit(task)}
                    onDelete={() => onDelete(task.id)}
                    onDragStart={() => setDragId(task.id)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragId && dragId !== task.id) onReorder(dragId, task.id);
                      setDragId(null);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        initialData={editTask}
      />

      {tasks.length === 0 && (
        <TaskForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          initialData={null}
        />
      )}
    </div>
  );
}
