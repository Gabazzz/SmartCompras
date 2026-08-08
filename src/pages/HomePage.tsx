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

  // Contagem de itens para comprar (estoque baixo)
  const itensParaComprar = estoque.filter(
    (e) => (e.qtdMinima > 0 ? (e.qtdAtual / e.qtdMinima) * 100 : 100) <= 70
  );

  const saveMeta = () => {
    const v = parseFloat(metaInput.replace(',', '.'));
    if (!isNaN(v) && v > 0) setMeta(v);
    setEditingMeta(false);
  };

  return (
    <div className="scroll-area h-full pt-20 pb-28 px-6 flex flex-col gap-6">
      {/* Greeting Section */}
      <section>
        <h2 className="font-display font-semibold text-xl text-[#39FF14] tracking-tight">
          Olá, Smart User
        </h2>
        <p className="text-xs text-on-surface-variant font-body mt-0.5">Visão geral do mês</p>
      </section>

      {/* Card 1: Gasto no Mês (Hero) */}
      <section className="glass-panel rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
              Gasto no Mês
            </p>
            <div className="font-display font-bold text-3xl text-on-surface mt-1">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>

          {editingMeta ? (
            <div className="flex items-center gap-2">
              <input
                className="glass-panel rounded px-2 py-1 text-xs text-white w-20 outline-none text-right font-display"
                value={metaInput}
                onChange={(e) => setMetaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveMeta()}
                autoFocus
              />
              <button
                onClick={saveMeta}
                className="text-[#39FF14] hover:opacity-80 p-1"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMetaInput(String(meta.valor));
                setEditingMeta(true);
              }}
              className="flex items-center justify-center p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-on-surface-variant"
              title="Editar Meta"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-label text-xs">
            <span className="text-[#39FF14] font-semibold">{perc.toFixed(0)}% Utilizado</span>
            <span className="text-on-surface-variant">
              Meta: {meta.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="h-2 w-full bg-[#1A1A1F] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.6)] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(perc, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Grid: Essenciais vs Supérfluos */}
      <section className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F5FF] shadow-[0_0_6px_#00F5FF]" />
            <span className="font-label text-xs text-on-surface-variant">Essenciais</span>
          </div>
          <span className="font-display font-semibold text-lg text-on-surface mt-1">
            {essenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="glass-panel rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF3131] shadow-[0_0_6px_#FF3131]" />
            <span className="font-label text-xs text-on-surface-variant">Supérfluos</span>
          </div>
          <span className="font-display font-semibold text-lg text-on-surface mt-1">
            {naoEssenciais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </section>

      {/* Insight Inteligente */}
      <section className="glass-panel rounded-xl p-4 flex gap-3 items-start border-l-2 border-l-[#00F5FF] bg-gradient-to-r from-[#00F5FF]/10 to-transparent">
        <Lightbulb className="w-5 h-5 text-[#00F5FF] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <h3 className="font-label font-semibold text-xs text-[#00F5FF]">Insight Inteligente</h3>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">{insight}</p>
        </div>
      </section>

      {/* Shortcut Banner -> /comprar */}
      <section
        onClick={() => navigate('/comprar')}
        className="glass-panel rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-all border border-[#39FF14]/20 hover:border-[#39FF14]/40"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#39FF14]/20 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <h3 className="font-body font-medium text-sm text-[#39FF14]">
              {itensParaComprar.length} itens para comprar
            </h3>
            <p className="font-label text-xs text-on-surface-variant">Lista de compras</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-on-surface-variant" />
      </section>

      {/* Últimas Compras List */}
      <section className="flex flex-col gap-3">
        <h3 className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
          Últimas Compras
        </h3>

        {ultimas.length === 0 ? (
          <div className="glass-panel rounded-xl p-4 text-center text-xs text-on-surface-variant">
            Nenhuma compra registrada neste mês
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ultimas.map((compra, i) => (
              <motion.div
                key={compra.id}
                {...staggerItem(i)}
                className="glass-panel rounded-xl p-3 flex justify-between items-center border border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => navigate('/lista')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-on-surface-variant" />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-body font-medium text-sm text-on-surface">{compra.produto}</p>
                    <p className="font-label text-[10px] text-on-surface-variant">
                      {format(parseISO(compra.data), 'dd MMM', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <span className="font-body font-semibold text-sm text-on-surface">
                  {compra.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
