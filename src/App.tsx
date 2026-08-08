import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { MinuToaster } from './components/ui/MinuToaster';
import HomePage from './pages/HomePage';
import ComprarPage from './pages/ComprarPage';
import NewPurchasePage from './pages/NewPurchasePage';
import ListPage from './pages/ListPage';
import StockPage from './pages/StockPage';
import { useAppStore } from './store/useAppStore';

function App() {
  const loadFromSupabase = useAppStore((s) => s.loadFromSupabase);
  const loading = useAppStore((s) => s.loading);
  const loaded = useAppStore((s) => s.loaded);
  const loadError = useAppStore((s) => s.loadError);

  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  if (loadError) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#fff' }}>
        <p>Não foi possível conectar ao banco de dados.</p>
        <p style={{ opacity: 0.7, fontSize: 14 }}>{loadError}</p>
      </div>
    );
  }

  if (loading || !loaded) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#fff' }}>
        Carregando suas compras...
      </div>
    );
  }

  return (
    <HashRouter>
      <MinuToaster />
      <Routes>
        {/* Nova compra — sem bottom nav */}
        <Route
          path="/nova"
          element={
            <AppLayout hideNav={true}>
              <NewPurchasePage />
            </AppLayout>
          }
        />
        {/* Telas principais com bottom nav */}
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/comprar" element={<ComprarPage />} />
                <Route path="/lista" element={<ListPage />} />
                <Route path="/estoque" element={<StockPage />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
