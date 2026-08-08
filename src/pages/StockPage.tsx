import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, X, Check, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import type { Estoque, Unidade } from '../types';
import SwipeableListItem from '../components/ui/SwipeableListItem';

const UNIDADES: Unidade[] = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct'];

function getStatus(item: Estoque): 'critico' | 'baixo' | 'ok' {
  const perc = item.qtdMinima > 0 ? (item.qtdAtual / item.qtdMinima) * 100 : 100;
  if (perc <= 30) return 'critico';
  if (perc <= 70) return 'baixo';
  return 'ok';
}

function Section({
  title,
  items,
  type,
  onEdit,
  onDelete,
}: {
  title: string;
  items: Estoque[];
  type: 'critico' | 'baixo' | 'ok';
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  if (items.length === 0) return null;

  const dotColor = type === 'critico' ? '#FF3131' : type === 'baixo' ? '#FFD700' : '#39FF14';
  const percColor = type === 'critico' ? '#FF3131' : type === 'baixo' ? '#FFD700' : '#39FF14';
  const cardBorder = type === 'critico'
    ? 'border border-[#FF3131]/30 shadow-[0_0_10px_rgba(255,49,49,0.08)]'
    : 'border border-white/[0.08]';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }} />
        <h2 className="font-display font-semibold text-base text-white">{title}</h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const perc = item.qtdMinima > 0 ? Math.round((item.qtdAtual / item.qtdMinima) * 100) : 100;
          const clamped = Math.min(Math.max(perc, 0), 100);
          return (
            <SwipeableListItem
              key={item.id}
              itemTitle={item.produto}
              onDelete={() => onDelete(item.id, item.produto)}
              onEdit={() => onEdit(item.id)}
            >
              <div
                className={`rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/[0.04] active:scale-[0.98] transition-all bg-white/[0.03] ${cardBorder}`}
                onClick={() => onEdit(item.id)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-body font-semibold text-sm text-white">{item.produto}</span>
                  <span className="font-display text-sm font-bold" style={{ color: percColor }}>{perc}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${clamped}%`, background: percColor, boxShadow: `0 0 6px ${percColor}` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-label">
                  <span>Atual: {item.qtdAtual}{item.unidade}</span>
                  <span>Mín: {item.qtdMinima}{item.unidade}</span>
                </div>
              </div>
            </SwipeableListItem>
          );
        })}
      </div>
    </div>
  );
}

export default function StockPage() {
  const { estoque, addEstoque, updateEstoque, deleteEstoque, addCompra } = useAppStore();
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

  const handleDeleteItem = (id: string, name: string) => {
    deleteEstoque(id);
    toast.success(`${name} removido do estoque!`, {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
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
      mercado: '',
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
    <div className="h-full overflow-y-auto overflow-x-hidden pb-32 pt-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 flex flex-col gap-5">

        {/* Page Title */}
        <section className="pt-4 flex justify-between items-center">
          <h1 className="font-display font-bold text-3xl text-white">Estoque</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#39FF14] hover:bg-white/10 active:scale-95 transition-all"
            title="Novo Item"
          >
            <Plus className="w-5 h-5" />
          </button>
        </section>

        {/* Alerta Crítico */}
        {criticos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex items-center gap-3 border border-[#FF3131]/30 bg-[#FF3131]/[0.08]"
          >
            <AlertTriangle className="w-5 h-5 text-[#FF3131] shrink-0 animate-pulse" />
            <div>
              <p className="font-label font-bold text-sm text-[#FF3131]">
                {criticos.length} {criticos.length === 1 ? 'item em nível crítico!' : 'itens em nível crítico!'}
              </p>
              <p className="text-[10px] text-white/40 font-body">{criticos.map((c) => c.produto).join(', ')}</p>
            </div>
          </motion.div>
        )}

        {estoque.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">📦</span>
            <p className="text-white/40 text-sm">Estoque vazio</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Section title="Crítico" items={criticos} type="critico" onEdit={openEdit} onDelete={handleDeleteItem} />
            <Section title="Atenção" items={baixos} type="baixo" onEdit={openEdit} onDelete={handleDeleteItem} />
            <Section title="OK" items={oks} type="ok" onEdit={openEdit} onDelete={handleDeleteItem} />
          </div>
        )}

      </div>

      {/* Modal Edição */}
      <AnimatePresence>
        {selectedId && selected && (
          <motion.div
            className="fixed inset-0 bg-black/75 z-[70] backdrop-blur-sm flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              className="w-full max-w-[480px] rounded-t-3xl p-6 pb-10 flex flex-col gap-5 max-h-[85vh] overflow-y-auto z-[80]"
              style={{ background: '#0D0F14', borderTop: '1px solid rgba(255,255,255,0.12)' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-white/15 rounded-full mx-auto -mt-1" />
              <div className="flex justify-between items-center">
                <h3 className="font-display font-semibold text-xl text-white">{selected.produto}</h3>
                <button onClick={() => setSelectedId(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-label">Qtd. Atual</label>
                  <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <input className="bg-transparent font-display font-bold text-xl text-white w-full outline-none" value={editQtd} onChange={(e) => setEditQtd(e.target.value)} inputMode="decimal" />
                    <span className="text-xs text-white/40 font-label">{selected.unidade}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-white/40 font-label">Mínimo</label>
                  <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <input className="bg-transparent font-display font-bold text-xl text-white w-full outline-none" value={editMin} onChange={(e) => setEditMin(e.target.value)} inputMode="decimal" />
                    <span className="text-xs text-white/40 font-label">{selected.unidade}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  className="w-full py-4 rounded-xl text-black font-display font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ background: '#39FF14', boxShadow: '0 0 20px rgba(57,255,20,0.4)' }}
                  onClick={saveEdit}
                >
                  <Check className="w-5 h-5" /> Salvar Alterações
                </button>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 rounded-xl text-sm font-label text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    onClick={handleAddToList}
                  >
                    <ShoppingCart className="w-4 h-4 text-[#00F5FF]" /> Adicionar à Lista
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl text-sm font-label text-[#FF3131] hover:bg-[#FF3131]/10 transition-colors flex items-center justify-center gap-2"
                    style={{ background: 'rgba(255,49,49,0.06)', border: '1px solid rgba(255,49,49,0.2)' }}
                    onClick={() => {
                      deleteEstoque(selectedId);
                      setSelectedId(null);
                      toast('Item removido', { style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' } });
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

      {/* Modal Adicionar */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-[70] backdrop-blur-md flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              className="w-full max-w-[480px] rounded-t-[32px] p-6 pb-10 flex flex-col gap-6 max-h-[85vh] overflow-y-auto z-[80]"
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
                    <Plus className="w-4.5 h-4.5 text-[#39FF14]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-white leading-tight">Novo Item no Estoque</h3>
                    <p className="text-[11px] text-white/40 font-body">Cadastre um produto pra monitorar</p>
                  </div>
                </div>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">Nome do Produto</label>
                  <input
                    className="w-full rounded-2xl px-4 py-4 text-white font-body text-base outline-none bg-white/[0.04] border border-white/10 focus:border-[#39FF14] focus:bg-white/[0.06] transition-all placeholder:text-white/25"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
                    placeholder="Ex: Arroz, Detergente..."
                    value={newProduto}
                    onChange={(e) => setNewProduto(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Qtd. Atual', value: newQtdAtual, set: setNewQtdAtual },
                    { label: 'Qtd. Mínima', value: newQtdMin, set: setNewQtdMin },
                  ].map(({ label, value, set }) => (
                    <div key={label} className="flex flex-col gap-2">
                      <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">{label}</label>
                      <input
                        className="w-full rounded-2xl p-3 text-white font-display font-semibold text-center outline-none bg-white/[0.04] border border-white/10 focus:border-[#39FF14] focus:bg-white/[0.06] transition-all"
                        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        inputMode="decimal"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-white/40 uppercase tracking-widest font-label">Unidade</label>
                    <select
                      value={newUnidade}
                      onChange={(e) => setNewUnidade(e.target.value as Unidade)}
                      className="w-full rounded-2xl p-3 text-white font-body text-sm outline-none bg-white/[0.04] border border-white/10 focus:border-[#39FF14] transition-all"
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u} style={{ background: '#131318' }}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  className="w-full py-4 rounded-2xl text-black font-display font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4dff2b 0%, #2ecc11 100%)',
                    boxShadow: '0 8px 30px rgba(57,255,20,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                  }}
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
