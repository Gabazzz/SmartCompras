import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Trash2, Store, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria } from '../types';

const CATS: (Categoria | 'Todos')[] = [
  'Todos', 'Alimentação', 'Hortifruti', 'Laticínios', 'Carnes',
  'Limpeza', 'Higiene', 'Farmácia', 'Não Essencial', 'Outros',
];

export default function ListPage() {
  const { compras, deleteCompra, meta } = useAppStore();
  const [mesFoco, setMesFoco] = useState(new Date());
  const [catFiltro, setCatFiltro] = useState<Categoria | 'Todos'>('Todos');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const doMes = useMemo(
    () => compras.filter((c) => isSameMonth(parseISO(c.data), mesFoco)),
    [compras, mesFoco]
  );

  const filtradas = useMemo(() => {
    let res = catFiltro === 'Todos' ? doMes : doMes.filter((c) => c.categoria === catFiltro);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((c) => c.produto.toLowerCase().includes(q) || c.mercado.toLowerCase().includes(q));
    }
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

  const handleDelete = (id: string, produto: string) => {
    deleteCompra(id);
    toast.success(`${produto} removido!`, {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
  };

  const labelData = (dataStr: string) => {
    const d = parseISO(dataStr);
    const today = new Date();
    if (isSameMonth(d, today) && d.getDate() === today.getDate()) return 'Hoje';
    if (isSameMonth(d, today) && d.getDate() === today.getDate() - 1)
      return 'Ontem, ' + format(d, "dd 'de' MMMM", { locale: ptBR });
    return format(d, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-32 pt-6" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 flex flex-col gap-4">

        {/* Page Title */}
        <section className="pt-4">
          <h1 className="font-display font-bold text-3xl text-white">Histórico</h1>
          <p className="text-xs text-white/40 font-body mt-0.5">
            {doMes.length} compras · {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </section>

        {/* Gasto Mensal Progress */}
        <section className="rounded-2xl p-4 border border-white/[0.08] bg-white/[0.03] flex flex-col gap-2.5">
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-label">Gasto Mensal</span>
            <div className="flex items-baseline gap-1 font-display">
              <span className="text-base font-bold text-white">
                {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-xs text-white/40">
                / {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(percMeta, 100)}%`,
                background: '#39FF14',
                boxShadow: '0 0 8px rgba(57,255,20,0.6)',
              }}
            />
          </div>
        </section>

        {/* Month Selector */}
        <div className="rounded-2xl py-3 px-4 flex items-center justify-between border border-white/[0.08] bg-white/[0.03]">
          <button
            onClick={() => setMesFoco((m) => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:bg-white/10 active:scale-90 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-semibold text-[#39FF14] text-base capitalize">
            {format(mesFoco, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setMesFoco((m) => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:bg-white/10 active:scale-90 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Toggle */}
        <button
          onClick={() => setSearchOpen((s) => !s)}
          className="w-full h-11 flex items-center gap-2 px-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/40 text-sm font-label hover:bg-white/[0.06] transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>{search || 'Buscar compras ou produtos...'}</span>
        </button>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  className="w-full rounded-2xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-colors font-body"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,245,255,0.3)' }}
                  placeholder="Buscar compras ou produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Chips — scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {CATS.map((cat) => {
            const active = catFiltro === cat;
            return (
              <button
                key={cat}
                onClick={() => setCatFiltro(cat as Categoria | 'Todos')}
                className="shrink-0 h-9 px-3.5 rounded-full text-xs flex items-center gap-1.5 transition-all font-label whitespace-nowrap"
                style={active ? {
                  border: '1px solid rgba(57,255,20,0.5)',
                  background: 'rgba(57,255,20,0.1)',
                  color: '#39FF14',
                  boxShadow: '0 0 10px rgba(57,255,20,0.15)',
                } : {
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {active && <Check className="w-3 h-3" />}
                {cat !== 'Todos' && <span>{CATEGORIA_EMOJI[cat as Categoria]}</span>}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Purchase List Grouped by Date */}
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">🛒</span>
            <p className="text-white/40 text-sm">Nenhuma compra registrada neste mês</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 pb-4">
            {grouped.map(([dateStr, items]) => (
              <div key={dateStr} className="flex flex-col gap-2">
                <h3 className="text-[10px] text-white/40 font-label uppercase tracking-widest pl-1 capitalize">
                  {labelData(dateStr)}
                </h3>

                <div className="flex flex-col gap-2">
                  {items.map((compra, idx) => {
                    const expanded = expandedId === compra.id;
                    return (
                      <motion.div
                        key={compra.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                      >
                        {expanded ? (
                          <div
                            className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(57,255,20,0.2)',
                              boxShadow: '0 0 10px rgba(57,255,20,0.05)',
                            }}
                          >
                            <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl" style={{ background: '#39FF14' }} />

                            <div className="flex justify-between items-start pl-3 cursor-pointer" onClick={() => setExpandedId(null)}>
                              <div className="flex flex-col gap-0.5">
                                <h4 className="font-display font-semibold text-base text-white">{compra.produto}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-white/40 font-label">
                                  <Store className="w-3 h-3" />
                                  <span>{compra.mercado}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-base text-[#39FF14]">
                                  {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <ChevronUp className="w-4 h-4 text-white/30" />
                              </div>
                            </div>

                            <div
                              className="mt-1 pt-3 flex justify-between items-center -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl"
                              style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div className="flex gap-4">
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-white/30 uppercase font-label">Qtd</span>
                                  <span className="text-xs text-white font-body">{compra.quantidade} {compra.unidade}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-white/30 uppercase font-label">Valor Unit.</span>
                                  <span className="text-xs text-white font-body">
                                    {compra.valorUni.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2.5 py-0.5 rounded text-[9px] font-label uppercase tracking-wider"
                                  style={compra.essencial ? {
                                    background: 'rgba(57,255,20,0.08)',
                                    color: '#39FF14',
                                    border: '1px solid rgba(57,255,20,0.2)',
                                  } : {
                                    background: 'rgba(255,49,49,0.08)',
                                    color: '#FF3131',
                                    border: '1px solid rgba(255,49,49,0.2)',
                                  }}
                                >
                                  {compra.essencial ? 'Essencial' : 'Supérfluo'}
                                </span>
                                <button
                                  className="p-1.5 rounded-lg transition-colors text-[#FF3131] hover:bg-[#FF3131]/10"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(compra.id, compra.produto); }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.04] active:scale-[0.98] transition-all"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            onClick={() => setExpandedId(compra.id)}
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className="font-body font-medium text-sm text-white">{compra.produto}</h4>
                              <div className="flex items-center gap-2 text-xs text-white/40 font-label">
                                <Store className="w-3 h-3" />
                                <span>{compra.mercado}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span style={{ color: compra.essencial ? '#39FF14' : '#FF3131' }}>
                                  {compra.essencial ? 'Essencial' : 'Supérfluo'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-sm text-white">
                                {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                              <ChevronDown className="w-4 h-4 text-white/30" />
                            </div>
                          </div>
                        )}
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
