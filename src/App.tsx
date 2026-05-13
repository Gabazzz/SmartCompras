import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { MinuToaster } from './components/ui/MinuToaster';
import HomePage from './pages/HomePage';
import NewPurchasePage from './pages/NewPurchasePage';
import ListPage from './pages/ListPage';
import StockPage from './pages/StockPage';

function App() {
  return (
    <HashRouter>
      <MinuToaster />
      <Routes>
        {/* Nova compra — sem bottom nav */}
        <Route
          path="/nova"
          element={
            <AppLayout hideNav={false}>
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
