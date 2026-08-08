import { useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Archive, History, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  return (
    <nav className="fixed bottom-0 w-full max-w-[480px] h-[64px] z-50 bg-[#131318]/95 backdrop-blur-xl border-t border-white/10 flex justify-between items-center px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      {/* 1. Início */}
      <button
        className={`flex flex-col items-center justify-center transition-all duration-150 w-14 h-full cursor-pointer relative ${
          current === '/'
            ? "text-[#00F5FF] font-semibold after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#00F5FF] after:rounded-full after:shadow-[0_0_8px_#00F5FF]"
            : 'text-white/40 hover:text-white'
        }`}
        onClick={() => navigate('/')}
      >
        <Home className="w-5 h-5 mb-1" strokeWidth={current === '/' ? 2.2 : 1.8} />
        <span className="font-label text-[10px] leading-none">Início</span>
      </button>

      {/* 2. Comprar */}
      <button
        className={`flex flex-col items-center justify-center transition-all duration-150 w-14 h-full cursor-pointer relative ${
          current === '/comprar'
            ? "text-[#00F5FF] font-semibold after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#00F5FF] after:rounded-full after:shadow-[0_0_8px_#00F5FF]"
            : 'text-white/40 hover:text-white'
        }`}
        onClick={() => navigate('/comprar')}
      >
        <ShoppingCart className="w-5 h-5 mb-1" strokeWidth={current === '/comprar' ? 2.2 : 1.8} />
        <span className="font-label text-[10px] leading-none">Comprar</span>
      </button>

      {/* 3. Botão + Integrado no Centro da Barra */}
      <div className="flex items-center justify-center w-14 h-full">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate('/nova')}
          className="w-11 h-11 bg-[#39FF14] text-black rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(57,255,20,0.5)] hover:shadow-[0_0_22px_rgba(57,255,20,0.7)] transition-all cursor-pointer"
          title="Registrar Compra"
        >
          <Plus className="w-6 h-6 text-black" strokeWidth={2.8} />
        </motion.button>
      </div>

      {/* 4. Estoque */}
      <button
        className={`flex flex-col items-center justify-center transition-all duration-150 w-14 h-full cursor-pointer relative ${
          current === '/estoque'
            ? "text-[#00F5FF] font-semibold after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#00F5FF] after:rounded-full after:shadow-[0_0_8px_#00F5FF]"
            : 'text-white/40 hover:text-white'
        }`}
        onClick={() => navigate('/estoque')}
      >
        <Archive className="w-5 h-5 mb-1" strokeWidth={current === '/estoque' ? 2.2 : 1.8} />
        <span className="font-label text-[10px] leading-none">Estoque</span>
      </button>

      {/* 5. Histórico */}
      <button
        className={`flex flex-col items-center justify-center transition-all duration-150 w-14 h-full cursor-pointer relative ${
          current === '/lista'
            ? "text-[#00F5FF] font-semibold after:content-[''] after:absolute after:bottom-1 after:w-1.5 after:h-1.5 after:bg-[#00F5FF] after:rounded-full after:shadow-[0_0_8px_#00F5FF]"
            : 'text-white/40 hover:text-white'
        }`}
        onClick={() => navigate('/lista')}
      >
        <History className="w-5 h-5 mb-1" strokeWidth={current === '/lista' ? 2.2 : 1.8} />
        <span className="font-label text-[10px] leading-none">Histórico</span>
      </button>
    </nav>
  );
}
