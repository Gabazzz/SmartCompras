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

  // Itens vindos do estoque baixo
  const baixos = estoque.filter(
    (e) => (e.qtdMinima > 0 ? (e.qtdAtual / e.qtdMinima) * 100 : 100) <= 70
  );

  const [checkedStockIds, setCheckedStockIds] = useState<Record<string, boolean>>({});

  // Itens adicionados manualmente
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
    const newItem: ManualItem = {
      id: `manual-${Date.now()}`,
      nome: newManualNome.trim(),
      checked: false,
    };
    setManualItems((prev) => [...prev, newItem]);
    setNewManualNome('');
    setShowAddModal(false);
    toast.success('Item adicionado à lista!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  return (
    <div className="scroll-area h-full pt-20 pb-28 px-6 flex flex-col gap-6">
      {/* Title */}
      <section>
        <h1 className="font-display font-bold text-3xl text-on-surface">Minha Lista</h1>
      </section>

      {/* Manual Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full h-12 flex items-center justify-center gap-2 glass-panel border border-white/10 rounded-xl hover:bg-white/5 active:border-[#39FF14]/50 transition-all text-[#39FF14] font-label text-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar item manualmente</span>
      </button>

      {/* Section 1: Vindo do Estoque Baixo */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-semibold text-base text-on-surface">
            Vindo do Estoque Baixo
          </h2>
          <span className="bg-[#FF3131]/10 border border-[#FF3131]/20 text-[#FF3131] font-label text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_0_12px_rgba(255,49,49,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3131] animate-pulse" />
            Estoque Baixo
          </span>
        </div>

        {baixos.length === 0 ? (
          <div className="glass-panel rounded-xl p-4 text-center text-xs text-on-surface-variant">
            Nenhum item com estoque baixo no momento 🎉
          </div>
        ) : (
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden border border-white/10">
            {baixos.map((item, idx) => {
              const isChecked = !!checkedStockIds[item.id];
              const isLast = idx === baixos.length - 1;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleStockChecked(item.id)}
                  className={`flex items-center justify-between p-4 min-h-[56px] cursor-pointer hover:bg-white/[0.02] transition-colors ${
                    !isLast ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-body text-sm text-on-surface transition-all ${
                        isChecked ? 'line-through opacity-40' : ''
                      }`}
                    >
                      {item.produto}
                    </span>
                    <span className="font-label text-xs text-on-surface-variant/60">
                      Necessário: {Math.max(1, item.qtdMinima - item.qtdAtual)} {item.unidade}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      isChecked
                        ? 'border-[#39FF14] bg-[#39FF14]/20 shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                        : 'border-white/30'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-[#39FF14]" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Adicionados Manualmente */}
      <section className="flex flex-col gap-3">
        <div className="px-1">
          <h2 className="font-display font-semibold text-base text-on-surface">
            Adicionados Manualmente
          </h2>
        </div>

        {manualItems.length === 0 ? (
          <div className="glass-panel rounded-xl p-4 text-center text-xs text-on-surface-variant">
            Nenhum item adicionado manualmente
          </div>
        ) : (
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden border border-white/10">
            {manualItems.map((item, idx) => {
              const isLast = idx === manualItems.length - 1;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleManualChecked(item.id)}
                  className={`flex items-center justify-between p-4 min-h-[56px] cursor-pointer hover:bg-white/[0.02] transition-colors ${
                    !isLast ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span
                      className={`font-body text-sm text-on-surface transition-all ${
                        item.checked ? 'line-through opacity-40' : ''
                      }`}
                    >
                      {item.nome}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border transition-all duration-300 flex items-center justify-center ${
                      item.checked
                        ? 'border-[#39FF14] bg-[#39FF14]/20 shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                        : 'border-white/30'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5 text-[#39FF14]" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Adicionar Item Manual */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="fixed bottom-0 left-0 w-full bg-[rgba(20,25,35,0.95)] backdrop-blur-[32px] border-t border-white/10 rounded-t-3xl z-[70] p-6 pb-10 flex flex-col gap-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-xl text-on-surface">
                  Adicionar Item à Lista
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs text-on-surface-variant">Nome do Item</label>
                  <input
                    className="glass-panel rounded-lg p-3 text-on-surface font-body text-base outline-none focus:border-[#39FF14] transition-colors"
                    placeholder="Ex: Café, Leite, Pão..."
                    value={newManualNome}
                    onChange={(e) => setNewManualNome(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualItem()}
                    autoFocus
                  />
                </div>

                <button
                  className="w-full bg-[#39FF14] text-black font-display font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                  onClick={handleAddManualItem}
                >
                  <Plus className="w-5 h-5" /> Adicionar à Lista
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
