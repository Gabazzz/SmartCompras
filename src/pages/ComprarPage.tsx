import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import SwipeableListItem from '../components/ui/SwipeableListItem';

interface ManualItem {
  id: string;
  nome: string;
  checked: boolean;
}

export default function ComprarPage() {
  const navigate = useNavigate();
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

  const handleDeleteManual = (id: string) => {
    setManualItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item removido da lista!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  const handleEditManual = (item: ManualItem) => {
    setNewManualNome(item.nome);
    setManualItems((prev) => prev.filter((i) => i.id !== item.id));
    setShowAddModal(true);
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
          onClick={() => { setNewManualNome(''); setShowAddModal(true); }}
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
            <div className="flex flex-col gap-2">
              {baixos.map((item) => {
                const isChecked = !!checkedStockIds[item.id];
                return (
                  <SwipeableListItem
                    key={item.id}
                    itemTitle={item.produto}
                    onDelete={() => toggleStockChecked(item.id)}
                    onEdit={() => navigate('/estoque')}
                  >
                    <div
                      onClick={() => toggleStockChecked(item.id)}
                      className="rounded-2xl px-4 py-4 min-h-[64px] flex items-center justify-between border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] active:bg-white/[0.07] transition-colors"
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
                  </SwipeableListItem>
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
            <div className="flex flex-col gap-2">
              {manualItems.map((item) => (
                <SwipeableListItem
                  key={item.id}
                  itemTitle={item.nome}
                  onDelete={() => handleDeleteManual(item.id)}
                  onEdit={() => handleEditManual(item)}
                >
                  <div
                    onClick={() => toggleManualChecked(item.id)}
                    className="rounded-2xl px-4 py-4 min-h-[64px] flex items-center justify-between border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] active:bg-white/[0.07] transition-colors"
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
                </SwipeableListItem>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Modal Adicionar/Editar Item */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-[70] backdrop-blur-md flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="w-full max-w-[480px] rounded-t-[32px] p-6 pb-10 flex flex-col gap-6 z-[80]"
              style={{
                background: 'linear-gradient(180deg, rgba(24,26,32,0.98) 0%, #0A0A0F 100%)',
                borderTop: '1px solid rgba(57,255,20,0.25)',
                boxShadow: '0 -20px 60px rgba(57,255,20,0.08), 0 -1px 0 rgba(255,255,255,0.06) inset',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto -mt-1" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(57,255,20,0.12)', border: '1px solid rgba(57,255,20,0.3)', boxShadow: '0 0 16px rgba(57,255,20,0.15)' }}
                  >
                    <ShoppingCart className="w-4.5 h-4.5 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-white leading-tight">Item da Lista</h3>
                    <p className="text-[11px] text-white/40 font-body">Adicione algo que precisa comprar</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">Nome do Item</label>
                  <input
                    className="w-full rounded-2xl px-4 py-4 text-white font-body text-base outline-none bg-white/[0.04] border border-white/10 focus:border-[#39FF14] focus:bg-white/[0.06] transition-all placeholder:text-white/25"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
                    placeholder="Ex: Café, Leite, Pão..."
                    value={newManualNome}
                    onChange={(e) => setNewManualNome(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualItem()}
                    autoFocus
                  />
                </div>

                <button
                  className="w-full py-4 rounded-2xl text-black font-display font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4dff2b 0%, #2ecc11 100%)',
                    boxShadow: '0 8px 30px rgba(57,255,20,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
                  onClick={handleAddManualItem}
                >
                  <Plus className="w-5 h-5" /> Salvar Item
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
