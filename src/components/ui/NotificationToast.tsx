import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ToastNotification } from '../../types';

interface NotificationToastProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

const TOAST_STYLES = {
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
    icon: <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />,
    title: 'text-amber-800 dark:text-amber-300',
    msg: 'text-amber-700 dark:text-amber-400',
  },
  error: {
    bg: 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700',
    icon: <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />,
    title: 'text-rose-800 dark:text-rose-300',
    msg: 'text-rose-700 dark:text-rose-400',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
    icon: <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
    title: 'text-emerald-800 dark:text-emerald-300',
    msg: 'text-emerald-700 dark:text-emerald-400',
  },
  info: {
    bg: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700',
    icon: <Info size={20} className="text-sky-600 dark:text-sky-400 flex-shrink-0" />,
    title: 'text-sky-800 dark:text-sky-300',
    msg: 'text-sky-700 dark:text-sky-400',
  },
};

export function NotificationToast({ toasts, onRemove }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => {
        const styles = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${styles.bg} animate-slide-in`}
          >
            {styles.icon}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${styles.title}`}>{toast.title}</p>
              <p className={`text-xs mt-0.5 ${styles.msg}`}>{toast.message}</p>
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
