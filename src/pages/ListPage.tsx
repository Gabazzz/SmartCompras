import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria } from '../types';

const CATS: (Categoria | 'Todos')[] = ['Todos', 'Alimentação', 'Hortifruti', 'Laticínios', 'Carnes', 'Limpeza', 'Higiene', 'Farmácia', 'Não Essencial', 'Outros'];

const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, delay: i * 0.04 } },
});

export default function ListPage() {
  const { compras, deleteCompra, meta } = useAppStore();
  const [mesFoco, setMesFoco] = useState(new Date());
  const [catFiltro, setCatFiltro] = useState<Categoria | 'Todos'>('Todos');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const doMes = useMemo(() => compras.filter((c) => isSameMonth(parseISO(c.data), mesFoco)), [compras, mesFoco]);

  const filtradas = useMemo(() => {
    let res = catFiltro === 'Todos' ? doMes : doMes.filter((c) => c.categoria === catFiltro);
    if (search) res = res.filter((c) => c.produto.toLowerCase().includes(search.toLowerCase()));
    return res;
  }, [doMes, catFiltro, search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtradas> = {};
    filtradas.forEach((c) => {
      const key = c.data.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtradas]);

  const totalMes = doMes.reduce((a, c) => a + c.valorTotal, 0);
  const percMeta = meta.valor > 0 ? (totalMes / meta.valor) * 100 : 0;
  const barClass = percMeta >= 100 ? 'red' : percMeta >= 80 ? 'yellow' : 'green';

  const handleDelete = (id: string, produto: string) => {
    deleteCompra(id);
    toast.success(`${produto} removido`, { style: { background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-card)' } });
  };

  const labelData = (dataStr: string) => {
    const d = parseISO(dataStr);
    const today = new Date();
    if (isSameMonth(d, today) && d.getDate() === today.getDate()) return 'HOJE';
    if (isSameMonth(d, today) && d.getDate() === today.getDate() - 1) return 'ONTEM';
    return format(d, "dd 'de' MMMM", { locale: ptBR }).toUpperCase();
  };

  return (
    <div className="scroll-area" style={{ height: '100%', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: 'var(--text-primary)' }}>
            Compras
          </h1>
          <button className="btn-ghost" style={{ padding: 8, borderRadius: 12, width: 36, height: 36 }} onClick={() => setSearchOpen((s) => !s)}>
            <Search size={18} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {doMes.length} itens · {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </div>

      {/* Progress minimal */}
      {totalMes > 0 && (
        <div style={{ padding: '0 24px 24px' }}>
          <div className="progress-track">
            <div className={`progress-fill ${barClass}`} style={{ width: `${Math.min(percMeta, 100)}%` }} />
          </div>
        </div>
      )}

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ padding: '0 24px 16px', overflow: 'hidden' }}>
            <input className="input" style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '10px 16px', border: '1px solid var(--border-card)' }} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigator & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px 16px' }}>
        <button onClick={() => setMesFoco((m) => subMonths(m, 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          {format(mesFoco, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button onClick={() => setMesFoco((m) => addMonths(m, 1))} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="scroll-x" style={{ display: 'flex', gap: 8, padding: '0 24px 24px' }}>
        {CATS.map((cat) => (
          <button key={cat} className={`chip ${catFiltro === cat ? 'active' : ''}`} onClick={() => setCatFiltro(cat as Categoria | 'Todos')}>
            {cat !== 'Todos' ? CATEGORIA_EMOJI[cat as Categoria] + ' ' : ''}{cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '0 24px' }}>
        {grouped.length === 0 ? (
          <div className="empty-state" style={{ paddingTop: 40 }}>
            <span style={{ fontSize: 32 }}>🛒</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Nenhuma compra</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {grouped.map(([dateStr, items]) => (
              <div key={dateStr}>
                <span className="section-label" style={{ marginBottom: 8, display: 'block' }}>{labelData(dateStr)}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {items.map((compra, idx) => {
                    const expanded = expandedId === compra.id;
                    return (
                      <motion.div key={compra.id} {...staggerItem(idx)}>
                        <button className="list-item" onClick={() => setExpandedId(expanded ? null : compra.id)}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 14 }}>
                            {CATEGORIA_EMOJI[compra.categoria]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{compra.produto}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{compra.mercado}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                              {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <span style={{ fontSize: 10, color: compra.essencial ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                              {compra.essencial ? 'Essen.' : 'Supérfluo'}
                            </span>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                              <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                                  <div>Qtd: <span style={{ color: 'var(--text-primary)' }}>{compra.quantidade} {compra.unidade}</span></div>
                                  <div>Unitário: <span style={{ color: 'var(--text-primary)' }}>{compra.valorUni.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                                </div>
                                <button className="btn-ghost" style={{ color: 'var(--neon-red)', padding: '6px 10px', fontSize: 12 }} onClick={() => handleDelete(compra.id, compra.produto)}>
                                  <Trash2 size={14} style={{ marginRight: 4 }} /> Excluir
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
