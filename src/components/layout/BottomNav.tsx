import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Archive, History, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/comprar', icon: ShoppingCart, label: 'Comprar' },
  { path: '/estoque', icon: Archive, label: 'Estoque' },
  { path: '/lista', icon: History, label: 'Histórico' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  return (
    <>
      {/* FAB Flutuante Verde Neon */}
      <motion.button
        className="fixed bottom-[84px] left-1/2 -translate-x-1/2 w-14 h-14 bg-[#39FF14] rounded-full flex items-center justify-center z-[60] shadow-[0_4px_20px_rgba(57,255,20,0.4)] active:scale-90 transition-transform duration-200 cursor-pointer"
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/nova')}
        title="Registrar Compra"
      >
        <Plus className="w-8 h-8 text-black" strokeWidth={2.5} />
      </motion.button>

      {/* Bottom Navigation Bar Inteiriço */}
      <nav className="fixed bottom-0 w-full max-w-[480px] h-[64px] z-50 bg-[#131318]/90 backdrop-blur-lg border-t border-white/10 flex justify-around items-center px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const active = current === tab.path;
          return (
            <button
              key={tab.path}
              className={`flex flex-col items-center justify-center transition-all duration-150 w-16 h-full cursor-pointer relative ${
                active
                  ? "text-[#00F5FF] font-semibold after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#00F5FF] after:rounded-full after:shadow-[0_0_8px_#00F5FF]"
                  : 'text-on-surface-variant/70 hover:text-[#00F5FF]'
              }`}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon className="w-6 h-6 mb-0.5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="font-label text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
