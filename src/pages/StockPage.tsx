import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, ShoppingCart, X, Check, Trash2 } from 'lucide-react';
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

const statusColor = { critico: 'red', baixo: 'yellow', ok: 'green' };

const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: i * 0.04 } },
});

function Section({ title, items, onEdit }: { title: string; items: Estoque[]; onEdit: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <span className="section-label" style={{ marginBottom: 8, display: 'block' }}>{title}</span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => {
          const st = getStatus(item);
          return (
            <motion.button key={item.id} {...staggerItem(i)} className="list-item" onClick={() => onEdit(item.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <span className={`dot ${statusColor[st]}`} />
                <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)' }}>{item.produto}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.qtdAtual}</span> / {item.qtdMinima} {item.unidade}
              </div>
            </motion.button>
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
  const baixos   = estoque.filter((e) => getStatus(e) === 'baixo');
  const oks      = estoque.filter((e) => getStatus(e) === 'ok');

  const openEdit = (id: string) => {
    const item = estoque.find((e) => e.id === id);
    if (item) { setEditQtd(String(item.qtdAtual)); setEditMin(String(item.qtdMinima)); setSelectedId(id); }
  };

  const saveEdit = () => {
    if (!selectedId) return;
    const qtd = parseFloat(editQtd);
    const min = parseFloat(editMin);
    if (!isNaN(qtd) && !isNaN(min)) {
      updateEstoque(selectedId, { qtdAtual: qtd, qtdMinima: min });
      toast.success('Atualizado', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } });
    }
    setSelectedId(null);
  };

  const handleAddToList = () => {
    if (!selected) return;
    addCompra({ produto: selected.produto, categoria: 'Outros', essencial: true, quantidade: Math.max(1, selected.qtdMinima - selected.qtdAtual), unidade: selected.unidade, valorUni: 0, valorTotal: 0, mercado: mercados[0] || 'Mercado A', data: new Date().toISOString() });
    toast.success(`${selected.produto} adicionado à lista`, { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } });
    setSelectedId(null);
  };

  const handleAddEstoque = () => {
    if (!newProduto.trim()) return;
    addEstoque({ produto: newProduto.trim(), qtdAtual: parseFloat(newQtdAtual) || 1, qtdMinima: parseFloat(newQtdMin) || 2, unidade: newUnidade });
    setNewProduto(''); setNewQtdAtual('1'); setNewQtdMin('2');
    setShowAdd(false);
    toast.success('Adicionado ao estoque', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } });
  };

  return (
    <div className="scroll-area" style={{ height: '100%', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: 'var(--text-primary)' }}>Estoque</h1>
        </div>
        <button className="btn-ghost" style={{ padding: 8, borderRadius: 12, width: 36, height: 36 }} onClick={() => setShowAdd(true)}>
          <Plus size={20} />
        </button>
      </div>

      <div style={{ padding: '0 24px' }}>
        {/* Critical Alert Banner Minimal */}
        {criticos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '16px', marginBottom: 32, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 8 }}><span className="dot red" /></div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--neon-red)' }}>{criticos.length} {criticos.length === 1 ? 'item' : 'itens'} precisando de reposição</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{criticos.map((c) => c.produto).join(', ')}</div>
              </div>
            </div>
          </motion.div>
        )}

        {estoque.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <span style={{ fontSize: 32 }}>📦</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Estoque vazio</p>
          </div>
        ) : (
          <>
            <Section title="CRÍTICO" items={criticos} onEdit={openEdit} />
            <Section title="ATENÇÃO" items={baixos} onEdit={openEdit} />
            <Section title="OK" items={oks} onEdit={openEdit} />
          </>
        )}
      </div>

      {/* Edit Sheet Premium */}
      <AnimatePresence>
        {selectedId && selected && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)}>
            <motion.div className="modal-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: 'var(--text-primary)' }}>{selected.produto}</h2>
                <button onClick={() => setSelectedId(null)} className="btn-ghost" style={{ padding: 4, width: 32, height: 32 }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Quantidade atual</label>
                    <input className="input" value={editQtd} onChange={(e) => setEditQtd(e.target.value)} inputMode="decimal" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Mínimo seguro</label>
                    <input className="input" value={editMin} onChange={(e) => setEditMin(e.target.value)} inputMode="decimal" />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  <button className="btn-primary" onClick={saveEdit}>
                    <Check size={18} /> Salvar
                  </button>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn-ghost" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-card)' }} onClick={handleAddToList}>
                      <ShoppingCart size={16} /> Lista
                    </button>
                    <button className="btn-ghost" style={{ flex: 1, color: 'var(--neon-red)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }} onClick={() => { deleteEstoque(selectedId); setSelectedId(null); toast('Removido', { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } }); }}>
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Sheet Premium */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="modal-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 20, color: 'var(--text-primary)' }}>Novo item</h2>
                <button onClick={() => setShowAdd(false)} className="btn-ghost" style={{ padding: 4, width: 32, height: 32 }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Produto</label>
                  <input className="input" placeholder="O que deseja monitorar?" value={newProduto} onChange={(e) => setNewProduto(e.target.value)} autoFocus />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Atual</label>
                    <input className="input" value={newQtdAtual} onChange={(e) => setNewQtdAtual(e.target.value)} inputMode="decimal" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Mínimo</label>
                    <input className="input" value={newQtdMin} onChange={(e) => setNewQtdMin(e.target.value)} inputMode="decimal" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Unidade</label>
                    <select value={newUnidade} onChange={(e) => setNewUnidade(e.target.value as Unidade)} className="input" style={{ color: 'var(--text-primary)' }}>
                      {UNIDADES.map((u) => <option key={u} value={u} style={{ background: 'var(--bg-surface)' }}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-primary" onClick={handleAddEstoque} style={{ marginTop: 8 }}>
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
