import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Delete, ArrowRight, Store, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/useAppStore';
import { CATEGORIA_EMOJI, type Categoria, type Unidade } from '../types';

const CATEGORIAS: Categoria[] = [
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
const UNIDADES: Unidade[] = ['un', 'kg', 'g', 'L', 'mL', 'cx', 'pct'];

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const { addCompra, compras, mercados } = useAppStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [produto, setProduto] = useState('');
  const [mercado, setMercado] = useState('');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [essencial, setEssencial] = useState(true);

  const [valorStr, setValorStr] = useState('0');
  const [qtd, setQtd] = useState('1');
  const [unidade, setUnidade] = useState<Unidade>('un');

  const prodInputRef = useRef<HTMLInputElement>(null);

  // Suggestions
  const prodSugs = Array.from(
    new Set(compras.filter((c) => c.produto.toLowerCase().includes(produto.toLowerCase())).map((c) => c.produto))
  ).slice(0, 3);
  const mercSugs = Array.from(
    new Set(mercados.filter((m) => m.toLowerCase().includes(mercado.toLowerCase())))
  ).slice(0, 3);

  useEffect(() => {
    if (step === 1) setTimeout(() => prodInputRef.current?.focus(), 100);
  }, [step]);

  const selectProd = (p: string) => {
    setProduto(p);
    const last = compras.find((c) => c.produto === p);
    if (last) {
      setCategoria(last.categoria);
      setEssencial(last.essencial);
      setUnidade(last.unidade);
      setMercado(last.mercado);
    }
  };

  const handleNumpad = (val: string) => {
    if (val === 'back') {
      setValorStr((s) => (s.length > 1 ? s.slice(0, -1) : '0'));
    } else if (val === ',') {
      // ignore comma for integer cent calculation or support decimal string
      return;
    } else {
      setValorStr((s) => (s === '0' ? val : s + val));
    }
  };

  const valFinal = parseInt(valorStr, 10) / 100;
  const displayValor = valFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const valUnitario = (valFinal / (parseFloat(qtd) || 1)).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleSave = () => {
    if (!produto || !categoria || !mercado) {
      toast.error('Preencha os campos obrigatórios', {
        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
      });
      return;
    }
    if (valFinal <= 0) {
      toast.error('O valor deve ser maior que zero', {
        style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
      });
      return;
    }

    addCompra({
      produto,
      categoria,
      essencial,
      mercado,
      quantidade: parseFloat(qtd) || 1,
      unidade,
      valorUni: valFinal / (parseFloat(qtd) || 1),
      valorTotal: valFinal,
      data: new Date().toISOString(),
    });

    toast.success('Compra registrada!', {
      style: { background: '#131318', color: '#e4e1e9', border: '1px solid rgba(255,255,255,0.1)' },
    });
    navigate(-1);
  };

  return (
    <div className="h-full flex flex-col bg-[#06080D] relative overflow-hidden">
      {/* Header Wizard */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 z-50">
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-on-surface-variant"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              step === 1 ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]' : 'bg-white/20'
            }`}
          />
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              step === 2 ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]' : 'bg-white/20'
            }`}
          />
        </div>

        <div className="w-9" />
      </header>

      {/* Main Form Canvas */}
      <div className="flex-1 scroll-area px-6 pt-4 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6 flex-1"
            >
              {/* Product Name Giant Input */}
              <div className="flex flex-col mt-4">
                <input
                  ref={prodInputRef}
                  className="w-full bg-transparent border-b border-white/20 focus:border-[#39FF14] outline-none py-2 font-display text-3xl font-bold text-on-surface placeholder:text-on-surface-variant/40 transition-colors"
                  placeholder="Nome do Produto"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                  autoComplete="off"
                />
                {produto && prodSugs.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {prodSugs.map((s) => (
                      <button
                        key={s}
                        className="px-3 py-1 rounded-full border border-white/10 glass-panel text-xs text-on-surface-variant hover:bg-white/10 transition-colors font-label"
                        onClick={() => selectProd(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Market Field */}
              <div className="flex flex-col gap-2">
                <label className="font-label text-xs text-on-surface-variant">Mercado</label>
                <div className="relative w-full h-12 flex items-center glass-panel rounded-lg border border-white/10 focus-within:border-[#00DCE5] focus-within:shadow-[0_0_12px_rgba(99,247,255,0.3)] transition-all">
                  <Store className="w-5 h-5 text-on-surface-variant ml-3 shrink-0" />
                  <input
                    className="w-full bg-transparent border-none outline-none text-on-surface font-body text-sm pl-2 pr-4 h-full"
                    placeholder="Ex: Carrefour, Atacadão..."
                    value={mercado}
                    onChange={(e) => setMercado(e.target.value)}
                  />
                </div>
                {mercado && mercSugs.length > 0 && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {mercSugs.map((s) => (
                      <button
                        key={s}
                        className="px-3 py-1 rounded-full border border-white/10 glass-panel text-xs text-on-surface-variant hover:bg-white/10 transition-colors font-label"
                        onClick={() => setMercado(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Chips */}
              <div className="flex flex-col gap-2.5">
                <label className="font-label text-xs text-on-surface-variant">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((cat) => {
                    const active = categoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoria(cat)}
                        className={`flex items-center gap-1.5 px-4 h-9 rounded-full font-label text-xs transition-all ${
                          active
                            ? 'border border-[#39FF14] bg-[#39FF14]/20 text-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                            : 'border border-white/10 glass-panel text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        <span>{CATEGORIA_EMOJI[cat]}</span>
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Essential Item Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl glass-panel border border-white/5 mt-auto mb-2">
                <div className="flex flex-col">
                  <span className="font-display font-semibold text-sm text-on-surface">Item Essencial?</span>
                  <span className="font-label text-xs text-on-surface-variant">Avisar se faltar no estoque</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEssencial((prev) => !prev)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 border ${
                    essencial
                      ? 'bg-[#39FF14]/20 border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform duration-300 ${
                      essencial
                        ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14] translate-x-6'
                        : 'bg-on-surface-variant translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Continuar Button */}
              <button
                className={`w-full h-12 rounded-lg glass-panel text-on-surface font-display font-semibold border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors active:scale-95 ${
                  !produto || !categoria || !mercado ? 'opacity-50 pointer-events-none' : ''
                }`}
                onClick={() => setStep(2)}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full flex-1"
            >
              {/* Context Header */}
              <div className="flex justify-between items-center glass-panel p-3 rounded-lg border border-white/5">
                <div className="flex flex-col">
                  <span className="font-label text-xs text-on-surface-variant">Produto</span>
                  <span className="font-display font-semibold text-sm text-on-surface truncate max-w-[200px]">
                    {produto || 'Produto sem nome'}
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-[#00DCE5] text-xs flex items-center gap-1 font-label hover:underline"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              </div>

              {/* Total Highlights */}
              <div className="flex flex-col items-center justify-center py-6 flex-1 relative">
                <div className="absolute inset-0 bg-[#39FF14]/5 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex items-baseline gap-2 z-10">
                  <span className="font-display font-bold text-[#39FF14] text-5xl drop-shadow-[0_0_20px_rgba(57,255,20,0.4)] tracking-tighter">
                    {displayValor}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-6 w-full justify-center z-10">
                  <div className="flex flex-col items-center glass-panel px-4 py-2 rounded-lg border border-white/5">
                    <span className="font-label text-[10px] text-on-surface-variant">Valor Un.</span>
                    <span className="font-display font-semibold text-sm text-on-surface">{valUnitario}</span>
                  </div>
                  <X className="w-4 h-4 text-on-surface-variant" />
                  <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-lg border border-white/5">
                    <div className="flex flex-col items-center">
                      <span className="font-label text-[10px] text-on-surface-variant">Qtd.</span>
                      <input
                        className="bg-transparent font-display font-semibold text-sm text-on-surface w-10 text-center outline-none"
                        value={qtd}
                        onChange={(e) => setQtd(e.target.value)}
                        inputMode="decimal"
                      />
                    </div>
                    <select
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value as Unidade)}
                      className="bg-transparent text-xs text-[#00DCE5] font-label outline-none"
                    >
                      {UNIDADES.map((u) => (
                        <option key={u} value={u} className="bg-[#131318] text-white">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Numeric Keypad Container */}
              <div className="bg-[rgba(20,25,35,0.95)] backdrop-blur-2xl rounded-t-2xl p-4 -mx-6 -mb-6 border-t border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] mt-auto z-20">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0'].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleNumpad(n)}
                      className="h-14 rounded-xl bg-white/5 border border-white/5 font-display text-xl font-semibold text-on-surface hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center"
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => handleNumpad('back')}
                    className="h-14 rounded-xl bg-white/10 border border-white/10 font-display text-on-surface hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Delete className="w-5 h-5 text-on-surface-variant" />
                  </button>
                </div>

                <button
                  className={`w-full h-14 rounded-xl bg-[#39FF14] text-black font-display font-bold text-base flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.4)] active:scale-95 transition-all uppercase tracking-wide gap-2 ${
                    valFinal <= 0 ? 'opacity-50 pointer-events-none' : ''
                  }`}
                  onClick={handleSave}
                >
                  <Check className="w-5 h-5" /> Confirmar Registro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
