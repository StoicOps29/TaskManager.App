import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task, FilterState, PRIORITY_ORDER } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_FILTERS: FilterState = {
  category: 'All',
  priority: 'All',
  status: 'All',
  search: '',
  sortBy: 'due_date',
};

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('order_position', { ascending: true });

    if (!error && data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const maxPos = tasks.reduce((max, t) => Math.max(max, t.order_position), -1);
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id, order_position: maxPos + 1 })
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => [...prev, data as Task]);
    }
    return { error };
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => prev.map(t => (t.id === id ? (data as Task) : t)));
    }
    return { error };
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    return { error };
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await updateTask(id, { completed: !task.completed });
  };

  const reorderTasks = async (dragId: string, dropId: string) => {
    const dragIndex = tasks.findIndex(t => t.id === dragId);
    const dropIndex = tasks.findIndex(t => t.id === dropId);
    if (dragIndex === -1 || dropIndex === -1) return;

    const reordered = [...tasks];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);

    const updated = reordered.map((t, i) => ({ ...t, order_position: i }));
    setTasks(updated);

    const updates = updated.map(t =>
      supabase.from('tasks').update({ order_position: t.order_position }).eq('id', t.id)
    );
    await Promise.all(updates);
  };

  const isOverdue = (task: Task) =>
    !task.completed && new Date(task.due_date) < new Date();

  const isNearDeadline = (task: Task) => {
    if (task.completed) return false;
    const diff = new Date(task.due_date).getTime() - Date.now();
    return diff > 0 && diff <= 60 * 60 * 1000;
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filters.category !== 'All' && task.category !== filters.category) return false;
      if (filters.priority !== 'All' && task.priority !== filters.priority) return false;
      if (filters.status === 'Completed' && !task.completed) return false;
      if (filters.status === 'Pending' && (task.completed || isOverdue(task))) return false;
      if (filters.status === 'Overdue' && !isOverdue(task)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'priority') {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (filters.sortBy === 'due_date') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (filters.sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.order_position - b.order_position;
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed && !isOverdue(t)).length,
    overdue: tasks.filter(t => isOverdue(t)).length,
    highPriority: tasks.filter(t => t.priority === 'High' && !t.completed).length,
  };

  const focusTasks = tasks
    .filter(t => t.priority === 'High' && !t.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return {
    tasks,
    filteredTasks,
    focusTasks,
    loading,
    filters,
    setFilters,
    stats,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    isOverdue,
    isNearDeadline,
    refetch: fetchTasks,
  };
}
