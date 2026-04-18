import { useState, useEffect, useRef, useCallback } from 'react';
import { Task, ToastNotification } from '../types';

export function useNotifications(tasks: Task[]) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const notifiedRef = useRef<Set<string>>(new Set());

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  }, []);

  const checkDeadlines = useCallback(() => {
    const now = Date.now();
    tasks.forEach(task => {
      if (task.completed) return;
      const due = new Date(task.due_date).getTime();
      const diff = due - now;
      const nearKey = `near-${task.id}`;
      const overdueKey = `overdue-${task.id}`;

      if (diff > 0 && diff <= 60 * 60 * 1000 && !notifiedRef.current.has(nearKey)) {
        notifiedRef.current.add(nearKey);
        const minutes = Math.floor(diff / 60000);
        addToast({
          type: 'warning',
          title: 'Deadline Approaching',
          message: `"${task.title}" is due in ${minutes} minute${minutes !== 1 ? 's' : ''}`,
          taskId: task.id,
        });
        showBrowserNotification(
          'Deadline Approaching',
          `"${task.title}" is due in ${minutes} minute${minutes !== 1 ? 's' : ''}`
        );
      }

      if (diff < 0 && !notifiedRef.current.has(overdueKey)) {
        notifiedRef.current.add(overdueKey);
        addToast({
          type: 'error',
          title: 'Task Overdue',
          message: `"${task.title}" is overdue!`,
          taskId: task.id,
        });
        showBrowserNotification('Task Overdue', `"${task.title}" is overdue!`);
      }
    });
  }, [tasks, addToast, showBrowserNotification]);

  useEffect(() => {
    requestBrowserPermission();
  }, [requestBrowserPermission]);

  useEffect(() => {
    checkDeadlines();
    const interval = setInterval(checkDeadlines, 60 * 1000);
    return () => clearInterval(interval);
  }, [checkDeadlines]);

  useEffect(() => {
    tasks.forEach(task => {
      if (task.completed) {
        notifiedRef.current.delete(`near-${task.id}`);
        notifiedRef.current.delete(`overdue-${task.id}`);
      }
    });
  }, [tasks]);

  return { toasts, addToast, removeToast };
}
