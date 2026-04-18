import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { TaskList } from './components/tasks/TaskList';
import { FocusMode } from './components/focus/FocusMode';
import { TaskForm } from './components/tasks/TaskForm';
import { NotificationToast } from './components/ui/NotificationToast';
import { useTasks } from './hooks/useTasks';
import { useNotifications } from './hooks/useNotifications';
import { AppView, Category, Task } from './types';

function AppShell() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    tasks,
    filteredTasks,
    focusTasks,
    loading: tasksLoading,
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
  } = useTasks();

  const { toasts, removeToast } = useNotifications(tasks);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    if (search && currentView !== 'all') {
      setCurrentView('all');
    }
  };

  const handleCategoryChange = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleViewChange = (view: AppView) => {
    setCurrentView(view);
    if (view !== 'all') {
      setSelectedCategory('All');
      setFilters(prev => ({ ...prev, category: 'All', search: '' }));
    }
  };

  const handleCreateTask = async (
    data: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_position'>
  ) => {
    await createTask(data);
  };

  const handleUpdateTask = async (id: string, data: Partial<Task>) => {
    await updateTask(id, data);
  };

  const overdueCount = stats.overdue;
  const nearDeadlineCount = tasks.filter(t => isNearDeadline(t)).length;
  const notificationCount = overdueCount + nearDeadlineCount;
  const categoryTitle = selectedCategory !== 'All' ? selectedCategory : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <NotificationToast toasts={toasts} onRemove={removeToast} />

      <Header
        search={filters.search}
        onSearchChange={handleSearchChange}
        notificationCount={notificationCount}
        toasts={toasts}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        tasks={tasks}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardStats
                  stats={stats}
                  tasks={tasks}
                  isOverdue={isOverdue}
                  isNearDeadline={isNearDeadline}
                  onTaskToggle={toggleComplete}
                  onCreateClick={() => setIsCreateOpen(true)}
                />
              )}

              {currentView === 'all' && (
                <TaskList
                  tasks={tasks}
                  filteredTasks={filteredTasks}
                  filters={filters}
                  onFiltersChange={setFilters}
                  isOverdue={isOverdue}
                  isNearDeadline={isNearDeadline}
                  onToggle={toggleComplete}
                  onDelete={deleteTask}
                  onReorder={reorderTasks}
                  onCreate={handleCreateTask}
                  onUpdate={handleUpdateTask}
                  categoryTitle={categoryTitle}
                />
              )}

              {currentView === 'focus' && (
                <FocusMode
                  tasks={focusTasks}
                  isOverdue={isOverdue}
                  onToggle={toggleComplete}
                  onBack={() => setCurrentView('dashboard')}
                />
              )}
            </>
          )}
        </div>
      </main>

      <TaskForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        initialData={null}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
