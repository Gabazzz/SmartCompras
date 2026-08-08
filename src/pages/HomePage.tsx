import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, Lightbulb, ShoppingCart, ChevronRight, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const staggerItem = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.05 } },
});

export default function HomePage() {
  const navigate = useNavigate();
  const {
    getComprasDoMes,
    getTotalMes,
    getPercMeta,
    getEssenciaisTotal,
    getNaoEssenciaisTotal,
    getInsight,
    meta,
    setMeta,
    estoque,
  } = useAppStore();

  const [editingMeta, setEditingMeta] = useState(false);
  const [metaInput, setMetaInput] = useState(String(meta.valor));

  const compras = getComprasDoMes();
  const total = getTotalMes();
  const perc = getPercMeta();
  const essenciais = getEssenciaisTotal();
  const naoEssenciais = getNaoEssenciaisTotal();
  const ultimas = compras.slice(0, 5);
  const insight = getInsight();

  const itensParaComprar = estoque.filter(
    (e) => (e.qtdMinima > 0 ? (e.qtdAtual / e.qtdMinima) * 100 : 100) <= 70
  );

  const saveMeta = () => {
    const v = parseFloat(metaInput.replace(',', '.'));
    if (!isNaN(v) && v > 0) setMeta(v);
    setEditingMeta(false);
  };

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden pb-32 pt-16" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="px-4 flex flex-col gap-5">

        {/* Greeting */}
        <section className="pt-4">
          <h2 className="font-display font-semibold text-2xl text-[#39FF14]">Olá, Smart User</h2>
          <p className="text-xs text-white/50 font-body mt-0.5">Visão geral do mês</p>
        </section>

        {/* Card: Gasto no Mês */}
        <section className="rounded-2xl p-4 flex flex-col gap-3 border border-white/10 bg-white/[0.03]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-label mb-1">Gasto no Mês</p>
              <div className="font-display font-bold text-4xl text-white tracking-tight leading-none">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            {editingMeta ? (
              <div className="flex items-center gap-2">
                <input
                  className="rounded-lg px-2 py-1 text-xs text-white w-20 outline-none text-right font-display bg-white/10 border border-white/20"
                  value={metaInput}
                  onChange={(e) => setMetaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveMeta()}
                  autoFocus
                />
                <button onClick={saveMeta} className="text-[#39FF14] p-1">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setMetaInput(String(meta.valor)); setEditingMeta(true); }}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-[#39FF14] font-semibold font-label">{perc.toFixed(0)}% Utilizado</span>
              <span className="text-xs text-white/40 font-label">
                Meta: {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(perc, 100)}%`,
                  background: '#39FF14',
                  boxShadow: '0 0 10px rgba(57,255,20,0.6)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Grid: Essenciais / Supérfluos */}
        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00F5FF]" style={{ boxShadow: '0 0 6px #00F5FF' }} />
              <span className="text-[10px] text-white/50 font-label uppercase tracking-wider">Essenciais</span>
            </div>
            <span className="font-display font-bold text-xl text-white">
              {essenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="rounded-2xl p-4 border border-white/10 bg-white/[0.03] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF3131]" style={{ boxShadow: '0 0 6px #FF3131' }} />
              <span className="text-[10px] text-white/50 font-label uppercase tracking-wider">Supérfluos</span>
            </div>
            <span className="font-display font-bold text-xl text-white">
              {naoEssenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </section>

        {/* Insight */}
        <section
          className="rounded-2xl p-4 flex gap-3 items-start border border-white/10 bg-white/[0.03]"
          style={{ borderLeft: '2px solid #00F5FF' }}
        >
          <Lightbulb className="w-5 h-5 text-[#00F5FF] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-semibold text-[#00F5FF] font-label mb-1">Insight Inteligente</h3>
            <p className="text-xs text-white/60 font-body leading-relaxed">{insight}</p>
          </div>
        </section>

        {/* Banner: Itens para Comprar */}
        <section
          onClick={() => navigate('/comprar')}
          className="rounded-2xl p-4 flex justify-between items-center cursor-pointer border border-[#39FF14]/20 bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(57,255,20,0.15)' }}>
              <ShoppingCart className="w-5 h-5 text-[#39FF14]" />
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-[#39FF14]">
                {itensParaComprar.length} {itensParaComprar.length === 1 ? 'item' : 'itens'} para comprar
              </p>
              <p className="text-[10px] text-white/40 font-label">Lista de compras</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </section>

        {/* Últimas Compras */}
        <section>
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-label mb-3">Últimas Compras</h3>

          {ultimas.length === 0 ? (
            <div className="rounded-2xl p-5 text-center text-xs text-white/40 border border-white/10 bg-white/[0.03]">
              Nenhuma compra registrada neste mês
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ultimas.map((compra, i) => (
                <motion.div
                  key={compra.id}
                  {...staggerItem(i)}
                  className="rounded-2xl p-3.5 flex justify-between items-center border border-white/8 bg-white/[0.03] cursor-pointer hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
                  onClick={() => navigate('/lista')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4 text-white/30" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-sm text-white">{compra.produto}</p>
                      <p className="text-[10px] text-white/40 font-label">
                        {format(parseISO(compra.data), 'dd MMM', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <span className="font-display font-semibold text-sm text-white">
                    {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
