import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { InventoryPage } from './components/inventory/InventoryPage';
import { SalesPage } from './components/sales/SalesPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { useProducts } from './hooks/useProducts';
import { useSales } from './hooks/useSales';
import { useStats } from './hooks/useStats';
import { AppView } from './types';

function AppShell() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, decrementStock } = useProducts();
  const { sales, loading: salesLoading, createSale } = useSales();
  const stats = useStats(products, sales);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading MotoShop...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const isLoading = productsLoading || salesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(p => !p)}
        lowStockProducts={stats.lowStockProducts}
      />

      <Sidebar
        currentView={view}
        onViewChange={setView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lowStockCount={stats.lowStockProducts.length}
        stats={{ totalProducts: stats.totalProducts, salesToday: stats.salesToday }}
        products={products}
      />

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Loading data...</p>
              </div>
            </div>
          ) : (
            <>
              {view === 'dashboard' && (
                <Dashboard
                  stats={stats}
                  recentSales={sales}
                  onNavigate={v => setView(v)}
                />
              )}
              {view === 'inventory' && (
                <InventoryPage
                  products={products}
                  onCreate={createProduct}
                  onUpdate={updateProduct}
                  onDelete={deleteProduct}
                />
              )}
              {view === 'sales' && (
                <SalesPage
                  products={products}
                  sales={sales}
                  onCreateSale={createSale}
                  onDecrementStock={decrementStock}
                />
              )}
              {view === 'reports' && (
                <ReportsPage sales={sales} products={products} stats={stats} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
