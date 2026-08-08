import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';

interface ManualItem {
  id: string;
  nome: string;
  checked: boolean;
}

export default function ComprarPage() {
  const { estoque } = useAppStore();

  const baixos = estoque.filter(
    (e) => (e.qtdMinima > 0 ? (e.qtdAtual / e.qtdMinima) * 100 : 100) <= 70
  );

  const [checkedStockIds, setCheckedStockIds] = useState<Record<string, boolean>>({});
  const [manualItems, setManualItems] = useState<ManualItem[]>([
    { id: 'm-1', nome: 'Café', checked: false },
    { id: 'm-2', nome: 'Açúcar', checked: false },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newManualNome, setNewManualNome] = useState('');

  const toggleStockChecked = (id: string) => {
    setCheckedStockIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleManualChecked = (id: string) => {
    setManualItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddManualItem = () => {
    if (!newManualNome.trim()) return;
    setManualItems((prev) => [
      ...prev,
      { id: `manual-${Date.now()}`, nome: newManualNome.trim(), checked: false },
    ]);
    setNewManualNome('');
    setShowAddModal(false);
    toast.success('Item adicionado à lista!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-32 pt-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 flex flex-col gap-5">

        {/* Page Title */}
        <section className="pt-4">
          <h1 className="font-display font-bold text-3xl text-white">Minha Lista</h1>
        </section>

        {/* Add Manually Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-[#39FF14] text-sm font-label hover:bg-white/[0.06] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar item manualmente
        </button>

        {/* Section: Vindo do Estoque Baixo */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-white">Vindo do Estoque Baixo</h2>
            <div className="flex items-center gap-1.5 bg-[#FF3131]/10 border border-[#FF3131]/25 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF3131] animate-pulse" />
              <span className="text-[10px] font-label uppercase tracking-widest text-[#FF3131]">Estoque Baixo</span>
            </div>
          </div>

          {baixos.length === 0 ? (
            <div className="rounded-2xl p-5 text-center text-xs text-white/40 border border-white/10 bg-white/[0.03]">
              Nenhum item com estoque baixo 🎉
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              {baixos.map((item, idx) => {
                const isChecked = !!checkedStockIds[item.id];
                const isLast = idx === baixos.length - 1;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleStockChecked(item.id)}
                    className={`flex items-center justify-between px-4 py-4 min-h-[64px] cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors ${!isLast ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={`font-body text-sm text-white transition-all ${isChecked ? 'line-through opacity-40' : ''}`}>
                        {item.produto}
                      </span>
                      <span className="text-[10px] text-white/40 font-label">
                        Necessário: {Math.max(1, item.qtdMinima - item.qtdAtual)} {item.unidade}
                      </span>
                    </div>

                    <div
                      className="w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0"
                      style={{
                        borderColor: isChecked ? '#39FF14' : 'rgba(255,255,255,0.25)',
                        background: isChecked ? 'rgba(57,255,20,0.15)' : 'transparent',
                        boxShadow: isChecked ? '0 0 10px rgba(57,255,20,0.3)' : 'none',
                      }}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#39FF14]" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section: Adicionados Manualmente */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-base text-white">Adicionados Manualmente</h2>

          {manualItems.length === 0 ? (
            <div className="rounded-2xl p-5 text-center text-xs text-white/40 border border-white/10 bg-white/[0.03]">
              Nenhum item adicionado manualmente
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              {manualItems.map((item, idx) => {
                const isLast = idx === manualItems.length - 1;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleManualChecked(item.id)}
                    className={`flex items-center justify-between px-4 py-4 min-h-[64px] cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors ${!isLast ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    <span className={`font-body text-sm text-white transition-all ${item.checked ? 'line-through opacity-40' : ''}`}>
                      {item.nome}
                    </span>

                    <div
                      className="w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0"
                      style={{
                        borderColor: item.checked ? '#39FF14' : 'rgba(255,255,255,0.25)',
                        background: item.checked ? 'rgba(57,255,20,0.15)' : 'transparent',
                        boxShadow: item.checked ? '0 0 10px rgba(57,255,20,0.3)' : 'none',
                      }}
                    >
                      {item.checked && <Check className="w-3.5 h-3.5 text-[#39FF14]" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      {/* Modal Adicionar Item */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="fixed bottom-0 left-0 w-full rounded-t-3xl z-[70] p-6 pb-10 flex flex-col gap-5"
              style={{ background: 'rgba(15, 17, 22, 0.97)', backdropFilter: 'blur(32px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto -mt-1" />

              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-xl text-white">Adicionar à Lista</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-label">Nome do Item</label>
                  <input
                    className="rounded-xl p-3.5 text-white font-body text-base outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    placeholder="Ex: Café, Leite, Pão..."
                    value={newManualNome}
                    onChange={(e) => setNewManualNome(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualItem()}
                    autoFocus
                  />
                </div>

                <button
                  className="w-full py-4 rounded-xl text-black font-display font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ background: '#39FF14', boxShadow: '0 0 24px rgba(57,255,20,0.4)' }}
                  onClick={handleAddManualItem}
                >
                  <Plus className="w-5 h-5" /> Adicionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
