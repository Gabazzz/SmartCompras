import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ShoppingCart, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import SwipeableListItem from '../components/ui/SwipeableListItem';

const toastStyle = { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' };

export default function ComprarPage() {
  const navigate = useNavigate();
  const { estoque, listaCompras, addItemLista, renameItemLista, removeItemLista } = useAppStore();

  const baixos = estoque.filter(
    (e) => (e.qtdMinima > 0 ? (e.qtdAtual / e.qtdMinima) * 100 : 100) <= 70
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomeInput, setNomeInput] = useState('');

  // Tocar num item = "vou comprar isso agora" -> abre o registro já pré-preenchido.
  // Isso fecha o ciclo de verdade: ao salvar a compra, o estoque é reposto (ou o item
  // sai da lista manual) automaticamente — ver NewPurchasePage.
  const comprarDoEstoque = (item: (typeof estoque)[number]) => {
    navigate('/nova', {
      state: {
        produto: item.produto,
        estoqueId: item.id,
        quantidadeSugerida: Math.max(1, item.qtdMinima - item.qtdAtual),
      },
    });
  };

  const comprarDaLista = (id: string, produto: string) => {
    navigate('/nova', { state: { produto, listaId: id } });
  };

  const handleDeleteManual = async (id: string) => {
    await removeItemLista(id);
    toast.success('Item removido da lista!', { style: toastStyle });
  };

  const handleEditManual = (id: string, nomeAtual: string) => {
    setEditingId(id);
    setNomeInput(nomeAtual);
    setShowAddModal(true);
  };

  const handleAddManualItem = async () => {
    if (!nomeInput.trim()) return;
    if (editingId) {
      await renameItemLista(editingId, nomeInput.trim());
      toast.success('Item atualizado!', { style: toastStyle });
    } else {
      await addItemLista(nomeInput.trim());
      toast.success('Item adicionado à lista!', { style: toastStyle });
    }
    setNomeInput('');
    setEditingId(null);
    setShowAddModal(false);
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-32 pt-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 flex flex-col gap-5">

        {/* Page Title */}
        <section className="pt-4">
          <h1 className="font-display font-bold text-3xl text-white">Minha Lista</h1>
          <p className="text-xs text-white/40 font-body mt-1">Toque num item pra registrar a compra</p>
        </section>

        {/* Add Manually Button */}
        <button
          onClick={() => { setEditingId(null); setNomeInput(''); setShowAddModal(true); }}
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
              {baixos.map((item) => (
                // Sem swipe pra excluir aqui: excluir estoque não faz sentido nessa tela.
                // Swipe pra direita ainda leva pra editar o item direto no Estoque.
                <SwipeableListItem key={item.id} itemTitle={item.produto} onEdit={() => navigate('/estoque')}>
                  <div
                    onClick={() => comprarDoEstoque(item)}
                    className="rounded-2xl px-4 py-4 min-h-[64px] flex items-center justify-between border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] active:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-body text-sm text-white">{item.produto}</span>
                      <span className="text-[10px] text-white/40 font-label">
                        Necessário: {Math.max(1, item.qtdMinima - item.qtdAtual)} {item.unidade}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/25 shrink-0" />
                  </div>
                </SwipeableListItem>
              ))}
            </div>
          )}
        </section>

        {/* Section: Adicionados Manualmente */}
        <section className="flex flex-col gap-3">
          <h2 className="font-display font-semibold text-base text-white">Adicionados Manualmente</h2>

          {listaCompras.length === 0 ? (
            <div className="rounded-2xl p-5 text-center text-xs text-white/40 border border-white/10 bg-white/[0.03]">
              Nenhum item adicionado manualmente
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {listaCompras.map((item) => (
                <SwipeableListItem
                  key={item.id}
                  itemTitle={item.produto}
                  onDelete={() => handleDeleteManual(item.id)}
                  onEdit={() => handleEditManual(item.id, item.produto)}
                >
                  <div
                    onClick={() => comprarDaLista(item.id, item.produto)}
                    className="rounded-2xl px-4 py-4 min-h-[64px] flex items-center justify-between border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] active:bg-white/[0.07] transition-colors"
                  >
                    <span className="font-body text-sm text-white">{item.produto}</span>
                    <ArrowRight className="w-4 h-4 text-white/25 shrink-0" />
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
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
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
                  <Plus className="w-5 h-5" /> {editingId ? 'Salvar Alteração' : 'Salvar Item'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
