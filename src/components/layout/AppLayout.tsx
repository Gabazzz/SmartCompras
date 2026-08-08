import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, UserCircle, Plus } from 'lucide-react';
import BottomNav from './BottomNav';

interface Props {
  children: React.ReactNode;
  hideNav?: boolean;
}

export default function AppLayout({ children, hideNav = false }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isEstoque = location.pathname === '/estoque';

  return (
    <div className="mobile-container">
      {/* TopAppBar Fixo — apenas nas telas principais */}
      {!hideNav && (
        <header className="fixed top-0 w-full max-w-[480px] z-50 bg-[#131318]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 h-16 shadow-none">
          <button className="w-10 h-10 flex items-center justify-start text-[#E4E1E9] hover:opacity-80 active:scale-95 transition-all">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-display font-semibold text-lg text-[#E4E1E9] tracking-tight">
            SmartCompras
          </h1>
          <div className="flex items-center gap-3">
            {isEstoque && (
              <button
                onClick={() => navigate('/nova')}
                className="text-[#E4E1E9] hover:opacity-80 active:scale-95 transition-all"
              >
                <Plus className="w-6 h-6 text-[#39FF14]" />
              </button>
            )}
            <button className="w-10 h-10 flex items-center justify-end text-[#E4E1E9] hover:opacity-80 active:scale-95 transition-all">
              <UserCircle className="w-6 h-6" />
            </button>
          </div>
        </header>
      )}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.28 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.16 } }}
            style={{ height: '100%', overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
}
