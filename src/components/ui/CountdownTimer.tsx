import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  dueDate: string;
  completed: boolean;
  compact?: boolean;
}

function getTimeRemaining(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  const abs = Math.abs(diff);
  const isOverdue = diff < 0;

  const days = Math.floor(abs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((abs % (1000 * 60)) / 1000);

  return { diff, isOverdue, days, hours, minutes, seconds };
}

function formatTime(dueDate: string): string {
  const { isOverdue, days, hours, minutes, seconds } = getTimeRemaining(dueDate);

  let text = '';
  if (days > 0) {
    text = `${days}d ${hours}h`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    text = `${minutes}m ${seconds}s`;
  } else {
    text = `${seconds}s`;
  }

  return isOverdue ? `${text} overdue` : `${text} left`;
}

export function CountdownTimer({ dueDate, completed, compact = false }: CountdownTimerProps) {
  const [display, setDisplay] = useState(() => formatTime(dueDate));
  const [isOverdue, setIsOverdue] = useState(false);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const update = () => {
      const { diff } = getTimeRemaining(dueDate);
      setDisplay(formatTime(dueDate));
      setIsOverdue(diff < 0);
      setIsNear(diff > 0 && diff <= 60 * 60 * 1000);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dueDate]);

  if (completed) {
    return (
      <span className={`flex items-center gap-1 text-emerald-600 dark:text-emerald-400 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Clock size={compact ? 12 : 14} />
        Done
      </span>
    );
  }

  if (isOverdue) {
    return (
      <span className={`flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
        <AlertTriangle size={compact ? 12 : 14} />
        {display}
      </span>
    );
  }

  if (isNear) {
    return (
      <span className={`flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium ${compact ? 'text-xs' : 'text-sm'} animate-pulse`}>
        <AlertTriangle size={compact ? 12 : 14} />
        {display}
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Clock size={compact ? 12 : 14} />
      {display}
    </span>
  );
}
