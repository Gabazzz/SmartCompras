import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, X, Check, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import type { Estoque, Unidade } from '../types';

const UNIDADES: Unidade[] = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct'];

function getStatus(item: Estoque): 'critico' | 'baixo' | 'ok' {
  const perc = item.qtdMinima > 0 ? (item.qtdAtual / item.qtdMinima) * 100 : 100;
  if (perc <= 30) return 'critico';
  if (perc <= 70) return 'baixo';
  return 'ok';
}

const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: i * 0.04 } },
});

function Section({
  title,
  items,
  type,
  onEdit,
}: {
  title: string;
  items: Estoque[];
  type: 'critico' | 'baixo' | 'ok';
  onEdit: (id: string) => void;
}) {
  if (items.length === 0) return null;

  const dotColorClass =
    type === 'critico'
      ? 'bg-[#FF6B6B] shadow-[0_0_8px_#FF6B6B]'
      : type === 'baixo'
      ? 'bg-[#FFD700] shadow-[0_0_8px_#FFD700]'
      : 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]';

  const cardBorderClass =
    type === 'critico'
      ? 'border-[1.5px] border-[#FF6B6B] shadow-[0_0_10px_rgba(255,107,107,0.15)]'
      : 'border border-white/10';

  const percColorClass =
    type === 'critico'
      ? 'text-[#FF6B6B]'
      : type === 'baixo'
      ? 'text-[#FFD700]'
      : 'text-[#39FF14]';

  const progressFillClass =
    type === 'critico'
      ? 'bg-[#FF6B6B] shadow-[0_0_8px_#FF6B6B]'
      : type === 'baixo'
      ? 'bg-[#FFD700] shadow-[0_0_8px_#FFD700]'
      : 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]';

  return (
    <div className="flex flex-col gap-3 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColorClass}`} />
        <h2 className="font-display font-semibold text-lg text-on-surface">{title}</h2>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const perc = item.qtdMinima > 0 ? Math.round((item.qtdAtual / item.qtdMinima) * 100) : 100;
          const clampedPerc = Math.min(Math.max(perc, 0), 100);

          return (
            <motion.div
              key={item.id}
              {...staggerItem(i)}
              className={`glass-panel rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors ${cardBorderClass}`}
              onClick={() => onEdit(item.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-body font-semibold text-base text-on-surface">{item.produto}</span>
                <span className={`font-display text-sm font-semibold ${percColorClass}`}>{perc}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#1A1A1F] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressFillClass}`}
                  style={{ width: `${clampedPerc}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-on-surface-variant font-label">
                <span>Atual: {item.qtdAtual}{item.unidade}</span>
                <span>Mín: {item.qtdMinima}{item.unidade}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function StockPage() {
  const { estoque, addEstoque, updateEstoque, deleteEstoque, addCompra, mercados } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [newProduto, setNewProduto] = useState('');
  const [newQtdAtual, setNewQtdAtual] = useState('1');
  const [newQtdMin, setNewQtdMin] = useState('2');
  const [newUnidade, setNewUnidade] = useState<Unidade>('un');

  const selected = estoque.find((e) => e.id === selectedId);
  const [editQtd, setEditQtd] = useState('');
  const [editMin, setEditMin] = useState('');

  const criticos = estoque.filter((e) => getStatus(e) === 'critico');
  const baixos = estoque.filter((e) => getStatus(e) === 'baixo');
  const oks = estoque.filter((e) => getStatus(e) === 'ok');

  const openEdit = (id: string) => {
    const item = estoque.find((e) => e.id === id);
    if (item) {
      setEditQtd(String(item.qtdAtual));
      setEditMin(String(item.qtdMinima));
      setSelectedId(id);
    }
  };

  const saveEdit = () => {
    if (!selectedId) return;
    const qtd = parseFloat(editQtd);
    const min = parseFloat(editMin);
    if (!isNaN(qtd) && !isNaN(min)) {
      updateEstoque(selectedId, { qtdAtual: qtd, qtdMinima: min });
      toast.success('Estoque atualizado!', {
        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
      });
    }
    setSelectedId(null);
  };

  const handleAddToList = () => {
    if (!selected) return;
    addCompra({
      produto: selected.produto,
      categoria: 'Outros',
      essencial: true,
      quantidade: Math.max(1, selected.qtdMinima - selected.qtdAtual),
      unidade: selected.unidade,
      valorUni: 0,
      valorTotal: 0,
      mercado: mercados[0] || 'Mercado A',
      data: new Date().toISOString(),
    });
    toast.success(`${selected.produto} adicionado à lista!`, {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
    setSelectedId(null);
  };

  const handleAddEstoque = () => {
    if (!newProduto.trim()) return;
    addEstoque({
      produto: newProduto.trim(),
      qtdAtual: parseFloat(newQtdAtual) || 1,
      qtdMinima: parseFloat(newQtdMin) || 2,
      unidade: newUnidade,
    });
    setNewProduto('');
    setNewQtdAtual('1');
    setNewQtdMin('2');
    setShowAdd(false);
    toast.success('Item adicionado ao estoque!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  return (
    <div className="scroll-area h-full pb-28">
      {/* Top Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Estoque</h1>
        </div>
        <button
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-[#39FF14] hover:bg-white/10 active:scale-95 transition-all"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6">
        {/* Banner de Alerta Crítico */}
        {criticos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-[#FF6B6B]/40 shadow-[0_0_12px_rgba(255,107,107,0.2)] rounded-xl p-4 flex items-center gap-3 animate-pulse mb-6"
          >
            <AlertTriangle className="w-5 h-5 text-[#FF6B6B] shrink-0" />
            <div className="flex flex-col">
              <span className="font-label font-bold text-sm text-[#FF6B6B]">
                {criticos.length} {criticos.length === 1 ? 'item em nível crítico!' : 'itens em nível crítico!'}
              </span>
              <span className="text-xs text-on-surface-variant font-body">
                {criticos.map((c) => c.produto).join(', ')}
              </span>
            </div>
          </motion.div>
        )}

        {estoque.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">📦</span>
            <p className="text-on-surface-variant text-sm font-body">Estoque vazio</p>
          </div>
        ) : (
          <>
            <Section title="Crítico" items={criticos} type="critico" onEdit={openEdit} />
            <Section title="Atenção" items={baixos} type="baixo" onEdit={openEdit} />
            <Section title="OK" items={oks} type="ok" onEdit={openEdit} />
          </>
        )}
      </div>

      {/* Modal de Edição (Bottom Sheet) */}
      <AnimatePresence>
        {selectedId && selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="fixed bottom-0 left-0 w-full bg-[rgba(20,25,35,0.92)] backdrop-blur-[32px] border-t border-white/10 rounded-t-3xl z-[70] p-6 pb-10 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-xl text-on-surface">{selected.produto}</h3>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs text-on-surface-variant">Quantidade Atual</label>
                  <div className="glass-panel rounded-lg p-3 flex items-center justify-between">
                    <input
                      className="bg-transparent font-display font-bold text-xl text-white w-full outline-none"
                      value={editQtd}
                      onChange={(e) => setEditQtd(e.target.value)}
                      inputMode="decimal"
                    />
                    <span className="text-xs text-on-surface-variant font-label">{selected.unidade}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs text-on-surface-variant">Mínimo Aceitável</label>
                  <div className="glass-panel rounded-lg p-3 flex items-center justify-between">
                    <input
                      className="bg-transparent font-display font-bold text-xl text-white w-full outline-none"
                      value={editMin}
                      onChange={(e) => setEditMin(e.target.value)}
                      inputMode="decimal"
                    />
                    <span className="text-xs text-on-surface-variant font-label">{selected.unidade}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <button
                  className="w-full bg-[#39FF14] text-black font-display font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={saveEdit}
                >
                  <Check className="w-5 h-5" /> Salvar Alterações
                </button>

                <div className="flex gap-3">
                  <button
                    className="flex-1 glass-panel py-3 rounded-xl text-sm font-label text-on-surface hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    onClick={handleAddToList}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#00DCE5]" /> Adicionar à Lista
                  </button>
                  <button
                    className="flex-1 bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 py-3 rounded-xl text-sm font-label text-[#FF6B6B] hover:bg-[#FF6B6B]/20 transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      deleteEstoque(selectedId);
                      setSelectedId(null);
                      toast('Item removido do estoque', {
                        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Adição (Bottom Sheet) */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              className="fixed bottom-0 left-0 w-full bg-[rgba(20,25,35,0.92)] backdrop-blur-[32px] border-t border-white/10 rounded-t-3xl z-[70] p-6 pb-10 flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto -mt-1" />

              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-xl text-on-surface">Novo Item no Estoque</h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs text-on-surface-variant">Nome do Produto</label>
                  <input
                    className="glass-panel rounded-lg p-3 text-on-surface font-body text-base outline-none focus:border-[#00DCE5] transition-colors"
                    placeholder="Ex: Arroz, Detergente..."
                    value={newProduto}
                    onChange={(e) => setNewProduto(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs text-on-surface-variant">Qtd. Atual</label>
                    <input
                      className="glass-panel rounded-lg p-3 text-on-surface font-display font-semibold text-center outline-none"
                      value={newQtdAtual}
                      onChange={(e) => setNewQtdAtual(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs text-on-surface-variant">Qtd. Mínima</label>
                    <input
                      className="glass-panel rounded-lg p-3 text-on-surface font-display font-semibold text-center outline-none"
                      value={newQtdMin}
                      onChange={(e) => setNewQtdMin(e.target.value)}
                      inputMode="decimal"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-xs text-on-surface-variant">Unidade</label>
                    <select
                      value={newUnidade}
                      onChange={(e) => setNewUnidade(e.target.value as Unidade)}
                      className="glass-panel rounded-lg p-3 text-on-surface font-body text-sm outline-none bg-surface-container"
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u} className="bg-[#131318] text-white">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  className="w-full bg-[#39FF14] text-black font-display font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                  onClick={handleAddEstoque}
                >
                  <Plus className="w-5 h-5" /> Adicionar ao Estoque
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
