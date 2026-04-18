export type Priority = 'High' | 'Medium' | 'Low';

export type Category =
  | 'Personal'
  | 'Health'
  | 'Workout'
  | 'Office Work'
  | 'Finance'
  | 'Shopping'
  | 'Education'
  | 'Other';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  due_date: string;
  completed: boolean;
  order_position: number;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  category: Category | 'All';
  priority: Priority | 'All';
  status: 'All' | 'Pending' | 'Completed' | 'Overdue';
  search: string;
  sortBy: 'due_date' | 'priority' | 'created_at' | 'order_position';
}

export interface ToastNotification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  title: string;
  message: string;
  taskId?: string;
}

export type AppView = 'dashboard' | 'all' | 'focus';

export const CATEGORIES: Category[] = [
  'Personal',
  'Health',
  'Workout',
  'Office Work',
  'Finance',
  'Shopping',
  'Education',
  'Other',
];

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; dot: string }> = {
  Personal: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  Health: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  Workout: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  'Office Work': {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  Finance: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Shopping: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    text: 'text-pink-700 dark:text-pink-400',
    dot: 'bg-pink-500',
  },
  Education: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    dot: 'bg-teal-500',
  },
  Other: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500',
  },
};

export const PRIORITY_STYLES: Record<Priority, { bg: string; text: string; border: string }> = {
  High: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-400',
  },
  Medium: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-400',
  },
  Low: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-400',
  },
};
