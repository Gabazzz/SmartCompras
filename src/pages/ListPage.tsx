import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Trash2, Store, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria } from '../types';

const CATS: (Categoria | 'Todos')[] = [
  'Todos',
  'Alimentação',
  'Hortifruti',
  'Laticínios',
  'Carnes',
  'Limpeza',
  'Higiene',
  'Farmácia',
  'Não Essencial',
  'Outros',
];

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

  const doMes = useMemo(
    () => compras.filter((c) => isSameMonth(parseISO(c.data), mesFoco)),
    [compras, mesFoco]
  );

  const filtradas = useMemo(() => {
    let res = catFiltro === 'Todos' ? doMes : doMes.filter((c) => c.categoria === catFiltro);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (c) => c.produto.toLowerCase().includes(q) || c.mercado.toLowerCase().includes(q)
      );
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
    if (isSameMonth(d, today) && d.getDate() === today.getDate() - 1) return 'Ontem, ' + format(d, "dd 'de' MMMM", { locale: ptBR });
    return format(d, "dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="scroll-area h-full pb-28">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface">Histórico</h1>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            {doMes.length} compras · Total: {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <button
          className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-white active:scale-95 transition-all"
          onClick={() => setSearchOpen((s) => !s)}
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 flex flex-col gap-5">
        {/* Monthly Spending Progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="font-label text-xs text-on-surface-variant">Gasto Mensal</span>
            <div className="flex items-baseline gap-1 font-display">
              <span className="text-base font-semibold text-on-surface">
                {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-xs text-on-surface-variant">
                / {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-[#1A1A1F] overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full bg-[#39FF14] shadow-[0_0_8px_#39FF14] rounded-full transition-all duration-700"
              style={{ width: `${Math.min(percMeta, 100)}%` }}
            />
          </div>
        </div>

        {/* Month Selector */}
        <div className="glass-panel rounded-xl py-3 px-4 flex items-center justify-between">
          <button
            onClick={() => setMesFoco((m) => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-on-surface hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-semibold text-[#00DCE5] text-base capitalize">
            {format(mesFoco, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setMesFoco((m) => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-on-surface hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  className="w-full glass-panel rounded-xl py-3 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-[#00DCE5] transition-colors bg-transparent font-body text-sm"
                  placeholder="Buscar compras ou produtos..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto scroll-x gap-2 pb-1 snap-x">
          {CATS.map((cat) => {
            const active = catFiltro === cat;
            return (
              <button
                key={cat}
                onClick={() => setCatFiltro(cat as Categoria | 'Todos')}
                className={`snap-start shrink-0 h-9 px-4 rounded-full font-label text-xs flex items-center gap-1.5 transition-all ${
                  active
                    ? 'border border-[#39FF14] bg-[#39FF14]/20 text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                    : 'border border-white/10 glass-panel text-on-surface-variant hover:bg-white/5'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                {cat !== 'Todos' && <span>{CATEGORIA_EMOJI[cat as Categoria]}</span>}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* History List Grouped by Date */}
        {grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <span className="text-4xl">🛒</span>
            <p className="text-on-surface-variant text-sm font-body">Nenhuma compra registrada neste mês</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(([dateStr, items]) => (
              <div key={dateStr} className="flex flex-col gap-2">
                <h3 className="font-label text-xs text-on-surface-variant pl-1 capitalize">
                  {labelData(dateStr)}
                </h3>

                <div className="flex flex-col gap-3">
                  {items.map((compra, idx) => {
                    const expanded = expandedId === compra.id;
                    return (
                      <motion.div key={compra.id} {...staggerItem(idx)}>
                        {expanded ? (
                          /* Expanded Card */
                          <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden border border-[#39FF14]/40 shadow-[0_0_10px_rgba(57,255,20,0.08)]">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#39FF14]" />

                            <div
                              className="flex justify-between items-start pl-2 cursor-pointer"
                              onClick={() => setExpandedId(null)}
                            >
                              <div className="flex flex-col gap-1">
                                <h4 className="font-display font-semibold text-base text-on-surface">
                                  {compra.produto}
                                </h4>
                                <div className="flex items-center gap-1.5 font-label text-xs text-on-surface-variant">
                                  <Store className="w-3.5 h-3.5 text-on-surface-variant" />
                                  <span>{compra.mercado}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-display font-bold text-lg text-[#39FF14]">
                                  {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                                <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                              </div>
                            </div>

                            {/* Details Zone */}
                            <div className="mt-1 pt-3 border-t border-white/10 flex justify-between items-center bg-white/[0.02] -mx-4 -mb-4 px-4 pb-3 pt-3 rounded-b-xl">
                              <div className="flex gap-4">
                                <div className="flex flex-col">
                                  <span className="font-label text-[10px] text-on-surface-variant uppercase">Qtd</span>
                                  <span className="font-body text-xs text-on-surface">
                                    {compra.quantidade} {compra.unidade}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-label text-[10px] text-on-surface-variant uppercase">Valor Unit.</span>
                                  <span className="font-body text-xs text-on-surface">
                                    {compra.valorUni.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-wider ${
                                    compra.essencial
                                      ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30'
                                      : 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/30'
                                  }`}
                                >
                                  {compra.essencial ? 'Essencial' : 'Supérfluo'}
                                </span>

                                <button
                                  className="text-[#FF6B6B] p-1.5 rounded-lg hover:bg-[#FF6B6B]/10 transition-colors"
                                  title="Excluir"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(compra.id, compra.produto);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Collapsed Card */
                          <div
                            className="glass-panel rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedId(compra.id)}
                          >
                            <div className="flex flex-col gap-1">
                              <h4 className="font-body font-medium text-sm text-on-surface">
                                {compra.produto}
                              </h4>
                              <div className="flex items-center gap-2 font-label text-xs text-on-surface-variant">
                                <div className="flex items-center gap-1">
                                  <Store className="w-3.5 h-3.5" />
                                  <span>{compra.mercado}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className={compra.essencial ? 'text-[#39FF14]' : 'text-[#FF6B6B]'}>
                                  {compra.essencial ? 'Essencial' : 'Supérfluo'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-display font-semibold text-base text-on-surface">
                                {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                              <ChevronDown className="w-4 h-4 text-on-surface-variant" />
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
